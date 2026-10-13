"""Robust Video Matting at FULL output resolution (deep-guided-filter refine) + edge colour decontamination.
Writes an RGBA clip (VP9 alpha) of [start, end] from a graded source, warming the recurrent state up first.
usage: rvm_hq.py <model.onnx> <src.mp4> <start> <end> <warmup_s> <out.webm>"""
import sys, subprocess, numpy as np, onnxruntime as ort
model, src, a, b, warm, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5]), sys.argv[6]
W, H, FPS = 1080, 1920, 30
s0 = max(0.0, a - warm)
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
dec = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-ss', f'{s0}', '-i', src, '-t', f'{b - s0}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-crf', '20', '-b:v', '0', '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', out], stdin=subprocess.PIPE)
rec = [np.zeros([1, 1, 1, 1], np.float32)] * 4
ds = np.array([0.33], np.float32)
skip = int(round((a - s0) * FPS)); n = 0; kept = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    x = img.transpose(2, 0, 1)[None].astype(np.float32) / 255
    fgr, pha, *rec = sess.run(None, {'src': x, 'r1i': rec[0], 'r2i': rec[1], 'r3i': rec[2], 'r4i': rec[3], 'downsample_ratio': ds})
    n += 1
    if n <= skip:
        continue
    al = np.clip(pha[0, 0], 0, 1)
    al = np.clip((al - 0.04) / 0.92, 0, 1)            # trim faint haze, keep hair
    fg = np.clip(fgr[0].transpose(1, 2, 0), 0, 1)     # RVM's predicted foreground colour (no wall spill)
    src_rgb = img.astype(np.float32) / 255
    k = np.clip((al - 0.6) / 0.35, 0, 1)[..., None]   # solid interior keeps the original pixels
    rgb = src_rgb * k + fg * (1 - k)
    enc.stdin.write(np.dstack([rgb, al[..., None]]).__mul__(255).astype(np.uint8).tobytes())
    kept += 1
enc.stdin.close(); enc.wait(); print('frames', kept)
