"""SFX library v2 — stereo, reverb tails, motion panning. Writes 48k/16-bit stereo WAVs."""
import numpy as np, wave, sys, os
from scipy import signal

SR = 48000
OUT = sys.argv[1]
rng = np.random.default_rng(11)


def t(d):
    return np.arange(int(SR * d)) / SR


def noise(d):
    return rng.standard_normal(int(SR * d))


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'lowpass', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'highpass', fs=SR, output='sos'), x)


def sweep_lp(x, f_env, block=256):
    """Time-varying low-pass (block-wise state-variable)."""
    y = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        f = float(np.clip(f_env[min(i, len(f_env) - 1)], 40, SR / 2.2))
        sos = signal.butter(2, f, 'lowpass', fs=SR, output='sos')
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        y[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
    return y


def reverb(x, size=1.2, mix=0.25, damp=3000):
    n = int(SR * size)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lp(ir, damp)
    ir /= np.sqrt(np.sum(ir ** 2))
    m = len(x) + n
    L = np.pad(signal.fftconvolve(x, ir), (0, 1))[:m]
    R = np.pad(signal.fftconvolve(x, np.roll(ir, 37)), (0, 1))[:m]
    dry = np.pad(x, (0, n))
    return np.stack([dry * (1 - mix) + L * mix, dry * (1 - mix) + R * mix], 1)


def pan(x, p):
    """p: -1..1 array or scalar, equal-power."""
    p = np.broadcast_to(p, x.shape)
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


def stereo(x):
    return x if x.ndim == 2 else np.stack([x, x], 1)


def save(name, x, peak_db=-1.0):
    x = stereo(x)
    # 3 ms fade-in / 20 ms fade-out to kill clicks
    fi, fo = int(0.003 * SR), int(0.02 * SR)
    x[:fi] *= np.linspace(0, 1, fi)[:, None]
    x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    return name


def env_peak(n, peak, a=2.2, r=1.6):
    tt = np.linspace(0, 1, n)
    return np.where(tt < peak, (tt / peak) ** a, ((1 - tt) / (1 - peak)) ** r)


# ---------------------------------------------------------------- whooshes
def whoosh(d, peak, f_lo, f_hi, body=0.0, pan_from=-0.7, pan_to=0.7, air=0.0):
    n = int(SR * d)
    e = env_peak(n, peak)
    x = noise(d)
    y = sweep_lp(x, f_lo + (f_hi - f_lo) * e) * e
    if air:
        y += hp(noise(d), 5000) * e ** 3 * air
    if body:
        ph = np.cumsum(55 + 110 * e) / SR
        y += body * np.sin(2 * np.pi * ph) * e
    st = pan(y, np.linspace(pan_from, pan_to, n))
    return st


save('whoosh_hollow', whoosh(0.7, 0.55, 200, 4500, body=0.25))
save('whoosh_deep', whoosh(1.0, 0.6, 120, 2600, body=0.6, pan_from=0.5, pan_to=-0.5))
save('whoosh_soft', whoosh(1.3, 0.6, 150, 1500, pan_from=-0.3, pan_to=0.3))
save('whoosh_trans', whoosh(0.8, 0.5, 250, 9000, body=0.35, air=0.4))
save('swish', whoosh(0.28, 0.45, 600, 12000, air=0.6, pan_from=-0.9, pan_to=0.9))

# ---------------------------------------------------------------- textures
tt = t(0.14)
f = 950 * np.exp(-tt * 38) + 230
save('pop', reverb(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 42), 0.4, 0.12))

tt = t(0.07)
save('click', reverb((hp(noise(0.07), 2000) * 0.5 + np.sin(2 * np.pi * 2600 * tt)) * np.exp(-tt * 110), 0.3, 0.1))

tt = t(0.05)
save('tick', hp(noise(0.05), 3000) * np.exp(-tt * 220) + np.sin(2 * np.pi * 3400 * tt) * np.exp(-tt * 160) * 0.6)

# camera shutter: two mechanical clacks
tt = t(0.22)
c1 = bp(noise(0.22), 1500, 9000) * np.exp(-tt * 90)
c2 = bp(noise(0.22), 1200, 7000) * np.exp(-np.maximum(tt - 0.07, 0) * 70) * (tt > 0.07) * 0.8
save('camera', reverb(c1 + c2, 0.35, 0.12))

# sci-fi / luxury impact: sub thump + glassy ping + air, long tail
tt = t(1.6)
thump = np.sin(2 * np.pi * np.cumsum(150 * np.exp(-tt * 9) + 45) / SR) * np.exp(-tt * 4.5)
ping = (np.sin(2 * np.pi * 1318.5 * tt) * 0.16 + np.sin(2 * np.pi * 1975.5 * tt) * 0.09) * np.exp(-tt * 3.5)
air = bp(noise(1.6), 2500, 12000) * np.exp(-tt * 10) * 0.35
save('scifi_impact', reverb(thump + ping + air, 1.6, 0.3))

# cinematic boom: sub drop with long reverb (hook / big moments)
tt = t(3.0)
boom = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-tt * 2.2) + 28) / SR) * np.exp(-tt * 1.6)
boom += lp(noise(3.0), 400) * np.exp(-tt * 5) * 0.8
boom += bp(noise(3.0), 2000, 8000) * np.exp(-tt * 18) * 0.25
save('boom', reverb(boom, 2.5, 0.35, 2000))

