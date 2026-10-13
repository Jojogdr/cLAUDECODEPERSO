import numpy as np, wave, sys, os
SR=48000; out=sys.argv[1]; rng=np.random.default_rng(7)
def save(n,x):
    x=x/ (np.max(np.abs(x))+1e-9)*0.89
    st=np.stack([x,x],1)
    with wave.open(os.path.join(out,n+'.wav'),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype(np.int16).tobytes())
def lp(x,a):  # one-pole lowpass, a in 0..1 (array ok)
    y=np.zeros_like(x);s=0.0;a=np.broadcast_to(a,x.shape)
    for i in range(len(x)): s+=a[i]*(x[i]-s); y[i]=s
    return y
def t(d): return np.arange(int(SR*d))/SR
# whoosh: noise, sweeping lowpass, peak at given fraction
def whoosh(d,peak,lo,hi,body=0.0):
    n=len(t(d)); x=rng.standard_normal(n); tt=np.linspace(0,1,n)
    env=np.where(tt<peak,(tt/peak)**2.2,((1-tt)/(1-peak))**1.6)
    a=lo+(hi-lo)*env
    y=lp(lp(x,a),a)*env
    if body: y+=body*np.sin(2*np.pi*np.cumsum(60+90*env)/SR)*env
    return y
save('whoosh_hollow',whoosh(0.7,0.55,0.01,0.18,0.3))
save('whoosh_deep',whoosh(1.0,0.6,0.005,0.12,0.6))
save('whoosh_soft',whoosh(1.2,0.6,0.004,0.06))
save('whoosh_trans',whoosh(0.8,0.5,0.01,0.35,0.4))
# pop
tt=t(0.12); f=900*np.exp(-tt*40)+250; save('pop',np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*45))
# ui click
tt=t(0.06); save('click',(rng.standard_normal(len(tt))*0.5+np.sin(2*np.pi*2400*tt))*np.exp(-tt*120))
# scifi impact: low thump + bright noise tail + tonal ping
tt=t(1.4); thump=np.sin(2*np.pi*np.cumsum(140*np.exp(-tt*8)+42)/SR)*np.exp(-tt*5)
nz=lp(rng.standard_normal(len(tt)),0.25)*np.exp(-tt*9)*0.5
ping=np.sin(2*np.pi*1320*tt)*np.exp(-tt*6)*0.15+np.sin(2*np.pi*1980*tt)*np.exp(-tt*7)*0.08
save('scifi_impact',thump+nz+ping)
# hit (deep cinematic)
tt=t(2.2); save('hit',np.sin(2*np.pi*np.cumsum(90*np.exp(-tt*6)+35)/SR)*np.exp(-tt*2.5)+lp(rng.standard_normal(len(tt)),0.08)*np.exp(-tt*4)*0.6)
# risers
def riser(d,kind):
    tt=t(d); p=tt/d; env=p**2.5
    if kind=='bass':
        f=40+260*p**2; y=np.sin(2*np.pi*np.cumsum(f)/SR)+0.4*np.sin(2*np.pi*np.cumsum(f*2.01)/SR)
        y+=lp(rng.standard_normal(len(tt)),0.02+0.3*p)*0.8
    else:
        y=sum(np.sin(2*np.pi*np.cumsum(fr*(1+1.5*p**2))/SR)/(k+1) for k,fr in enumerate([523,787,1131,1607]))
        y*= (1+0.5*np.sin(2*np.pi*(4+20*p)*tt))
        y+=lp(rng.standard_normal(len(tt)),0.05+0.5*p)*0.6
    y=y*env; y[-int(0.01*SR):]*=np.linspace(1,0,int(0.01*SR)); return y
save('riser_bass',riser(2.0,'bass')); save('riser_metal',riser(2.0,'metal'))
# camera click
tt=t(0.15); save('camera',rng.standard_normal(len(tt))*(np.exp(-tt*80)+0.6*np.exp(-np.maximum(tt-0.05,0)*90)*(tt>0.05)))
# success shimmer
tt=t(1.6); save('success',sum(np.sin(2*np.pi*f*tt)*np.exp(-np.maximum(tt-d,0)*3)*(tt>=d) for f,d in [(784,0),(988,0.08),(1175,0.16),(1568,0.24)]))
# gears tick
tt=t(0.04); save('tick',rng.standard_normal(len(tt))*np.exp(-tt*200)+np.sin(2*np.pi*3200*tt)*np.exp(-tt*150))
