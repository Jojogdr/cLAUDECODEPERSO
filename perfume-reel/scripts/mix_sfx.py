"""Render the SFX stem offline, levelled RELATIVE TO THE VOICE.

Each cue: (sound, time_s, rel_db, align)
  rel_db  = loudness of the sound's loudest 100 ms vs. the voice's average speech RMS
  align   = 'start' | 'peak' (loudest point on time_s) | 'end' (file end on time_s)
The stem is also ducked a few dB while she speaks so effects never mask words.
Usage: python3 -I mix_sfx.py <public_dir> <out_wav> <duration_s>
"""
import sys, json, wave, os
import numpy as np

PUB, OUT, DUR = sys.argv[1], sys.argv[2], float(sys.argv[3])
SR = 48000

CUES = [
    # --- hook ---------------------------------------------------------
    ('boom',          0.00, -12, 'start'),   # opening hit on the flame macro
    ('whoosh_trans',  0.08, -20, 'peak'),
    ('swish',         1.30, -22, 'peak'),    # cut to her
    ('riser_bass',    2.28, -18, 'end'),     # builds under the hook line
    ('reverse_swell', 2.28, -18, 'end'),     # into the white flash
    ('hit',           2.28, -12, 'start'),   # lands "Aujourd'hui"
    # --- body ---------------------------------------------------------
    ('whoosh_trans',  4.90, -20, 'peak'),    # product card rises
    ('whoosh_deep',   6.72, -22, 'peak'),    # back to her
    ('whoosh_soft',   8.38, -22, 'peak'),    # background → wood
    ('swish',         9.38, -24, 'peak'),    # background → smoke
    ('whoosh_trans', 10.90, -20, 'peak'),    # into gold liquid
    ('underwater',   10.90, -24, 'start'),
    ('hit',          13.11, -18, 'start'),   # AUDACIEUX
    ('swish',        14.00, -22, 'peak'),    # product cut
    ('whoosh_hollow',15.42, -22, 'peak'),    # back to her
    ('hit',          15.79, -18, 'start'),   # stamp
    ('whoosh_soft',  17.20, -24, 'peak'),    # slider travel
    ('shimmer',      19.42, -18, 'start'),   # "petit truc en plus"
    ('whoosh_soft',  21.90, -22, 'peak'),    # pastel world
    ('swish',        24.24, -22, 'peak'),    # swatches
    ('riser_bass',   26.18, -16, 'end'),     # pastel → amber contrast
    ('hit',          26.18, -12, 'start'),
    ('whoosh_deep',  28.60, -20, 'peak'),    # notes ambrées
    ('underwater',   28.60, -24, 'start'),
    ('fire_whoosh',  30.20, -20, 'peak'),    # fire background
    ('boom',         32.10, -16, 'start'),   # PLUS PUISSANT
    ('whoosh_hollow',32.56, -22, 'peak'),
    ('reverse_swell',34.51, -16, 'end'),     # into the music drop
    ('boom',         34.51, -11, 'start'),   # PERCUTANT (loudest moment)
    ('whoosh_trans', 35.45, -20, 'peak'),    # into "empreinte"
    ('underwater',   35.45, -24, 'start'),
    ('whoosh_hollow',38.28, -22, 'peak'),
    ('whoosh_deep',  42.45, -20, 'peak'),    # end card
    ('shimmer',      43.74, -20, 'start'),   # recommendation
]
DUCK_DB = 5.0


def load(path):
    with wave.open(path) as w:
        sr, ch = w.getframerate(), w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    x = x.reshape(-1, ch)
    if ch == 1:
        x = np.repeat(x, 2, 1)
    assert sr == SR, (path, sr)
    return x


def rms_windows(m, ms=100):
    h = int(SR * ms / 1000)
    return np.array([np.sqrt(np.mean(m[i:i + h] ** 2)) for i in range(0, max(1, len(m) - h), h // 4)]), h // 4


voice = load(os.path.join(PUB, 'voice_v3.wav')).mean(1)
vr, _ = rms_windows(voice, 400)
voice_ref = np.mean(vr[vr > np.percentile(vr, 40)])

n = int(DUR * SR)
stem = np.zeros((n, 2))
log = []
for name, at, rel, align in CUES:
    x = load(os.path.join(PUB, 'sfx2', name + '.wav'))
    r, hop = rms_windows(x.mean(1))
    peak_rms, peak_i = r.max(), int(r.argmax()) * hop + int(SR * 0.05)
    gain = voice_ref * 10 ** (rel / 20) / peak_rms
    if align == 'start':
        s0 = int(at * SR)
    elif align == 'peak':
        s0 = int(at * SR) - peak_i
    else:
        s0 = int(at * SR) - len(x)
    a, b = max(0, s0), min(n, s0 + len(x))
    stem[a:b] += x[a - s0:b - s0] * gain
    log.append((name, at, rel, round(20 * np.log10(gain), 1)))

# duck under speech (smoothed voice envelope)
env = np.convolve(np.abs(voice), np.ones(int(SR * 0.08)) / int(SR * 0.08), 'same')
env = env[:n] if len(env) >= n else np.pad(env, (0, n - len(env)))
speaking = np.clip((20 * np.log10(env + 1e-9) - (20 * np.log10(voice_ref) - 12)) / 6, 0, 1)
duck = 10 ** (-DUCK_DB * speaking / 20)
stem *= duck[:, None]

peak = np.max(np.abs(stem))
print('voice ref RMS dBFS', round(20 * np.log10(voice_ref), 1), '| stem peak dBFS', round(20 * np.log10(peak), 1))
for l in log:
    print(*l)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(stem, -1, 1) * 32767).astype(np.int16).tobytes())
