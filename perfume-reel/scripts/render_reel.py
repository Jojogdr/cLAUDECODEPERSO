"""One-command render of a reel from its EDL.

usage: python3 -I scripts/render_reel.py edl/<id>.json [edl/<id>.post.json] [--concurrency N] [--skip-pass1] [--remix-audio]
  --remix-audio : sound-only iteration — remix the SFX stem + voice + music with ffmpeg and re-finish the
                  already rendered picture (out/<id>_gl.mp4), no Remotion render (seconds instead of minutes)

Steps
  1. SFX stem   : scripts/mix_sfx.py with edl.sfx (client bank under public/sfx_bank, levels relative to the voice)
  2. pass 1     : Remotion composition "Reel" with the EDL as props (hard cuts at GL points) -> out/<id>_clean.mp4
  3. frames     : scripts/gl_post_frames.py extracts the frames around each GL cut -> public/post/<id>/
  4. pass 2     : Remotion composition "GlPost" applies gl-transitions + flash/leak -> out/<id>_gl.mp4 (silent)
  5. finish     : mux pass-1 audio, loudnorm -14 LUFS / -1 dBTP, H.264 ~4.6 Mb/s (< 30 MB for 22-30 s) -> out/<id>.mp4
Run from the project root (perfume-reel/).
"""
import json, os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
args = [a for a in sys.argv[1:] if not a.startswith('--')]
conc = '3'
if '--concurrency' in sys.argv:
    conc = sys.argv[sys.argv.index('--concurrency') + 1]
    args = [a for a in args if a != conc]
edl_path = args[0]
post_path = args[1] if len(args) > 1 else None
edl = json.load(open(edl_path))
rid = edl['id']
os.makedirs('out', exist_ok=True)


def run(cmd, **kw):
    print('$', ' '.join(cmd) if isinstance(cmd, list) else cmd, flush=True)
    subprocess.run(cmd, check=True, **kw)


# 1. SFX stem
if edl.get('sfx'):
    cues = f'out/{rid}_sfx.json'
    json.dump(edl['sfx'], open(cues, 'w'))
    run(['python3', '-I', 'scripts/mix_sfx.py', 'public', cues, 'sfx_bank', edl['voice'], os.path.join('public', edl['sfxStem']), str(edl['duration']), '3'])

# 2. pass 1
props = f'out/{rid}_props.json'
json.dump({'edl': edl}, open(props, 'w'), ensure_ascii=False)
clean = f'out/{rid}_clean.mp4'
remix = '--remix-audio' in sys.argv
if '--skip-pass1' not in sys.argv and not remix:
    run(['npx', 'remotion', 'render', 'src/index.ts', 'Reel', clean, f'--props={props}', '--codec=h264', '--crf=16', '--audio-bitrate=320k', f'--concurrency={conc}'],
        stdout=subprocess.DEVNULL)

final_video = clean
if post_path and remix and os.path.exists(f'out/{rid}_gl.mp4'):
    final_video = f'out/{rid}_gl.mp4'
elif post_path:
    post = json.load(open(post_path))
    # 3. frames
    fdir = f'post/{rid}'
    shutil.rmtree(os.path.join('public', fdir), ignore_errors=True)
    run(['python3', '-I', 'scripts/gl_post_frames.py', clean, post_path, os.path.join('public', fdir)])
    shutil.copy(clean, os.path.join('public', fdir, 'clean.mp4'))
    # 4. pass 2
    gprops = f'out/{rid}_glprops.json'
    json.dump({'video': f'{fdir}/clean.mp4', 'framesDir': fdir, 'fps': post['fps'], 'duration': edl['duration'], 'cuts': post['cuts']}, open(gprops, 'w'))
    final_video = f'out/{rid}_gl.mp4'
    run(['npx', 'remotion', 'render', 'src/index.ts', 'GlPost', final_video, f'--props={gprops}', '--codec=h264', '--crf=16', '--muted', f'--concurrency={conc}'],
        stdout=subprocess.DEVNULL)

# 5. finish: audio from pass 1 (or a fresh ffmpeg remix), two-pass loudnorm, share-size encode
audio_src = clean
if remix:  # same mix as the Remotion composition: voice + SFX stem + music at a fixed level with fades
    mu, d = edl.get('music'), edl['duration']
    ins = ['-i', f"public/{edl['voice']}", '-i', f"public/{edl['sfxStem']}"]
    fc = '[0:a]aformat=sample_rates=48000:channel_layouts=stereo[v];[1:a]aformat=sample_rates=48000:channel_layouts=stereo[s];'
    n = 2
    if mu:
        ins += ['-i', f"public/{mu['src']}"]
        fo = mu.get('fadeOut', 0.8)
        fc += (f"[2:a]atrim=start={mu['offset']},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,volume={mu['db']}dB,"
               f"afade=t=in:d={mu.get('fadeIn', 0.25)},afade=t=out:st={d - fo}:d={fo}[m];")
        n = 3
    fc += ''.join(['[v]', '[s]', '[m]' if mu else '']) + f'amix=inputs={n}:normalize=0:duration=first,atrim=end={d}[a]'
    audio_src = f'out/{rid}_mix.wav'
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '[a]', '-c:a', 'pcm_s16le', audio_src])
meas = subprocess.run(['ffmpeg', '-nostdin', '-i', audio_src, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(meas[meas.rindex('{'):])
ln = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
out = f'out/{rid}.mp4'
grade = ['-vf', edl['grade']] if edl.get('grade') else []  # the look (colour, grain, vignette) over everything
run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', final_video, '-i', audio_src, '-map', '0:v', '-map', '1:a', *grade, '-c:v', 'libx264', '-preset', 'slow', '-b:v', '4600k',
     '-maxrate', '9000k', '-bufsize', '12000k', '-af', ln, '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', out])
print('done ->', out, os.path.getsize(out) // 1024, 'KB')
