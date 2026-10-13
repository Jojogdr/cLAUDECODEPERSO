import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, useVideoConfig, Easing, random,
} from 'remotion';
import wordsJson from './words_v2.json';

/* =====================================================================
   Ébène Fumé — v2
   Base: matted talking head (RVM) → background replacement + text
   behind the subject, dense B-roll, product HUD, cold-open hook.
   All times are OUTPUT seconds.
   ===================================================================== */

export const FPS = 30;
export const DURATION_V2 = 1324 / 30 + 1.0; // +1 s hold on the end card

const C = {
  paper: '#F4F1EC',
  grid: 'rgba(60,40,20,0.06)',
  ink: '#1C1712',
  gold: '#C8913F',
  goldLight: '#E9BE72',
  glow: 'rgba(233,190,114,0.55)',
};
const SANS = 'Inter, sans-serif';
const SERIF = '"Playfair Display", serif';

const f = (s: number) => Math.round(s * FPS);
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const win = (t: number, a: number, b: number, fi = 0.15, fo = 0.15) =>
  interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], clamp);
const useT = () => useCurrentFrame() / FPS;

/* ------------------------------------------------------------ timeline */
type Full = {from: number; to: number; kind: string; enter: 'flash' | 'whip' | 'zoom' | 'cut' | 'up'; captions?: boolean};
const FULL: Full[] = [
  {from: 0.0, to: 1.3, kind: 'hookMacro', enter: 'cut'},
  {from: 4.84, to: 6.69, kind: 'title', enter: 'up'},
  {from: 10.85, to: 13.5, kind: 'gold', enter: 'zoom'},
  {from: 13.95, to: 15.4, kind: 'product2', enter: 'whip', captions: true},
  {from: 24.2, to: 26.18, kind: 'feminin', enter: 'whip'},
  {from: 28.55, to: 30.2, kind: 'notes', enter: 'zoom'},
  {from: 35.4, to: 38.26, kind: 'empreinte', enter: 'zoom'},
  {from: 42.36, to: DURATION_V2, kind: 'end', enter: 'up'},
];
const fullAt = (t: number) => FULL.find((s) => t >= s.from && t < s.to);

// Background replacement behind the matted subject
type Bg = {from: number; to: number; src: string; css?: string; video?: boolean; offset?: number; pos?: string; blur?: number; dark?: number; zoom?: [number, number]; tint?: string};
const BGS: Bg[] = [
  {from: 1.3, to: 2.28, src: 'broll/ink2.mp4', video: true, offset: 2, dark: 0.5, zoom: [1.15, 1.05]},
  {from: 8.38, to: 9.38, src: 'img/p3.jpg', pos: '30% 50%', blur: 3, dark: 0.25, zoom: [1.25, 1.15]},
  {from: 9.38, to: 10.59, src: 'broll/smoke.mp4', video: true, offset: 3.2, dark: 0, zoom: [1.0, 1.1], tint: 'rgba(60,30,8,0.35)'},
  {from: 10.59, to: 10.95, src: 'broll/ink2.mp4', video: true, offset: 9, dark: 0.3},
  {from: 21.85, to: 24.25, src: '', css: 'radial-gradient(ellipse at 30% 25%, #F7DCE0 0%, #F3E4CF 40%, #E7DAF0 75%, #EFE6F3 100%)'},
  {from: 26.18, to: 28.6, src: 'img/p1.jpg', pos: '50% 50%', blur: 16, dark: 0.35, zoom: [1.3, 1.15]},
  {from: 30.2, to: 32.55, src: 'img/p2.jpg', pos: '50% 30%', blur: 0, dark: 0.15, zoom: [1.35, 1.1]},
];

// Big type behind the subject (heavy caps, top) + accent words in front (bottom)
type Line = {text: string; at: number; style: 'heavy' | 'serif' | 'sans'; size?: number; color?: string; front?: boolean; until?: number};
type Behind = {from: number; to: number; y: number; frontY?: number; lines: Line[]};
const BEHIND: Behind[] = [
  {from: 1.36, to: 2.28, y: 220, frontY: 1250, lines: [
    {text: 'LES GENS', at: 1.38, style: 'heavy', size: 200},
    {text: 'ne vont pas', at: 1.69, style: 'sans', size: 64, front: true},
    {text: "l'oublier.", at: 2.11, style: 'serif', size: 210, front: true},
  ]},
  {from: 3.92, to: 4.84, y: 230, frontY: 1290, lines: [
    {text: 'MES PARFUMS', at: 3.97, style: 'heavy', size: 150},
    {text: 'préférés', at: 4.28, style: 'serif', size: 200, front: true},
  ]},
  {from: 8.38, to: 9.38, y: 210, lines: [{text: 'BOISÉ', at: 8.38, style: 'heavy', size: 270}]},
  {from: 9.38, to: 10.59, y: 230, lines: [{text: 'MYSTÉRIEUX', at: 9.38, style: 'heavy', size: 170}]},
  {from: 10.59, to: 10.95, y: 230, lines: [{text: 'CARACTÈRE', at: 10.59, style: 'heavy', size: 175, color: C.goldLight}]},
  {from: 17.7, to: 20.25, y: 220, lines: [{text: 'UNE FEMME', at: 17.77, style: 'heavy', size: 190, color: C.goldLight}]},
  {from: 21.85, to: 22.65, y: 220, frontY: 1290, lines: [
    {text: 'PARFUM', at: 21.88, style: 'heavy', size: 240, color: '#fff'},
    {text: 'féminin…', at: 21.98, style: 'serif', size: 200, front: true},
  ]},
  {from: 22.65, to: 24.2, y: 230, lines: [{text: "S'IMAGINER", at: 22.69, style: 'heavy', size: 170, color: C.gold}]},
  {from: 26.2, to: 28.6, y: 180, lines: [
    {text: 'ALORS QUE', at: 26.2, style: 'sans', size: 60},
    {text: 'CELUI-CI', at: 26.54, style: 'heavy', size: 210, color: C.goldLight},
  ]},
  {from: 31.4, to: 32.55, y: 220, lines: [
    {text: 'PLUS FORT', at: 31.48, style: 'heavy', size: 190, until: 32.1},
    {text: 'PLUS PUISSANT', at: 32.1, style: 'heavy', size: 160, color: C.goldLight},
  ]},
  {from: 34.45, to: 35.4, y: 220, lines: [{text: 'PERCUTANT', at: 34.51, style: 'heavy', size: 175, color: C.goldLight}]},
  {from: 39.55, to: 41.5, y: 220, frontY: 1290, lines: [
    {text: 'CHANGER', at: 39.62, style: 'heavy', size: 230},
    {text: 'de parfum ?', at: 40.1, style: 'serif', size: 190, front: true},
  ]},
  {from: 41.5, to: 42.36, y: 230, lines: [{text: 'QUOI PRENDRE ?', at: 41.56, style: 'heavy', size: 130}]},
];
const frontActive = (t: number) => BEHIND.some((b) => b.lines.some((l) => l.front) && t >= b.from && t < b.to);

