"""Depth maps for 3D photo parallax (Depth Anything V2 small, ONNX).

usage: python3 -I scripts/depth.py <model.onnx> <img1> [<img2> ...]
Writes <img>.depth.png next to each image (8-bit, white = near), slightly blurred so the
parallax shader does not tear at edges. Model:
https://github.com/fabio-sim/Depth-Anything-ONNX/releases/download/v2.0.0/depth_anything_v2_vits.onnx
"""
import sys
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

model, imgs = sys.argv[1], sys.argv[2:]
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
inp = sess.get_inputs()[0]
fixed = [d if isinstance(d, int) else None for d in inp.shape]
for path in imgs:
    im = Image.open(path).convert('RGB')
    W, H = im.size
    if fixed[2] and fixed[3]:
        h, w = fixed[2], fixed[3]
    else:  # dynamic: keep aspect, long side 518, multiples of 14
        s = 518 / max(W, H)
        h, w = max(14, round(H * s / 14) * 14), max(14, round(W * s / 14) * 14)
    x = np.asarray(im.resize((w, h), Image.BICUBIC), dtype=np.float32) / 255.0
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    d = np.squeeze(sess.run(None, {inp.name: x})[0]).astype(np.float32)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99.5)
    d = np.clip((d - lo) / max(1e-6, hi - lo), 0, 1)
    out = Image.fromarray((d * 255).astype(np.uint8)).resize((min(W, 1024), round(min(W, 1024) * H / W)), Image.BICUBIC)
    out = out.filter(ImageFilter.GaussianBlur(2.5))
    dst = path.rsplit('.', 1)[0] + '.depth.png'
    out.save(dst)
    print(dst, out.size, f'input {w}x{h}')
