import os, json, subprocess, sys
import numpy as np
from scipy.io import wavfile
ROOT = "/home/user/cLAUDECODEPERSO/perfume-reel/public/sfx_bank"
OUT = "/home/user/cLAUDECODEPERSO/perfume-reel/research/sfx_catalog.json"
def load(p):
    if p.endswith(".wav"):
        try:
            sr, d = wavfile.read(p)
            d = d.astype(np.float64)
            if d.dtype.kind != 'f':
                pass
            return sr, d
        except Exception:
            pass
    raw = subprocess.run(["ffmpeg","-v","quiet","-i",p,"-f","f32le","-ac","2","-ar","48000","-"],capture_output=True).stdout
    return 48000, np.frombuffer(raw, dtype=np.float32).reshape(-1,2).astype(np.float64)
def norm(p):
    sr, d = load(p)
    raw = wavfile.read(p)[1] if p.endswith(".wav") else None
    if raw is not None:
        k = raw.dtype
        d = raw.astype(np.float64)
        d = d/(2147483648.0 if k==np.int32 else 32768.0 if k==np.int16 else 128.0 if k==np.uint8 else 1.0) if k!=np.uint8 else (d-128)/128
    return sr, d
res = []
for dp, _, fs in sorted(os.walk(ROOT)):
    for f in sorted(fs):
        if not f.endswith((".wav",".mp3")): continue
        p = os.path.join(dp, f)
        try:
            sr, d = norm(p) if f.endswith(".wav") else load(p)
            x = d.mean(axis=1) if d.ndim>1 else d
            n = len(x); dur = n/sr
            pk = np.abs(d).max()
            rms = np.sqrt(np.mean(x**2))
            w = max(1,int(sr*0.01))
            e = np.convolve(x**2, np.ones(w), 'valid')
            tpos = (int(np.argmax(e)) + w/2)/sr
            S = np.abs(np.fft.rfft(x)); fr = np.fft.rfftfreq(n, 1/sr)
            cen = float((fr*S).sum()/max(S.sum(),1e-12))
            P = S**2; low = float(P[fr<150].sum()/max(P.sum(),1e-12))
            db = lambda v: float(20*np.log10(max(v,1e-9)))
            res.append(dict(file=os.path.relpath(p,ROOT), dur=round(dur,3), peak_db=round(db(pk),1), rms_db=round(db(rms),1),
                transient_s=round(tpos,3), centroid_hz=round(cen), low_ratio=round(low,3)))
        except Exception as ex:
            res.append(dict(file=os.path.relpath(p,ROOT), error=str(ex)))
json.dump(res, open(OUT,"w"), indent=1)
print(len(res))
for r in res:
    if 'error' in r: print(r); continue
    print(f"{r['file'][:-4]}|{r['dur']}|{r['peak_db']}|{r['rms_db']}|{r['transient_s']}|{r['centroid_hz']}|{r['low_ratio']}")