// Camera on the talking head: [time, scale] snaps (punch-in edits) + impulses
const CAM: [number, number][] = [
  [1.3, 1.12], [2.11, 1.2], [2.28, 1.0], [3.97, 1.07], [6.69, 1.0], [8.38, 1.1], [9.38, 1.04], [10.59, 1.14],
  [13.5, 1.0], [15.43, 1.08], [16.16, 1.03], [17.77, 1.1], [19.42, 1.04], [20.25, 1.0], [21.88, 1.08], [22.69, 1.03],
  [26.18, 1.12], [26.54, 1.18], [28.6, 1.0], [30.2, 1.06], [31.48, 1.12], [32.1, 1.18], [32.55, 1.0],
  [34.51, 1.15], [35.4, 1.0], [38.26, 1.0], [39.62, 1.08], [41.56, 1.14],
];
const SHAKES = [2.11, 13.11, 15.79, 31.48, 32.1, 34.51];
const camAt = (t: number) => {
  let s = 1, prevS = 1, at = -9;
  for (const [k, v] of CAM) if (t >= k) { prevS = s; s = v; at = k; }
  const p = interpolate(t, [at, at + 0.14], [0, 1], {...clamp, easing: ease});
  let scale = prevS + (s - prevS) * p;
  let x = 0, y = 0;
  for (const k of SHAKES) {
    const d = t - k;
    if (d >= 0 && d < 0.4) {
      const a = 16 * Math.exp(-d * 9);
      x += a * Math.sin(d * 97); y += a * Math.cos(d * 83);
      scale += 0.03 * Math.exp(-d * 12);
    }
  }
  scale += 0.012 * Math.sin(t * 0.7); // breathing drift keeps A-roll alive
  return {scale, x, y};
};

/* ------------------------------------------------------------ captions */
type W = {w: string; s: number; e: number};
const WORDS = wordsJson as W[];
const KEY = /oublier|préférés|Tom|Ford|Ébène|Fumé|boisé|mystérieux|caractère|élégance|audacieux|masculine|femme|truc|plus\.|subtil|sucré|fleuri|ambrées|santal|fort|puissant|percutant|empreinte|parfum\b|meilleure|recommandation/i;
const CHUNKS: W[][] = (() => {
  const out: W[][] = [];
  let cur: W[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const n = WORDS[i + 1];
    if (!n || /[.,?]$/.test(w.w) || n.s - w.e > 0.3 || cur.length >= 3) { out.push(cur); cur = []; }
  });
  return out;
})();