# impact hit (under risers)
tt = t(2.2)
hit = np.sin(2 * np.pi * np.cumsum(95 * np.exp(-tt * 6) + 36) / SR) * np.exp(-tt * 2.6)
hit += lp(noise(2.2), 900) * np.exp(-tt * 6) * 0.6
save('hit', reverb(hit, 1.8, 0.3, 2500))

# ---------------------------------------------------------------- risers
def riser(d, kind):
    tt = t(d); p = tt / d; e = p ** 2.4
    if kind == 'bass':
        fr = 38 + 240 * p ** 2
        y = np.sin(2 * np.pi * np.cumsum(fr) / SR) + 0.45 * np.sin(2 * np.pi * np.cumsum(fr * 2.01) / SR)
        y += sweep_lp(noise(d), 80 + 7000 * p ** 2) * 0.9
    else:
        y = sum(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.4 * p ** 2)) / SR) / (k + 1)
                for k, f0 in enumerate([523.25, 783.99, 1174.66, 1567.98]))
        y *= 1 + 0.5 * np.sin(2 * np.pi * (3 + 22 * p) * tt)
        y += sweep_lp(noise(d), 300 + 12000 * p ** 2) * 0.6
    y = y * e
    st = pan(y, 0.25 * np.sin(2 * np.pi * 1.5 * tt))
    st[-int(0.008 * SR):] *= np.linspace(1, 0, int(0.008 * SR))[:, None]
    return st


save('riser_bass', riser(2.0, 'bass'))
save('riser_metal', riser(2.0, 'metal'))

# reverse swell (pre-flash suck-in)
tt = t(1.2)
rv = reverb(bp(noise(1.2), 300, 9000) * np.exp(-tt * 4), 1.2, 0.5)[::-1]
save('reverse_swell', rv)

# shimmer / sparkle ("petit truc en plus")
tt = t(2.0)
sh = np.zeros_like(tt)
for i, f0 in enumerate([2093, 2637, 3136, 3951, 4186, 5274]):
    d0 = i * 0.06
    sh += np.sin(2 * np.pi * f0 * tt) * np.exp(-np.maximum(tt - d0, 0) * 5) * (tt >= d0) / (1 + i * 0.3)
sh += hp(noise(2.0), 7000) * np.exp(-tt * 4) * 0.15
save('shimmer', reverb(sh, 1.5, 0.4, 9000))

# fire whoosh: roaring noise burst + crackles
d = 1.6; tt = t(d)
e = env_peak(len(tt), 0.3, 1.5, 1.2)
roar = sweep_lp(noise(d), 200 + 2500 * e) * e
cr = np.zeros_like(tt)
for _ in range(60):
    i = rng.integers(0, len(tt) - 400)
    cr[i:i + 400] += rng.uniform(0.3, 1) * hp(noise(400 / SR), 2500) * np.exp(-np.arange(400) / 40)
save('fire_whoosh', pan(roar + cr * 0.35 * e, np.linspace(-0.4, 0.4, len(tt))))

# fire bed (crackle ambience, loops under fire scenes)
d = 4.0; tt = t(d)
bed = lp(noise(d), 500) * 0.5 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.6 * tt))
for _ in range(220):
    i = rng.integers(0, len(tt) - 600)
    bed[i:i + 600] += rng.uniform(0.2, 1) * hp(noise(600 / SR), 2000) * np.exp(-np.arange(600) / rng.uniform(20, 90))
save('fire_bed', pan(bed, 0.3 * np.sin(2 * np.pi * 0.2 * tt)), -6)

# liquid bloop / pour (ink + gold b-roll)
tt = t(0.5)
blp = np.sin(2 * np.pi * np.cumsum(300 + 900 * (1 - np.exp(-tt * 18))) / SR) * np.exp(-tt * 14)
save('liquid', reverb(blp + bp(noise(0.5), 400, 3000) * np.exp(-tt * 9) * 0.25, 0.8, 0.3))

# deep underwater swell for ink b-roll
d = 2.5; tt = t(d)
uw = sweep_lp(noise(d), 100 + 900 * env_peak(len(tt), 0.5)) * env_peak(len(tt), 0.5, 1.5, 1.5)
uw += np.sin(2 * np.pi * 55 * tt) * env_peak(len(tt), 0.5) * 0.3
save('underwater', pan(uw, np.linspace(0.6, -0.6, len(tt))))

# success / reward
tt = t(1.8)
su = sum(np.sin(2 * np.pi * f0 * tt) * np.exp(-np.maximum(tt - d0, 0) * 3) * (tt >= d0)
         for f0, d0 in [(784, 0), (987.8, 0.08), (1174.7, 0.16), (1568, 0.24)])
save('success', reverb(su, 1.4, 0.35, 8000))

# heartbeat-ish low double thump (tension under hook)
tt = t(0.9)
hb = sum(np.sin(2 * np.pi * np.cumsum(60 * np.exp(-np.maximum(tt - d0, 0) * 10) + 40) / SR)
         * np.exp(-np.maximum(tt - d0, 0) * 12) * (tt >= d0) * g for d0, g in [(0, 1), (0.22, 0.7)])
save('heartbeat', hb)

# glitch / digital HUD blip
tt = t(0.25)
gl = np.sign(np.sin(2 * np.pi * 880 * tt)) * (np.floor(tt * 60) % 2) * np.exp(-tt * 12) * 0.5
gl += hp(noise(0.25), 4000) * (rng.random(len(tt)) > 0.6) * np.exp(-tt * 14) * 0.3
save('glitch', gl)

print('ok')
