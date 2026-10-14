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
  const c = fx.color ?? '#fff';
  const top = fx.top ?? 240;   // just under Instagram's header; higher up the iPhone status bar and the Reels tabs cover it
  const sh = '0 1px 8px rgba(0,0,0,0.45)';
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 96, top: top + 6, fontFamily: edl.theme.mono, fontWeight: 500, fontSize: 25, letterSpacing: '0.16em', color: c, textShadow: sh}}>{fx.label}</div>
      <div style={{position: 'absolute', right: 96, top, fontFamily: edl.theme.sans, fontWeight: 300, fontSize: 36, letterSpacing: '0.08em', color: c, textShadow: sh}}>{fx.mark}</div>
    </AbsoluteFill>
  );
};

/* ---------------------------- platform UI guide (planche only, never in the video)
   Instagram Reels: elements measured on an iPhone (Style Lab, Oct 2026) — the 9:16 frame is scaled to run
   from the top of the screen to the tab bar, which crops ~54 px per side; 1 pt ≈ 1.054 px, x = 54 + 1.054·pt.
   TikTok (community measurements, 2026): top ~130, right ~140, bottom ~480 px hidden (dashed cyan).
   Everything that matters must sit in x 96–984 (96–900 below y 1000), y 240–1440.                */
const UiGuide: React.FC = () => {
  const u = (pt: number) => 54 + pt * 1.054, v = (pt: number) => pt * 1.054;
  const ui = 'rgba(255,255,255,0.55)';
  const box = (x: number, y: number, w: number, h: number, r = 8, fill = ui) => <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} />;
  const rail = [994, 1145, 1302, 1407, 1563, 1712];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg viewBox="0 0 1080 1920" style={{width: '100%', height: '100%'}}>
        <rect x={0} y={0} width={54} height={1920} fill="rgba(0,0,0,0.45)" /><rect x={1026} y={0} width={54} height={1920} fill="rgba(0,0,0,0.45)" />
        {box(u(104), v(41), 90, v(43))}{box(u(653), v(45), 200, v(36))}
        {box(u(213), v(153), 330, v(54))}{box(u(29), v(150), 62, 62, 14)}{box(u(822), v(150), 62, 62, 14)}
        {rail.map((cy, i) => <circle key={i} cx={u(857)} cy={v(cy)} r={38} fill={ui} />)}
        <circle cx={u(81)} cy={v(1637)} r={50} fill={ui} />{box(u(148), v(1612), 260, v(51), 12)}{box(u(148) + 280, v(1612), 120, v(51), 14)}
        {box(u(36), v(1708), 750, v(38), 10)}
        <circle cx={u(80)} cy={v(1508)} r={50} fill="rgba(255,255,255,0.3)" /><circle cx={u(217)} cy={v(1474)} r={50} fill="rgba(255,255,255,0.3)" />
        <path d="M0 130H1080 M940 0V1920 M0 1440H1080" stroke="#3EE8FF" strokeWidth={4} strokeDasharray="16 12" fill="none" />
        <rect x={96} y={240} width={888} height={1200} fill="none" stroke="#7CFF6B" strokeWidth={3} strokeDasharray="6 8" />
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- icons */
const ICONS: Record<string, React.ReactNode> = {
  // handlebar moustache, symmetric, curled tips
  tie: <g fill="currentColor"><path d="M41 14h18l-4 13H45z" /><path d="M45 29h10l9 43-14 16-14-16z" /></g>,
  moustache: <path d="M50 44C56 37 68 35 77 41C82 45 86 45 89 41C91 38 95 39 94 43C91 52 81 57 70 55C62 54 55 52 50 57C45 52 38 54 30 55C19 57 9 52 6 43C5 39 9 38 11 41C14 45 18 45 23 41C32 35 44 37 50 44Z" fill="currentColor" />,
  // lips: cupid's bow upper lip + full lower lip, mouth line left as a gap
  lips: <g fill="currentColor">
    <path d="M12 51C22 41 32 34 41 37C45 38.5 47.5 40.5 50 38.5C52.5 40.5 55 38.5 59 37C68 34 78 41 88 51C75 52.5 61 52.5 50 53.5C39 52.5 25 52.5 12 51Z" />
    <path d="M12 52.5C25 55 39 56 50 56C61 56 75 55 88 52.5C80 65 66 72 50 72C34 72 20 65 12 52.5Z" />
  </g>,
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
const MsgIcon: React.FC<{size: number; wa?: boolean}> = ({size, wa}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.225, flex: 'none', display: 'grid', placeItems: 'center',
    background: wa ? 'linear-gradient(180deg,#5FFC7B 0%,#28D146 100%)' : 'linear-gradient(180deg,#67FF81 0%,#01B41F 100%)'}}>
    <svg viewBox="0 0 100 100" style={{width: size * 0.66, height: size * 0.66}}>
      <path d="M50 16C26 16 8 30 8 48c0 10 6 19 15 25-1 6-4 11-9 15 9 0 17-3 23-8 4 1 8 2 13 2 24 0 42-14 42-34S74 16 50 16z" fill="#fff" />
    </svg>
  </div>
);