const Captions: React.FC = () => {
  const t = useT();
  const fs = fullAt(t);
  if ((fs && !fs.captions) || frontActive(t)) return null;
  const i = CHUNKS.findIndex((c, k) => t >= c[0].s - 0.04 && t < (CHUNKS[k + 1]?.[0].s ?? DURATION_V2) - 0.04);
  if (i < 0) return null;
  const chunk = CHUNKS[i];
  return (
    <AbsoluteFill style={{top: 1200, alignItems: 'center'}}>
      <div style={{width: 960, textAlign: 'center'}}>
        {chunk.map((w, k) => {
          const p = interpolate(t, [w.s - 0.04, w.s + 0.06], [0, 1], clamp);
          return (
            <span key={k} style={{display: 'inline-block', margin: '0 9px', fontFamily: SANS, fontWeight: 700, fontSize: 52,
              letterSpacing: -0.8, color: KEY.test(w.w) ? C.goldLight : '#fff', opacity: p,
              transform: `translateY(${(1 - p) * 10}px) scale(${0.9 + 0.1 * p})`,
              textShadow: '0 2px 4px rgba(0,0,0,0.35), 0 4px 24px rgba(0,0,0,0.55)'}}>
              {w.w.replace(/,$/, '')}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------- primitives */
const heavy = (size: number, color = '#fff'): React.CSSProperties => ({
  fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.045, lineHeight: 0.88, color, textTransform: 'uppercase',
});
const serif = (size: number, color = C.goldLight): React.CSSProperties => ({
  fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: size, letterSpacing: -size * 0.02, lineHeight: 0.95, color,
  textShadow: `0 0 40px ${C.glow}`,
});
const fitH = (text: string, size: number, maxW = 1010) => Math.min(size, maxW / (text.length * 0.66));
const fitS = (text: string, size: number) => Math.min(size, 1000 / (text.length * 0.5));
const Heavy: React.FC<{text: string; size: number; color?: string; style?: React.CSSProperties}> = ({text, size, color, style}) =>
  <div style={{...heavy(fitH(text, size), color), whiteSpace: 'nowrap', ...style}}>{text}</div>;
const Serif: React.FC<{text: string; size: number; color?: string}> = ({text, size, color}) =>
  <div style={{...serif(fitS(text, size), color), whiteSpace: 'nowrap'}}>{text}</div>;
const sans = (size: number, color = '#fff'): React.CSSProperties => ({
  fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: -0.5, color,
});

const PopIn: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties; from?: number}> = ({at, children, style, from = 1.25}) => {
  const t = useT();
  const p = interpolate(t, [at, at + 0.22], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{opacity: Math.min(1, p * 1.6), transform: `scale(${from - (from - 1) * p})`, filter: `blur(${(1 - p) * 12}px)`, ...style}}>
      {children}
    </div>
  );
};

const UntilWrap: React.FC<{until: number; children: React.ReactNode}> = ({until, children}) => {
  const t = useT();
  if (t >= until) return null;
  return <div style={{position: 'absolute', left: 0, right: 0}}>{children}</div>;
};

const LineView: React.FC<{l: Line}> = ({l}) => {
  const st = l.style === 'heavy' ? heavy(fitH(l.text, l.size ?? 180, l.front ? 1010 : 860), l.color) : l.style === 'serif' ? serif(fitS(l.text, l.size ?? 180), l.color) : sans(l.size ?? 60, l.color);
  const el = <PopIn at={l.at} from={l.style === 'heavy' ? 1.35 : 1.15}><div style={{...st, whiteSpace: 'nowrap'}}>{l.text}</div></PopIn>;
  return l.until !== undefined ? <UntilWrap until={l.until}>{el}</UntilWrap> : el;
};

const BehindLayer: React.FC = () => {
  const t = useT();
  return (
    <>
      {BEHIND.filter((b) => t >= b.from - 0.3 && t < b.to).map((b, i) => (
        <AbsoluteFill key={i} style={{opacity: win(t, b.from - 0.3, b.to, 0.01, 0.12), alignItems: 'center', top: b.y}}>
          <div style={{textAlign: 'center', textShadow: '0 10px 50px rgba(0,0,0,0.25)'}}>
            <div style={{position: 'relative'}}>{b.lines.filter((l) => !l.front).map((l, k) => <LineView key={k} l={l} />)}</div>
          </div>
        </AbsoluteFill>
      ))}
    </>
  );
};

const FrontLayer: React.FC = () => {
  const t = useT();
  return (
    <>
      {BEHIND.filter((b) => b.lines.some((l) => l.front) && t >= b.from - 0.3 && t < b.to).map((b, i) => (
        <AbsoluteFill key={i} style={{opacity: win(t, b.from - 0.3, b.to, 0.01, 0.12), alignItems: 'center', top: b.frontY ?? 1290}}>
          <div style={{textAlign: 'center', filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.55))'}}>
            {b.lines.filter((l) => l.front).map((l, k) => <LineView key={k} l={l} />)}
          </div>
        </AbsoluteFill>
      ))}
    </>
  );
};

const BgLayer: React.FC = () => {
  const t = useT();
  return (
    <>
      {BGS.map((b, i) => {
        const o = win(t, b.from, b.to, 0.08, 0.08);
        if (o <= 0) return null;
        const z = b.zoom ? interpolate(t, [b.from, b.to], b.zoom, clamp) : 1.05;
        const style: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: b.pos ?? '50% 50%', transform: `scale(${z})`, filter: b.blur ? `blur(${b.blur}px)` : undefined};
        return (
          <AbsoluteFill key={i} style={{opacity: o, background: '#000'}}>
            {b.css ? <AbsoluteFill style={{background: b.css}} /> : b.video ? (
              <Sequence from={f(b.from)} layout="none">
                <OffthreadVideo src={staticFile(b.src)} muted trimBefore={f(b.offset ?? 0)} style={style} />
              </Sequence>
            ) : <Img src={staticFile(b.src)} style={style} />}
            {b.css ? <Bokeh from={b.from} colors={['#F3D9D6', '#F6E3C4', '#E4D3EE']} /> : null}
            {b.tint ? <AbsoluteFill style={{background: b.tint, mixBlendMode: 'multiply'}} /> : null}
            <AbsoluteFill style={{background: `rgba(10,6,3,${b.dark ?? 0})`}} />
          </AbsoluteFill>
        );
      })}
    </>
  );
};

// Subject layer only where something sits behind it (saves decode time)
const FG_WINDOWS: [number, number][] = (() => {
  const w = [...BGS.map((b) => [b.from - 0.1, b.to + 0.1] as [number, number]), ...BEHIND.map((b) => [b.from - 0.35, b.to + 0.05] as [number, number])]
    .sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const x of w) {
    const last = out[out.length - 1];
    if (last && x[0] <= last[1] + 0.2) last[1] = Math.max(last[1], x[1]);
    else out.push([Math.max(0, x[0]), x[1]]);
  }
  return out;
})();

const Foreground: React.FC = () => (
  <>
    {FG_WINDOWS.map(([a, b], i) => (
      <Sequence key={i} from={f(a)} durationInFrames={f(b) - f(a)}>
        <OffthreadVideo src={staticFile('fg_v2.webm')} transparent muted trimBefore={f(a)} />
      </Sequence>
    ))}
  </>
);

/* ------------------------------------------------------------ particles */
const Embers: React.FC<{from: number; to: number; n?: number; seed?: string; opacity?: number; size?: number}> = ({from, to, n = 40, seed = 'e', opacity = 1, size = 1}) => {
  const t = useT();
  const o = win(t, from, to, 0.2, 0.3) * opacity;
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: o, pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const speed = 120 + r('s') * 260;
        const life = 2.2 + r('l') * 2.5;
        const ph = ((t + r('p') * life) % life) / life;
        const x = r('x') * 1080 + Math.sin((t + r('w') * 6) * (1 + r('f'))) * 40;
        const y = 1950 - ph * (1950 + speed);
        const s = (3 + r('z') * 9) * size;
        const a = Math.sin(ph * Math.PI) * (0.5 + 0.5 * r('a'));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s,
          background: 'radial-gradient(circle, #FFE3A3 0%, #FF9A2E 45%, rgba(255,90,0,0) 75%)', opacity: a,
          boxShadow: `0 0 ${s * 2}px ${s / 2}px rgba(255,140,40,0.5)`}} />;
      })}
    </AbsoluteFill>
  );
};

