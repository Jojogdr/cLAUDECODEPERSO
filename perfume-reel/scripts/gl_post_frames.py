"""Extract the frames GlPost needs around each GL cut (pass 2 of the render).

usage: python3 -I gl_post_frames.py <clean.mp4> <post.json> <out_dir>
post.json = {"fps": 30, "cuts": [{"at": 0.95, "frames": 10, ...}, ...]}
For a cut at frame C with a window [a, b): outgoing frames a..C-1 and incoming C..b-1 are written as fNNNNN.png.
"""
import json, math, os, subprocess, sys

clean, post_json, out = sys.argv[1], sys.argv[2], sys.argv[3]
post = json.load(open(post_json))
fps = post['fps']
os.makedirs(out, exist_ok=True)
need = set()
for c in post['cuts']:
    cut_f = math.floor(c['at'] * fps + 0.5)  # same rounding as JS Math.round in GlPost
    a = cut_f - c['frames'] // 2
    need.update(range(a, a + c['frames']))
need = sorted(need)
expr = '+'.join(f'eq(n\\,{n})' for n in need)
tmp = os.path.join(out, 'tmp_%05d.png')
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', clean, '-vf', f"select='{expr}'", '-vsync', '0', tmp], check=True)
for i, n in enumerate(need, start=1):
    os.replace(os.path.join(out, f'tmp_{i:05d}.png'), os.path.join(out, f'f{n:05d}.png'))
print(f'{len(need)} frames -> {out}')