const Notifs: React.FC<{fx: Extract<Fx, {kind: 'notifs'}>}> = ({fx}) => {
  const edl = useEdl();
  const t = useT();
  if (t < fx.from || t >= fx.to) return null;
  const o = out(t, fx.to, 0.2);
  const sf = edl.theme.sans;
  const arrived = fx.items.filter((n) => t >= n.at);
  const max = fx.max ?? 2;   // keep the face clear: older banners fade out as new ones land
  const shown = arrived.slice(-(max + 1));
  const clk = pop(edl, t, fx.from, 20);
  const GAP = 158, Y0 = fx.y ?? (fx.lock ? 660 : 300);
  const newest = shown[shown.length - 1];
  const qn = newest ? spring({frame: Math.round((t - newest.at) * edl.fps), fps: edl.fps, config: {damping: 24, mass: 0.9, stiffness: 120}}) : 1;
  return (
    <AbsoluteFill style={{opacity: o, transform: `translateY(${(1 - o) * -40}px)`}}>
      {fx.lock ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', color: '#fff', opacity: Math.min(1, clk * 1.3), textShadow: '0 2px 20px rgba(0,0,0,0.25)'}}>
          <div style={{fontFamily: sf, fontWeight: 600, fontSize: 40, opacity: 0.92}}>{fx.date ?? 'jeudi 13 novembre'}</div>
          <div style={{fontFamily: sf, fontWeight: 600, fontSize: 230, lineHeight: 0.95, letterSpacing: '-0.035em'}}>{fx.clock ?? '21:47'}</div>
        </div>
      ) : null}
      {shown.map((n, k) => {
        const i = shown.length - 1 - k;                         // 0 = newest, on top
        const p = spring({frame: Math.round((t - n.at) * edl.fps), fps: edl.fps, config: {damping: 24, mass: 0.9, stiffness: 120}});
        const y = i === 0 ? Y0 : Y0 + (i - 1) * GAP + GAP * qn;  // older ones slide down as the new one lands
        return (
          <div key={n.at} style={{position: 'absolute', left: 100, right: 100, top: y, padding: '20px 26px 22px', borderRadius: 42,
            background: 'rgba(246,246,248,0.80)', backdropFilter: 'blur(30px) saturate(1.8)', WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 24px rgba(0,0,0,0.14)', display: 'flex', gap: 22, alignItems: 'center',
            opacity: i === 0 ? Math.min(1, p * 1.6) : i >= max ? Math.max(0, 1 - qn * 1.8) : 1 - 0.12 * Math.min(i, 3),
            transform: i === 0 ? `translateY(${(1 - p) * -90}px) scale(${0.96 + 0.04 * p})` : `scale(${1 - 0.03 * Math.min(i, 3)})`}}>
            <MsgIcon size={70} wa={n.app === 'whatsapp'} />
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: sf, color: '#1d1d1f'}}>
                <span style={{fontWeight: 600, fontSize: 29, letterSpacing: '-0.01em'}}>{n.title}</span>
                <span style={{fontWeight: 400, fontSize: 23, color: 'rgba(60,60,67,0.6)'}}>{n.time ?? 'maintenant'}</span>
              </div>
              <div style={{fontFamily: sf, fontWeight: 400, fontSize: 28, lineHeight: 1.22, color: '#1d1d1f', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n.text}</div>
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
  const sf = edl.theme.sans;
  const p = spring({frame: Math.round((t - fx.from - 0.02) * edl.fps), fps: edl.fps, config: {damping: 26, mass: 1, stiffness: 110}});
  const drift = interpolate(t, [fx.from, fx.to], [0, -18], clamp);
  const line = (i: number) => {
    const q = interpolate(t, [fx.from + 0.3 + i * 0.12, fx.from + 0.75 + i * 0.12], [0, 1], {...clamp, easing: expo});
    return {opacity: q, transform: `translateY(${(1 - q) * 26}px)`};
  };
  const pb = pop(edl, t, fx.ctaAt ?? fx.from + 1.2, 16);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 34%, #3B2A19 0%, #15100B 60%, #0B0907 100%)'}}>
      <AbsoluteFill style={{alignItems: 'center', top: 320}}>
        <Img src={staticFile(fx.image)} style={{height: 560, objectFit: 'contain', filter: 'drop-shadow(3px 5px 30px rgba(0,0,0,0.55))',
          opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 120 + drift}px) scale(${0.94 + 0.06 * p})`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{top: 920, alignItems: 'center'}}>
        <div style={{...line(0), fontFamily: sf, fontWeight: 600, fontSize: 40, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.86)'}}>{fx.title}</div>
        <div style={{...line(1), fontFamily: edl.theme.serif, fontStyle: 'italic', fontSize: 138, lineHeight: 1.0, color: acc, marginTop: 6}}>{fx.name}</div>
        <div style={{...line(2), fontFamily: sf, fontWeight: 400, fontSize: 32, color: 'rgba(255,255,255,0.62)', marginTop: 10}}>{fx.pill}</div>
        <div style={{marginTop: 34, padding: '22px 46px', borderRadius: 999, background: '#25D366', color: '#fff', fontFamily: sf, fontWeight: 600, fontSize: 38, letterSpacing: '-0.01em',
          display: 'flex', gap: 16, alignItems: 'center', transform: `scale(${0.9 + 0.1 * pb})`, opacity: Math.min(1, pb * 1.5)}}>
          <svg viewBox="0 0 100 100" style={{width: 42, height: 42}}><path d="M50 12a38 38 0 0 0-33 57l-5 19 20-5a38 38 0 1 0 18-71z" fill="none" stroke="#fff" strokeWidth={7} /></svg>
          {fx.cta}
        </div>
        {fx.small ? <div style={{...line(4), marginTop: 20, fontFamily: sf, fontWeight: 400, fontSize: 26, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.5)'}}>{fx.small}</div> : null}
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
    case 'safezone': return <UiGuide />;
  }
};

/** full-screen fx that own the frame (captions step aside) */
export const fxOwnsFrame = (edl: Edl, t: number) =>
  (edl.fx ?? []).some((f) => (f.kind === 'endcard' || f.kind === 'notifs') && t >= f.from && t < f.to);