const Sparkles: React.FC<{at: number; cx: number; cy: number; n?: number}> = ({at, cx, cy, n = 18}) => {
  const t = useT();
  const d = t - at;
  if (d < 0 || d > 1.6) return null;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen'}}>
      {Array.from({length: n}).map((_, i) => {
        const r = (k: string) => random(`sp${at}${i}${k}`);
        const ang = r('a') * Math.PI * 2;
        const dist = (90 + r('d') * 380) * (1 - Math.exp(-d * 4));
        const s = 22 + r('s') * 46;
        const a = Math.max(0, 1 - d / (0.9 + r('l') * 0.7)) * (0.6 + 0.4 * Math.sin(d * 30 + i));
        return (
          <svg key={i} width={s} height={s} viewBox="-10 -10 20 20" style={{position: 'absolute', left: cx + Math.cos(ang) * dist - s / 2,
            top: cy + Math.sin(ang) * dist - s / 2, opacity: a, transform: `rotate(${d * 120 + i * 20}deg)`, filter: 'drop-shadow(0 0 6px #FFD98A)'}}>
            <path d="M0,-10 L2,-2 L10,0 L2,2 L0,10 L-2,2 L-10,0 L-2,-2 Z" fill="#FFF2C9" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const SmokeOverlay: React.FC<{from: number; to: number; offset?: number; opacity?: number}> = ({from, to, offset = 3, opacity = 0.55}) => {
  const t = useT();
  const o = win(t, from, to, 0.3, 0.3) * opacity;
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o, mixBlendMode: 'screen'}}>
      <Sequence from={f(from)} layout="none">
        <OffthreadVideo src={staticFile('broll/smoke.mp4')} muted trimBefore={f(offset)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{at: number; dur?: number; color?: string}> = ({at, dur = 0.22, color = '#fff'}) => {
  const t = useT();
  const o = interpolate(t, [at - 0.03, at, at + dur], [0, 1, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{background: color, opacity: o}} /> : null;
};

const LightLeak: React.FC<{from: number; to: number}> = ({from, to}) => {
  const t = useT();
  const o = win(t, from, to, 0.3, 0.3);
  if (o <= 0) return null;
  const x = 30 + 40 * Math.sin(t * 0.9), y = 20 + 25 * Math.cos(t * 0.6);
  return <AbsoluteFill style={{opacity: o * 0.55, mixBlendMode: 'screen',
    background: `radial-gradient(ellipse at ${x}% ${y}%, rgba(255,150,50,0.65) 0%, rgba(255,90,20,0.25) 30%, rgba(0,0,0,0) 60%)`}} />;
};

/* ------------------------------------------------------------- HUD bits */
const Corners: React.FC<{at: number; box: [number, number, number, number]}> = ({at, box: [x, y, w, h]}) => {
  const t = useT();
  const p = interpolate(t, [at, at + 0.3], [0, 1], {...clamp, easing: ease});
  const g = 40 * (1 - p);
  const L = 54;
  const c = (sx: number, sy: number, k: number) => (
    <div key={k} style={{position: 'absolute', left: sx > 0 ? x + w - L + g : x - g, top: sy > 0 ? y + h - L + g : y - g, width: L, height: L,
      borderColor: '#fff', borderStyle: 'solid', borderWidth: 0,
      [sy > 0 ? 'borderBottomWidth' : 'borderTopWidth']: 4, [sx > 0 ? 'borderRightWidth' : 'borderLeftWidth']: 4, opacity: p} as React.CSSProperties} />
  );
  return <>{[c(-1, -1, 0), c(1, -1, 1), c(-1, 1, 2), c(1, 1, 3)]}</>;
};

const Tag: React.FC<{at: number; x: number; y: number; text: string; dark?: boolean}> = ({at, x, y, text, dark}) => {
  const t = useT();
  const p = interpolate(t, [at, at + 0.18], [0, 1], clamp);
  // typewriter reveal + blinking dot
  const shown = text.slice(0, Math.ceil(text.length * interpolate(t, [at, at + 0.35], [0, 1], clamp)));
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: p, transform: `translateY(${(1 - p) * 12}px)`,
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderRadius: 12,
      background: dark ? 'rgba(20,14,9,0.82)' : C.goldLight, color: dark ? C.goldLight : C.ink,
      fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 2.5, boxShadow: '0 10px 30px rgba(0,0,0,0.25)'}}>
      <span style={{width: 10, height: 10, borderRadius: 5, background: dark ? C.goldLight : C.ink, opacity: Math.floor(t * 4) % 2 ? 1 : 0.3}} />
      {shown}
    </div>
  );
};

const Pills: React.FC = () => {
  const t = useT();
  const from = 7.5, to = 10.9;
  const items: [string, number][] = [['Boisé', 8.38], ['Mystérieux', 9.38], ['Caractère', 10.59]];
  const o = win(t, from, to, 0.25, 0.15);
  if (o <= 0) return null;
  const y = interpolate(t, [from, from + 0.35], [60, 0], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', top: 1590, width: '100%', display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${y}px)`}}>
      <div style={{display: 'flex', gap: 12, padding: 12, borderRadius: 999, background: 'rgba(20,14,9,0.6)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(14px)'}}>
        {items.map(([label, at], i) => {
          const on = t >= at;
          const p = interpolate(t, [at, at + 0.2], [0, 1], clamp);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderRadius: 999,
              background: on ? `rgba(233,190,114,${0.95 * p})` : 'rgba(255,255,255,0.06)', transform: `scale(${1 + 0.1 * Math.sin(p * Math.PI)})`}}>
              <span style={{width: 34, height: 34, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 20, fontWeight: 700,
                background: on ? C.ink : 'transparent', color: on ? C.goldLight : 'rgba(255,255,255,0.6)', border: on ? 'none' : '2px solid rgba(255,255,255,0.4)'}}>{i + 1}</span>
              <span style={{fontFamily: SANS, fontSize: 30, fontWeight: 600, color: on ? C.ink : 'rgba(255,255,255,0.65)'}}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Stamp: React.FC = () => {
  const t = useT();
  const at = 15.79, to = 16.45;
  if (t < at || t > to) return null;
  const p = spring({frame: f(t - at), fps: FPS, config: {damping: 11, mass: 0.6}});
  const o = interpolate(t, [to - 0.15, to], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 560, top: 820, transform: `rotate(-9deg) scale(${1.8 - 0.8 * p})`, opacity: Math.min(1, p * 2) * o,
      padding: '18px 30px', border: `6px solid ${C.goldLight}`, borderRadius: 14, outline: `2px solid ${C.goldLight}`, outlineOffset: 6,
      ...heavy(64, C.goldLight), letterSpacing: 2, background: 'rgba(20,14,9,0.35)'}}>
      Pour homme
    </div>
  );
};

const Slider: React.FC = () => {
  const t = useT();
  const from = 16.2, to = 20.2;
  const o = win(t, from, to, 0.3, 0.3);
  if (o <= 0) return null;
  const y = interpolate(t, [from, from + 0.4], [80, 0], {...clamp, easing: ease});
  const k = interpolate(t, [16.65, 17.77], [0.04, 0.96], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const W = 760;
  return (
    <div style={{position: 'absolute', top: 1560, left: (1080 - W - 80) / 2, width: W + 80, padding: '34px 40px', borderRadius: 40,
      background: 'rgba(20,14,9,0.62)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(14px)', opacity: o, transform: `translateY(${y}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 2.5, color: 'rgba(255,255,255,0.75)', marginBottom: 26}}>
        <span>MASCULIN</span><span style={{color: k > 0.9 ? C.goldLight : 'rgba(255,255,255,0.75)'}}>FÉMININ</span>
      </div>
      <div style={{position: 'relative', height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.15)'}}>
        <div style={{position: 'absolute', height: 10, borderRadius: 5, width: k * W, background: `linear-gradient(90deg, #8C5A22, ${C.goldLight})`}} />
        <div style={{position: 'absolute', left: k * W - 22, top: -17, width: 44, height: 44, borderRadius: 22, background: '#fff', boxShadow: `0 0 ${k > 0.9 ? 30 : 10}px ${k > 0.9 ? C.goldLight : 'rgba(0,0,0,0.4)'}`}} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------- full scenes */
const Paper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #FBF9F5 0%, ${C.paper} 60%, #E6E0D6 100%)`}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`, backgroundSize: '54px 54px'}} />
    <AbsoluteFill style={{background: 'linear-gradient(115deg, transparent 30%, rgba(0,0,0,0.035) 45%, transparent 60%)'}} />
    {children}
  </AbsoluteFill>
);

const Cover: React.FC<{src: string; z?: [number, number]; from: number; to: number; pos?: string; video?: boolean; offset?: number; blur?: number}> = ({src, z = [1.05, 1.15], from, to, pos, video, offset = 0, blur}) => {
  const t = useT();
  const s = interpolate(t, [from, to], z, clamp);
  const st: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${s})`, filter: blur ? `blur(${blur}px)` : undefined};
  return video ? <OffthreadVideo src={staticFile(src)} muted trimBefore={f(offset)} style={st} /> : <Img src={staticFile(src)} style={st} />;
};

const Shade: React.FC<{top?: number; bottom?: number}> = ({top = 0.5, bottom = 0.75}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(8,5,2,${top}) 0%, rgba(8,5,2,0) 35%, rgba(8,5,2,0) 55%, rgba(8,5,2,${bottom}) 100%)`}} />
);

const HookMacro: React.FC<{s: Full}> = ({s}) => {
  const t = useT();
  const s0 = interpolate(t, [0, 0.35, s.to], [1.45, 1.18, 1.1], {...clamp, easing: Easing.out(Easing.cubic)});
  const blur = interpolate(t, [0, 0.25], [14, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile('img/p2.jpg')} style={{position: 'absolute', width: 1920, height: 1920, left: -420, top: 0, objectFit: 'cover', transform: `scale(${s0}) rotate(${(1 - s0 / 1.45) * -6}deg)`, filter: `blur(${blur}px)`}} />
      <Shade top={0.55} bottom={0.8} />
      <Embers from={0} to={s.to + 0.2} n={55} seed="h" size={1.3} />
      <Corners at={0.1} box={[150, 470, 780, 1000]} />
      <Tag at={0.14} x={150} y={400} text="TOM FORD · ÉBÈNE FUMÉ" />
      <AbsoluteFill style={{alignItems: 'center', top: 170}}>
        <PopIn at={0.26} from={1.4}><Heavy text="CROYEZ-MOI" size={150} /></PopIn>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', top: 1430}}>
        <PopIn at={0.78} from={1.3}><Serif text="celui-ci…" size={210} /></PopIn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const TitleScene: React.FC<{s: Full}> = ({s}) => {
  const t = useT();
  const p = spring({frame: f(t - 4.86), fps: FPS, config: {damping: 15, mass: 0.8}});
  const tilt = Math.sin((t - 4.84) * 1.6) * 6;
  return (
    <Paper>
      <Embers from={s.from} to={s.to} n={18} seed="t" opacity={0.6} size={0.8} />
      <div style={{position: 'absolute', left: 540 - 320, top: 330, width: 640, height: 820, perspective: 1400}}>
        <div style={{width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', transform: `translateY(${(1 - p) * 900}px) rotateY(${tilt}deg) rotateX(${-tilt / 3}deg)`,
          boxShadow: '0 40px 80px rgba(40,25,10,0.25), 0 8px 20px rgba(40,25,10,0.12)'}}>
          <Img src={staticFile('img/p6.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.12 - 0.06 * p})`}} />
        </div>
      </div>
      <Tag at={5.5} x={70} y={420} text="EAU DE PARFUM" dark />
      <Tag at={5.75} x={640} y={760} text="PRIVATE BLEND" dark />
      <Tag at={6.0} x={110} y={1060} text="50 ML" dark />
      <AbsoluteFill style={{top: 1290, alignItems: 'center'}}>
        <PopIn at={5.16}><Heavy text="TOM FORD" size={120} color={C.ink} /></PopIn>
        <PopIn at={5.93}><Serif text="Ébène Fumé" size={160} color={C.gold} /></PopIn>
      </AbsoluteFill>
    </Paper>
  );
};

const GoldScene: React.FC<{s: Full}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(s.from)} layout="none"><Cover src="broll/gold.mp4" video from={s.from} to={s.to} z={[1.08, 1.2]} /></Sequence>
    <Shade top={0.45} bottom={0.7} />
    <LightLeak from={s.from} to={s.to} />
    <AbsoluteFill style={{top: 560, alignItems: 'center'}}>
      <PopIn at={11.38}><div style={sans(64)}>d'une grande</div></PopIn>
      <PopIn at={11.9}><Serif text="élégance" size={220} /></PopIn>
    </AbsoluteFill>
    <AbsoluteFill style={{top: 1040, alignItems: 'center'}}>
      <PopIn at={12.66}><div style={{...sans(58), marginBottom: 18}}>et assez</div></PopIn>
      <PopIn at={13.11} from={1.6}><Heavy text="AUDACIEUX" size={150} /></PopIn>
    </AbsoluteFill>
  </AbsoluteFill>
);

const Swatch: React.FC<{at: number; x: number; color: string; label: string}> = ({at, x, color, label}) => {
  const t = useT();
  const p = spring({frame: f(t - at), fps: FPS, config: {damping: 10, mass: 0.7}});
  const bob = Math.sin((t - at) * 2.2 + x) * 6;
  return (
    <div style={{position: 'absolute', left: x - 130, top: 930 + bob, width: 260, textAlign: 'center', opacity: Math.min(1, p * 1.6),
      transform: `translateY(${(1 - p) * -420}px) rotate(${(1 - p) * 25}deg)`}}>
      <div style={{width: 230, height: 230, margin: '0 auto', borderRadius: 52, background: color, boxShadow: '0 24px 50px rgba(40,25,10,0.16), inset 0 0 0 1px rgba(0,0,0,0.04)'}} />
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 3, marginTop: 28, color: C.ink}}>{label}</div>
    </div>
  );
};

const Bokeh: React.FC<{from: number; colors: string[]}> = ({from, colors}) => {
  const t = useT();
  return (
    <>
      {Array.from({length: 14}).map((_, i) => {
        const r = (k: string) => random(`b${i}${k}`);
        const s = 80 + r('s') * 220;
        return <div key={i} style={{position: 'absolute', left: r('x') * 1080 - s / 2 + Math.sin(t * 0.5 + i) * 30, top: ((r('y') * 2100 - (t - from) * (20 + r('v') * 40)) % 2100) - 100,
          width: s, height: s, borderRadius: s, background: colors[i % colors.length], opacity: 0.35, filter: 'blur(30px)'}} />;
      })}
    </>
  );
};

const FemininScene: React.FC<{s: Full}> = ({s}) => (
  <Paper>
    <Bokeh from={s.from} colors={['#F3D9D6', '#F6E3C4', '#E4D3EE']} />
    <AbsoluteFill style={{top: 470, alignItems: 'center'}}>
      <PopIn at={24.2}><div style={sans(62, C.ink)}>quelque chose de</div></PopIn>
      <PopIn at={24.25}><Serif text="doux…" size={170} color={C.gold} /></PopIn>
    </AbsoluteFill>
    <Swatch at={24.37} x={225} color="#F3D9D6" label="SUBTIL" />
    <Swatch at={24.95} x={540} color="#F6E3C4" label="SUCRÉ" />
    <Swatch at={25.63} x={855} color="#E4D3EE" label="FLEURI" />
  </Paper>
);

const Glass: React.FC<{at: number; x: number; y: number; img: string; pos: string; label: string; rot: number}> = ({at, x, y, img, pos, label, rot}) => {
  const t = useT();
  const p = spring({frame: f(t - at), fps: FPS, config: {damping: 13, mass: 0.7}});
  const fl = Math.sin((t - at) * 1.8 + x) * 10;
  return (
    <div style={{position: 'absolute', left: x - 190, top: y - 240 + fl, width: 380, height: 480, borderRadius: 34, overflow: 'hidden', opacity: Math.min(1, p * 1.5),
      transform: `scale(${0.6 + 0.4 * p}) rotate(${rot}deg)`, background: 'rgba(255,240,220,0.14)', border: '1px solid rgba(255,230,190,0.35)',
      backdropFilter: 'blur(18px)', boxShadow: '0 30px 60px rgba(0,0,0,0.35)'}}>
      <div style={{margin: 14, height: 350, borderRadius: 24, backgroundImage: `url(${staticFile(img)})`, backgroundSize: '260%', backgroundPosition: pos}} />
      <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: '#FFF3DE'}}>{label}</div>
    </div>
  );
};

const NotesScene: React.FC<{s: Full}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(s.from)} layout="none"><Cover src="broll/ink2.mp4" video offset={13} from={s.from} to={s.to} z={[1.1, 1.22]} /></Sequence>
    <AbsoluteFill style={{background: 'rgba(22,11,4,0.45)'}} />
    <Shade top={0.55} bottom={0.55} />
    <AbsoluteFill style={{top: 300, alignItems: 'center'}}>
      <PopIn at={28.6}><div style={sans(62)}>des notes</div></PopIn>
      <PopIn at={28.94}><Serif text="ambrées" size={200} /></PopIn>
    </AbsoluteFill>
    <Glass at={28.94} x={330} y={1130} img="img/p3.jpg" pos="92% 80%" label="AMBRE" rot={-6} />
    <Glass at={29.64} x={750} y={1210} img="img/p3.jpg" pos="12% 82%" label="BOIS DE SANTAL" rot={6} />
  </AbsoluteFill>
);

const EmpreinteScene: React.FC<{s: Full}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(s.from)} layout="none"><Cover src="broll/ink2.mp4" video offset={19} from={s.from} to={s.to} z={[1.25, 1.05]} /></Sequence>
    <AbsoluteFill style={{background: 'rgba(22,11,4,0.5)'}} />
    <SmokeOverlay from={s.from} to={s.to} offset={3.5} opacity={0.3} />
    <Shade top={0.35} bottom={0.6} />
    <AbsoluteFill style={{top: 560, alignItems: 'center'}}>
      <PopIn at={36.1}><div style={sans(60)}>une fragrance qui laisse</div></PopIn>
      <PopIn at={37.0}><Serif text="une empreinte" size={210} /></PopIn>
      <PopIn at={37.71}><Heavy text="SANS EN FAIRE TROP." size={80} style={{marginTop: 40}} /></PopIn>
    </AbsoluteFill>
  </AbsoluteFill>
);

