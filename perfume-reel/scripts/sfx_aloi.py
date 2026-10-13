"""Recreated 'ALOI' style UI sound bank — short, bright, Apple-like interface sounds.

No sub/bass content, no synth beeps: glassy partials, crisp clicks, airy swooshes.
All 48 kHz stereo, peak-normalised, clean 3 ms fade-in / 15 ms fade-out.
Usage: python3 -I sfx_aloi.py <out_dir>
"""
import os, sys, wave
import numpy as np
from scipy import signal

SR = 48000
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(3)


def t(d):
    return np.arange(int(SR * d)) / SR


def hp(x, f, o=2):
    return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)


def bp(x, lo, hi, o=2):
    return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)


def room(x, size=0.35, mix=0.12):
    """Tiny bright room — keeps sounds 'expensive' without a long tail."""
    n = int(SR * size)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 9, n))
    ir = hp(ir, 1500)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = signal.fftconvolve(x, ir)[: len(x) + n]
    dry = np.pad(x, (0, n))
    wet = np.pad(wet, (0, len(dry) - len(wet)))
    return dry * (1 - mix) + wet * mix


def stereo(x, width=0.0):
    if width == 0:
        return np.stack([x, x], 1)
    d = int(SR * 0.0006)
    return np.stack([x, np.concatenate([np.zeros(d), x[:-d]]) * (1 - width) + x * width], 1)


def save(name, x, width=0.25):
    x = stereo(np.asarray(x, float), width)
    fi, fo = int(0.003 * SR), int(0.015 * SR)
    x[:fi] *= np.linspace(0, 1, fi)[:, None]
    x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (-1 / 20)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def partials(f0, ratios, amps, decays, d):
    tt = t(d)
    return sum(a * np.sin(2 * np.pi * f0 * r * tt) * np.exp(-tt * k) for r, a, k in zip(ratios, amps, decays))


# macOS-style Pop: short rounded "bubble" pop, pitch drops quickly
tt = t(0.09)
f = 1400 * np.exp(-tt * 70) + 520
pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 55)
pop += hp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt * 400) * 0.15
save('pop', room(pop, 0.2, 0.08))

# macOS-style Tink: tiny metallic tick, high inharmonic partials
save('tink', room(partials(3150, [1, 1.51, 2.74, 4.1], [1, .5, .3, .12], [55, 70, 90, 120], 0.16), 0.25, 0.1))

# macOS-style Glass: clear glass ding with a soft shimmer
save('glass', room(partials(1760, [1, 2.0, 2.76, 5.4], [1, .25, .35, .12], [7, 9, 12, 20], 0.9), 0.5, 0.18))

# Hero: rising glassy three-note flourish (end / celebration)
tt = t(1.3)
hero = np.zeros_like(tt)
for f0, d0 in [(1318.5, 0.0), (1760.0, 0.07), (2637.0, 0.14)]:
    m = tt >= d0
    hero[m] += partials(f0, [1, 2.76], [1, .25], [5, 9], 1.3)[: m.sum()]
save('hero', room(hero, 0.6, 0.2))

# Apple Pay success: two soft chimes, second higher
tt = t(0.9)
ap = partials(1567.98, [1, 2.0, 3.0], [1, .2, .08], [8, 12, 16], 0.9)
m = tt >= 0.11
ap[m] += partials(2093.0, [1, 2.0, 3.0], [1, .2, .08], [7, 11, 15], 0.9)[: m.sum()] * 0.9
save('applepay', room(ap, 0.4, 0.15))

# iMessage-style send: quick airy upward swoosh with a faint tone glide
d = 0.32; tt = t(d)
e = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 2
nz = rng.standard_normal(len(tt))
sw = np.zeros_like(tt)
for i in range(0, len(tt), 256):  # band rises 1.2k -> 7k
    c = 1200 + 5800 * (i / len(tt)) ** 1.3
    sw[i:i + 256] = bp(nz[max(0, i - 2048):i + 256], c * 0.7, min(c * 1.4, 20000))[-len(sw[i:i + 256]):]
tone = np.sin(2 * np.pi * np.cumsum(900 + 1400 * (tt / d)) / SR) * 0.12
save('send', (sw + tone) * e, 0.5)

# UI swoosh: short, airy, high-passed (transitions)
def swoosh(d, peak, lo, hi, gain=1.0):
    tt = t(d)
    p = tt / d
    e = np.where(p < peak, (p / peak) ** 2, ((1 - p) / (1 - peak)) ** 1.5)
    nz = rng.standard_normal(len(tt))
    y = np.zeros_like(tt)
    for i in range(0, len(tt), 256):
        c = lo + (hi - lo) * e[i]
        seg = bp(nz[max(0, i - 2048):i + 256], c * 0.6, min(c * 1.6, 20000))
        y[i:i + 256] = seg[-len(y[i:i + 256]):]
    pan = np.linspace(-0.6, 0.6, len(tt))
    a = (pan + 1) * np.pi / 4
    return np.stack([y * e * np.cos(a), y * e * np.sin(a)], 1) * gain


def save_st(name, x):
    fi, fo = int(0.003 * SR), int(0.015 * SR)
    x[:fi] *= np.linspace(0, 1, fi)[:, None]
    x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (-1 / 20)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


save_st('swoosh', swoosh(0.36, 0.45, 1500, 7000))
save_st('swoosh_soft', swoosh(0.6, 0.5, 1000, 4500))

# iPhone lock click: crisp, dry
tt = t(0.05)
lk = hp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 260) + partials(2600, [1, 1.6], [.6, .3], [180, 220], 0.05)
save('lock', lk, 0.0)

# iPhone shutter: two crisp clicks
tt = t(0.16)
c1 = hp(rng.standard_normal(len(tt)), 2000) * np.exp(-tt * 180)
c2 = hp(rng.standard_normal(len(tt)), 1800) * np.exp(-np.maximum(tt - 0.065, 0) * 150) * (tt >= 0.065) * 0.8
save('shutter', room(c1 + c2, 0.2, 0.1), 0.1)

# Glass shine: quick high sparkle sweep (reveals)
tt = t(0.7)
sh = np.zeros_like(tt)
for i in range(14):
    d0 = i * 0.018 + rng.uniform(0, 0.01)
    f0 = 2800 * 2 ** (i / 9)
    m = tt >= d0
    sh[m] += np.sin(2 * np.pi * f0 * (tt[m] - d0)) * np.exp(-(tt[m] - d0) * 22) * (0.6 + 0.4 * rng.random())
sh += hp(rng.standard_normal(len(tt)), 7000) * np.exp(-tt * 9) * 0.08
save('shine', room(sh, 0.5, 0.2), 0.6)

print(sorted(os.listdir(OUT)))
