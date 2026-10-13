"""Wall-only cut-out layer.
Runs Robust Video Matting at full resolution on the graded source, then keeps EVERYTHING except the
wall behind her: the person, the bed, the pillows and the sheets stay real; only the light wall above a
contour line (pillow tops on the right, sheets on the left) becomes transparent so a new background,
words or motion design can sit behind her. Hair edges use RVM's de-spilled foreground colour.
usage: rvm_wall.py <model.onnx> <graded_src.mp4> <start> <end> <warmup_s> <out.webm>"""
import sys, subprocess, numpy as np, onnxruntime as ort
model, src, a, b, warm, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5]), sys.argv[6]
W, H, FPS = 1080, 1920, 30

# wall contour (x, y): below this line the room stays untouched
PTS = [(0, 1490), (300, 1490), (430, 1310), (560, 1150), (760, 1122), (1080, 1122)]
yb = np.interp(np.arange(W), [p[0] for p in PTS], [p[1] for p in PTS])
yy = np.arange(H)[:, None]
FEATHER = 22
wall = np.clip((yb[None, :] - yy) / FEATHER + 0.5, 0, 1).astype(np.float32)   # 1 = wall zone

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
    p = np.clip((np.clip(pha[0, 0], 0, 1) - 0.04) / 0.92, 0, 1)
    alpha = 1 - wall * (1 - p)                                   # person + room below the line
    fg = np.clip(fgr[0].transpose(1, 2, 0), 0, 1)
    orig = img.astype(np.float32) / 255
    use_fg = (wall * np.clip((0.97 - p) / 0.5, 0, 1))[..., None]  # de-spill only on hair/skin edges over the wall
    rgb = orig * (1 - use_fg) + fg * use_fg
    enc.stdin.write((np.dstack([rgb, alpha[..., None]]) * 255).astype(np.uint8).tobytes())
    kept += 1
enc.stdin.close(); enc.wait(); print('frames', kept)