const EndScene: React.FC<{s: Full}> = ({s}) => {
  const t = useT();
  const p = spring({frame: f(t - 42.4), fps: FPS, config: {damping: 15, mass: 0.8}});
  return (
    <AbsoluteFill style={{background: '#120B06'}}>
      <Img src={staticFile('img/p4.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.45)', transform: 'scale(1.3)'}} />
      <Embers from={s.from} to={s.to + 1} n={30} seed="end" opacity={0.8} />
      <div style={{position: 'absolute', left: 540 - 380, top: 300, width: 760, height: 616, borderRadius: 40, overflow: 'hidden', transform: `translateY(${(1 - p) * 900}px)`,
        boxShadow: '0 40px 90px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile('img/p4.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <AbsoluteFill style={{top: 1040, alignItems: 'center'}}>
        <PopIn at={42.4}><div style={sans(58)}>Celui-ci, c'est ma</div></PopIn>
        <PopIn at={43.4}><Serif text="meilleure" size={150} /></PopIn>
        <PopIn at={43.74}><Serif text="recommandation." size={130} /></PopIn>
      </AbsoluteFill>
      <AbsoluteFill style={{top: 1560, alignItems: 'center'}}>
        <PopIn at={43.9}>
          <div style={{display: 'flex', gap: 16}}>
            <div style={{padding: '18px 30px', borderRadius: 999, background: C.goldLight, ...heavy(34, C.ink), letterSpacing: 2}}>TOM FORD · ÉBÈNE FUMÉ</div>
          </div>
        </PopIn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Product2Scene: React.FC<{s: Full}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Cover src="img/p5.jpg" from={s.from} to={s.to} z={[1.15, 1.32]} pos="40% 50%" />
    <Shade top={0.45} bottom={0.55} />
    <Corners at={14.05} box={[170, 520, 740, 860]} />
    <Tag at={14.2} x={170} y={450} text="PRIVATE BLEND" dark />
    <Tag at={14.76} x={560} y={1410} text="DÉDIÉ À L'HOMME" />
    <AbsoluteFill style={{top: 210, alignItems: 'center'}}>
      <PopIn at={14.36}><Heavy text="À LA BASE" size={150} /></PopIn>
    </AbsoluteFill>
  </AbsoluteFill>
);

const SCENES: Record<string, React.FC<{s: Full}>> = {
  product2: Product2Scene,
  hookMacro: HookMacro, title: TitleScene, gold: GoldScene, feminin: FemininScene, notes: NotesScene, empreinte: EmpreinteScene, end: EndScene,
};

const FullWrap: React.FC<{s: Full; children: React.ReactNode}> = ({s, children}) => {
  const t = useT();
  const pin = interpolate(t, [s.from, s.from + 0.28], [0, 1], {...clamp, easing: ease});
  const out = s.to >= DURATION_V2 ? 1 : interpolate(t, [s.to - 0.16, s.to], [1, 0], clamp);
  const outBlur = s.to >= DURATION_V2 ? 0 : interpolate(t, [s.to - 0.16, s.to], [0, 18], clamp);
  let tf = '', blur = outBlur, op = out;
  if (s.enter === 'whip') { tf = `translateX(${(1 - pin) * 1080}px)`; blur += (1 - pin) * 30; }
  if (s.enter === 'up') { tf = `translateY(${(1 - pin) * 1920}px)`; blur += (1 - pin) * 20; }
  if (s.enter === 'zoom') { tf = `scale(${1.35 - 0.35 * pin})`; blur += (1 - pin) * 24; op = Math.min(out, pin * 1.5); }
  if (s.enter === 'flash' || s.enter === 'cut') op = out;
  tf += ` scale(${1 + interpolate(t, [s.to - 0.16, s.to], [0, 0.15], clamp)})`;
  return <AbsoluteFill style={{transform: tf, filter: blur > 0.5 ? `blur(${blur}px)` : undefined, opacity: op}}>{children}</AbsoluteFill>;
};

/* ---------------------------------------------------------------- audio */
// SFX cue list + levels live in scripts/mix_sfx.py (rendered to public/sfx_stem_v3.wav)

// Song drop (31.08 s into the track) lands on "percutant" (34.51)
const MUSIC_IN = 34.51 - 31.08;
const Music: React.FC = () => (
  <Sequence from={f(MUSIC_IN)}>
    <Audio src={staticFile('music.wav')} volume={(fr) => {
      const t = fr / FPS + MUSIC_IN;
      const fadeIn = interpolate(t, [MUSIC_IN, MUSIC_IN + 0.8], [0, 1], clamp);
      const fadeOut = interpolate(t, [44.0, MUSIC_IN + 41.25], [1, 0], clamp);
      return Math.pow(10, (t >= 34.51 ? -20 : -16) / 20) * fadeIn * fadeOut;
    }} />
  </Sequence>
);

/* ------------------------------------------------------------------ main */
export const ReelV2: React.FC = () => {
  const t = useT();
  const cam = camAt(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* talking-head world (shares one camera) */}
      <AbsoluteFill style={{transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`, transformOrigin: '50% 34%'}}>
        <OffthreadVideo src={staticFile('base_v2.mp4')} muted />
        <BgLayer />
        <Embers from={30.2} to={32.55} n={45} seed="fb" size={1.2} />
        <LightLeak from={30.2} to={32.55} />
        <SmokeOverlay from={9.38} to={10.59} offset={3.5} opacity={0.35} />
        <BehindLayer />
        <Foreground />
      </AbsoluteFill>
      <Embers from={30.2} to={32.55} n={14} seed="ff" size={1.6} opacity={0.8} />
      <Sparkles at={19.42} cx={540} cy={1250} n={22} />
      <Sparkles at={19.6} cx={420} cy={520} n={10} />
      <Pills />
      <Stamp />
      <FrontLayer />
      <Slider />
      {FULL.map((s, i) => {
        const Comp = SCENES[s.kind];
        return (
          t >= s.from && t < s.to ? <AbsoluteFill key={i}><FullWrap s={s}><Comp s={s} /></FullWrap></AbsoluteFill> : null
        );
      })}
      <Captions />
      <Flash at={0.0} dur={0.18} />
      <Flash at={2.28} dur={0.2} />
      <Flash at={26.18} dur={0.16} color="#FFE7C2" />
      <Flash at={34.51} dur={0.22} />
      {/* audio */}
      {/* voice: levelled + light compression; SFX: one stem mixed relative to the voice (scripts/mix_sfx.py) */}
      <Audio src={staticFile('voice_v3.wav')} />
      <Audio src={staticFile('sfx_stem_v3.wav')} />
      <Music />
    </AbsoluteFill>
  );
};
