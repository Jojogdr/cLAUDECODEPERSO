import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, random, spring, staticFile} from 'remotion';
import type {Edl, Fx} from './types';
import {useEdl, useT, expo, clamp, camAt} from './ctx';

/* =====================================================================
   "Punch" layer — one literal visual per punchline, the way short-form
   that holds attention works: a phone that lights up, a badge that pops
   next to the speaker, a gauge that fills, a fingerprint that draws
   itself, an impact, a persistent brand frame and a closing card.
   Everything is code (no stock, no generation) so it costs nothing per video.
   ===================================================================== */

const pop = (edl: Edl, t: number, at: number, damping = 14) =>
  spring({frame: Math.round((t - at) * edl.fps), fps: edl.fps, config: {damping, mass: 0.6, stiffness: 170}});
const out = (t: number, to: number, d = 0.16) => interpolate(t, [to - d, to], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});

/* ------------------------------------------------ brand frame (always) */
const BrandFrame: React.FC<{fx: Extract<Fx, {kind: 'brand'}>}> = ({fx}) => {
  const edl = useEdl();
  const t = useT();
  const p = t / edl.duration;
  const c = fx.color ?? '#fff';
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 60, top: 150, fontFamily: edl.theme.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.16em', color: c, opacity: 0.9, textShadow: '0 1px 6px rgba(0,0,0,0.4)'}}>{fx.label}</div>
      <div style={{position: 'absolute', right: 60, top: 142, fontFamily: edl.theme.sans, fontWeight: 300, fontSize: 34, letterSpacing: '0.06em', color: c, opacity: 0.95, textShadow: '0 1px 6px rgba(0,0,0,0.4)'}}>{fx.mark}</div>
      <div style={{position: 'absolute', left: 60, right: 60, bottom: 300, height: 3, background: 'rgba(255,255,255,0.22)', borderRadius: 2}}>
        <div style={{width: `${p * 100}%`, height: '100%', background: fx.accent ?? '#fff', borderRadius: 2}} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- icons */
const ICONS: Record<string, React.ReactNode> = {
  moustache: <path d="M50 46c-6-10-20-14-30-8-6 4-9 12-16 13 5 7 15 9 24 6 9-3 15-9 22-11 7 2 13 8 22 11 9 3 19 1 24-6-7-1-10-9-16-13-10-6-24-2-30 8z" fill="currentColor" />,
  lips: <path d="M8 50c10-14 24-20 32-14 4 3 6 3 10 0 4 3 6 3 10 0 8-6 22 0 32 14-12 16-28 24-42 24S20 66 8 50zm8 0c12 4 28 6 34 6s22-2 34-6" fill="currentColor" stroke="currentColor" strokeWidth={0} />,
  flame: <path d="M50 8c4 18 22 26 22 46a22 22 0 0 1-44 0c0-10 6-16 10-22 2 8 6 12 10 12-4-12 0-26 2-36z" fill="currentColor" />,
  drop: <path d="M50 10C40 30 26 44 26 60a24 24 0 0 0 48 0c0-16-14-30-24-50z" fill="currentColor" />,
};

/* ----------------------------------------------------------- badge */
const Badge: React.FC<{fx: Extract<Fx, {kind: 'badge'}>}> = ({fx}) => {
  const edl = useEdl();
  const t = useT();
  if (t < fx.from || t >= fx.to) return null;
  const p = pop(edl, t, fx.from, 12);
  const o = out(t, fx.to);
  const r = fx.size ?? 230;
  const cam = 1 + (camAt(edl, t) - 1) * 0.6;
  const fl = Math.sin((t - fx.from) * 2.2) * 6;
  const ring = fx.ring ?? '#E9C98F';
  return (
    <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: edl.base.origin ?? '50% 32%'}}>
      <div style={{position: 'absolute', left: fx.x - r / 2, top: fx.y - r / 2 + fl, width: r, height: r, borderRadius: '50%', overflow: 'hidden',
        transform: `scale(${p * o}) rotate(${(1 - p) * -25}deg)`, border: `${Math.round(r * 0.045)}px solid ${ring}`, background: fx.bg ?? '#141210',
        boxShadow: '0 18px 40px rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', color: fx.color ?? ring}}>
        {fx.image ? <Img src={staticFile(fx.image)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: fx.pos ?? '50% 50%', transform: `scale(${1.15 - 0.1 * p})`}} /> : null}
        {fx.video ? <Sequence from={Math.round(fx.from * edl.fps)} layout="none"><OffthreadVideo src={staticFile(fx.video)} muted trimBefore={Math.round((fx.offset ?? 0) * edl.fps)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence> : null}
        {fx.icon ? <svg viewBox="0 0 100 100" style={{width: '62%', height: '62%'}}>{ICONS[fx.icon]}</svg> : null}
        {fx.text ? <div style={{fontFamily: edl.theme.sans, fontWeight: 800, fontSize: r * 0.34, letterSpacing: '-0.04em', color: fx.color ?? ring}}>{fx.text}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------- notifications */
const Notifs: React.FC<{fx: Extract<Fx, {kind: 'notifs'}>}> = ({fx}) => {
  const edl = useEdl();
  const t = useT();
  if (t < fx.from || t >= fx.to) return null;
  const o = out(t, fx.to, 0.12);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {fx.items.map((n, i) => {
        if (t < n.at) return null;
        const p = pop(edl, t, n.at, 16);
        const y = (fx.y ?? 330) + i * 190;
        return (
          <div key={i} style={{position: 'absolute', left: 60, right: 60, top: y, padding: '26px 30px', borderRadius: 40, background: 'rgba(245,242,236,0.88)',
            backdropFilter: 'blur(24px)', boxShadow: '0 24px 50px rgba(0,0,0,0.28)', display: 'flex', gap: 24, alignItems: 'center',
            opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * -120}px) scale(${0.92 + 0.08 * p})`}}>
            <div style={{width: 92, height: 92, borderRadius: 22, background: n.color ?? '#34C759', flex: 'none', display: 'grid', placeItems: 'center'}}>
              <svg viewBox="0 0 100 100" style={{width: 58, height: 58}}><path d="M50 18c-20 0-34 13-34 29 0 9 5 17 13 22l-3 13 14-8c3 1 6 1 10 1 20 0 34-13 34-28S70 18 50 18z" fill="#fff" /></svg>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: edl.theme.sans, fontWeight: 700, fontSize: 34, color: '#141210'}}>
                <span>{n.title}</span><span style={{fontWeight: 500, fontSize: 26, color: '#8C867D'}}>{n.time ?? 'maintenant'}</span>
              </div>
              <div style={{fontFamily: edl.theme.sans, fontWeight: 500, fontSize: 34, color: '#2A2622', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n.text}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ gauge */
const Gauge: React.FC<{fx: Extract<Fx, {kind: 'gauge'}>}> = ({fx}) => {
  const edl = useEdl();
  const t = useT();
  if (t < fx.from || t >= fx.to) return null;
  const p = pop(edl, t, fx.from, 18);
  const o = out(t, fx.to);
  const n = fx.steps ?? 10;
  const fill = interpolate(t, [fx.fillFrom, fx.fillTo], [0, n], {...clamp, easing: Easing.out(Easing.cubic)});
  const acc = fx.accent ?? '#E9C98F';
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 70, right: 70, top: fx.y, padding: '28px 32px 30px', borderRadius: 30, background: 'rgba(14,11,8,0.72)', backdropFilter: 'blur(14px)',
        border: '1px solid rgba(233,201,143,0.35)', transform: `translateY(${(1 - p) * 80}px)`, opacity: Math.min(1, p * 1.5)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18}}>
          <span style={{fontFamily: edl.theme.mono, fontWeight: 500, fontSize: 26, letterSpacing: '0.18em', color: acc}}>{fx.label}</span>
          <span style={{fontFamily: edl.theme.sans, fontWeight: 800, fontSize: 64, letterSpacing: '-0.04em', color: '#fff', fontVariantNumeric: 'tabular-nums'}}>{Math.round(fill)}<span style={{fontSize: 34, color: '#B9B2A7'}}>/{n}</span></span>
        </div>
        <div style={{display: 'flex', gap: 10}}>
          {Array.from({length: n}).map((_, i) => {
            const q = Math.min(1, Math.max(0, fill - i));
            return <div key={i} style={{flex: 1, height: 46, borderRadius: 8, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${q * 100}%`, background: i >= n - 2 ? '#FF7A45' : acc}} />
            </div>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------ fingerprint */
const PRINT = (() => {
  // a "loop" fingerprint: nested arches open at the bottom around an off-centre core,
  // then gentle horizontal ridges underneath, each ridge broken once like a real print
  const paths: string[] = [];
  const cx = 250, cy = 250;
  for (let k = 0; k < 13; k++) {
    const rx = 16 + k * 15, ry = 22 + k * 19;
    const a0 = Math.PI * (0.92 - k * 0.012), a1 = Math.PI * (2.08 + k * 0.012);
    const br = a0 + (a1 - a0) * (0.25 + random(`b${k}`) * 0.5);   // break position
    for (const [s0, s1] of [[a0, br - 0.07], [br + 0.07, a1]]) {
      let d = '';
      for (let s = 0; s <= 30; s++) {
        const a = s0 + (s1 - s0) * (s / 30);
        const w = 1 + 0.03 * Math.sin(a * 4 + k * 1.7);
        d += (s ? 'L' : 'M') + (cx + Math.cos(a) * rx * w).toFixed(1) + ' ' + (cy + Math.sin(a) * ry * w + (Math.sin(a) > 0 ? Math.sin(a) * k * 4 : 0)).toFixed(1);
      }
      paths.push(d);
    }
  }
  for (let j = 0; j < 6; j++) {
    const y = cy + 250 + j * 24, h = 26 - j * 3;
    paths.push(`M${40 + j * 14} ${y + 20} Q ${cx} ${y - h} ${460 - j * 14} ${y + 20}`);
  }
  return paths;
})();
const Fingerprint: React.FC<{fx: Extract<Fx, {kind: 'fingerprint'}>}> = ({fx}) => {
  const t = useT();
  if (t < fx.from || t >= fx.to) return null;
  const o = out(t, fx.to);
  const col = fx.color ?? '#E9C98F';
  return (
    <AbsoluteFill style={{alignItems: 'center', top: fx.y ?? 380, opacity: o}}>
      <svg viewBox="0 0 500 600" style={{width: fx.size ?? 560, height: (fx.size ?? 560) * 1.2, filter: `drop-shadow(0 0 18px ${col}55)`}}>
        {PRINT.map((d, i) => {
          const a = fx.from + 0.05 + i * 0.045;
          const q = interpolate(t, [a, a + 0.55], [0, 1], {...clamp, easing: expo});
          return <path key={i} d={d} fill="none" stroke={col} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q} opacity={0.35 + 0.65 * q} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ burst */
const Burst: React.FC<{fx: Extract<Fx, {kind: 'burst'}>}> = ({fx}) => {
  const t = useT();
  const q = interpolate(t, [fx.at, fx.at + 0.35], [0, 1], {...clamp, easing: expo});
  if (t < fx.at || q >= 1) return null;
  const col = fx.color ?? '#E9C98F';
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" style={{width: '100%', height: '100%'}}>
        {Array.from({length: 14}).map((_, i) => {
          const a = (i / 14) * Math.PI * 2 + 0.2;
          const r0 = 120 + 260 * q, r1 = r0 + 160 * (1 - q) + 40;
          return <line key={i} x1={fx.x + Math.cos(a) * r0} y1={fx.y + Math.sin(a) * r0} x2={fx.x + Math.cos(a) * r1} y2={fx.y + Math.sin(a) * r1}
            stroke={col} strokeWidth={14 * (1 - q) + 2} strokeLinecap="round" opacity={1 - q * 0.8} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------- scan lines */
const Scan: React.FC<{fx: Extract<Fx, {kind: 'scan'}>}> = ({fx}) => {
  const t = useT();
  const q = interpolate(t, [fx.at, fx.at + (fx.dur ?? 0.3)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  if (t < fx.at || q >= 1) return null;
  const col = fx.color ?? '#E9C98F';
  return (
    <AbsoluteFill>
      {[0, 0.12].map((d, i) => {
        const y = interpolate(q, [d, 1], [-20, 1940], clamp);
        return <div key={i} style={{position: 'absolute', left: 0, right: 0, top: y, height: i ? 3 : 6, background: col, boxShadow: `0 0 24px ${col}`, opacity: i ? 0.7 : 1}} />;
      })}
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------- end card */
const EndCard: React.FC<{fx: Extract<Fx, {kind: 'endcard'}>}> = ({fx}) => {
  const edl = useEdl();
  const t = useT();
  if (t < fx.from || t >= fx.to) return null;
  const acc = fx.accent ?? '#E9C98F';
  const p = pop(edl, t, fx.from + 0.02, 18);
  const z = interpolate(t, [fx.from, fx.to], [1.08, 1.0], clamp);
  const line = (i: number) => {
    const q = interpolate(t, [fx.from + 0.25 + i * 0.12, fx.from + 0.55 + i * 0.12], [0, 1], {...clamp, easing: expo});
    return {opacity: q, transform: `translateY(${(1 - q) * 30}px)`};
  };
  const pill = (at: number) => pop(edl, t, at, 13);
  const pa = pill(fx.pillAt ?? fx.from + 0.9), pb = pill(fx.ctaAt ?? fx.from + 1.2);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #3A2A18 0%, #160F09 62%, #0A0705 100%)'}}>
      <div style={{position: 'absolute', left: 140, right: 140, top: 230, height: 820, borderRadius: 36, overflow: 'hidden', transform: `translateY(${(1 - p) * 300}px)`, opacity: Math.min(1, p * 1.5),
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile(fx.image)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: fx.pos ?? '50% 50%', transform: `scale(${z})`}} />
      </div>
      <AbsoluteFill style={{top: 1090, alignItems: 'center'}}>
        <div style={{...line(0), fontFamily: edl.theme.sans, fontWeight: 800, fontSize: 54, letterSpacing: '-0.02em', color: '#fff'}}>{fx.title}</div>
        <div style={{...line(1), fontFamily: edl.theme.serif, fontStyle: 'italic', fontSize: 120, lineHeight: 1.0, color: acc}}>{fx.name}</div>
        <div style={{marginTop: 26, padding: '14px 34px', borderRadius: 999, background: acc, color: '#141210', fontFamily: edl.theme.sans, fontWeight: 800, fontSize: 38,
          transform: `scale(${pa})`, opacity: Math.min(1, pa * 1.5)}}>{fx.pill}</div>
        <div style={{marginTop: 18, padding: '18px 40px', borderRadius: 999, background: '#25D366', color: '#fff', fontFamily: edl.theme.sans, fontWeight: 700, fontSize: 36,
          display: 'flex', gap: 14, alignItems: 'center', transform: `scale(${pb})`, opacity: Math.min(1, pb * 1.5)}}>
          <svg viewBox="0 0 100 100" style={{width: 40, height: 40}}><path d="M50 12a38 38 0 0 0-33 57l-5 19 20-5a38 38 0 1 0 18-71z" fill="none" stroke="#fff" strokeWidth={7} /></svg>
          {fx.cta}
        </div>
        {fx.small ? <div style={{...line(4), marginTop: 18, fontFamily: edl.theme.mono, fontSize: 22, letterSpacing: '0.14em', color: '#A49D92'}}>{fx.small}</div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ router */
export const FxView: React.FC<{fx: Fx}> = ({fx}) => {
  switch (fx.kind) {
    case 'brand': return <BrandFrame fx={fx} />;
    case 'badge': return <Badge fx={fx} />;
    case 'notifs': return <Notifs fx={fx} />;
    case 'gauge': return <Gauge fx={fx} />;
    case 'fingerprint': return <Fingerprint fx={fx} />;
    case 'burst': return <Burst fx={fx} />;
    case 'scan': return <Scan fx={fx} />;
    case 'endcard': return <EndCard fx={fx} />;
  }
};

/** full-screen fx that own the frame (captions step aside) */
export const fxOwnsFrame = (edl: Edl, t: number) =>
  (edl.fx ?? []).some((f) => (f.kind === 'endcard' || f.kind === 'notifs') && t >= f.from && t < f.to);
