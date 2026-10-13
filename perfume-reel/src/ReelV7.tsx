import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, Easing,
} from 'remotion';
import wordsJson from './words_v7.json';

/* =====================================================================
   Ébène Fumé — v7 · 22 s cut for TikTok / Reels
   Story: claim ("Les gens ne vont pas l'oublier.") → product reveal → paradox
   (a men's fragrance… on a woman) → character → notes → power → payoff → recommendation.
   Only the wall behind her is ever replaced (scripts/rvm_wall.py).
   All times are OUTPUT seconds.
   ===================================================================== */

export const FPS = 30;
export const DURATION_V7 = 638 / 30 + 0.9; // 21.27 s of voice + end-card hold

const C = {paper: '#F4F1EC', grid: 'rgba(60,40,20,0.06)', ink: '#1C1712', gold: '#B8843A', goldLight: '#E2B36A'};
const SANS = 'Inter, sans-serif';
const SERIF = '"Playfair Display", serif';
const SHADOW = '0 2px 6px rgba(0,0,0,0.35), 0 6px 26px rgba(0,0,0,0.45)';

const f = (s: number) => Math.round(s * FPS);
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.inOut(Easing.cubic);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useT = () => useCurrentFrame() / FPS;
const win = (t: number, a: number, b: number, fi = 0.12, fo = 0.12) => interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], clamp);

/* ------------------------------------------------------------ timeline */
type Full = {from: number; to: number; kind: string; enter: 'cut' | 'up' | 'zoom'};
const FULL: Full[] = [
  {from: 0.95, to: 2.83, kind: 'title', enter: 'up'},
  {from: 11.3, to: 13.32, kind: 'notes', enter: 'zoom'},
  {from: 14.4, to: 15.62, kind: 'fire', enter: 'cut'},
  {from: 17.78, to: 19.49, kind: 'empreinte', enter: 'zoom'},
  {from: 19.49, to: DURATION_V7, kind: 'end', enter: 'up'},
];
const fullAt = (t: number) => FULL.find((s) => t >= s.from && t < s.to);

// Centred emphasis blocks (replace the caption while on screen)
type Block = {
  from: number; to: number; y?: number; dark?: boolean;
  top?: string; topAt?: number;
  main: string; mainAt: number; kind: 'heavy' | 'serif'; color?: string; strikeAt?: number;
  bottom?: string; bottomAt?: number;
};
const BLOCKS: Block[] = [
  {from: 6.94, to: 8.03, top: 'un petit', main: 'TRUC EN PLUS.', mainAt: 7.52, kind: 'heavy'},
  {from: 10.29, to: 11.3, top: 'avec beaucoup de', main: 'caractère', mainAt: 10.77, kind: 'serif'},
];
const blockAt = (t: number) => BLOCKS.find((b) => t >= b.from && t < b.to);

// The wall behind her: optional new background + words, under the wall-only cut-out clip
type WallText = {text: string; at: number; kind: 'heavy' | 'serif' | 'small'; color?: string; until?: number; strikeAt?: number};
type Wall = {from: number; to: number; clip: string; clipFrom: number; bg?: {src?: string; css?: string; video?: boolean; offset?: number; pos?: string; dark?: number; zoom?: [number, number]}; texts: WallText[]; top?: number};
const PASTEL = 'radial-gradient(ellipse at 30% 25%, #F7DCE0 0%, #F3E4CF 45%, #E7DAF0 80%, #EFE6F3 100%)';
const WALLS: Wall[] = [
  {from: 0.0, to: 0.95, clip: 'wall_hook.webm', clipFrom: 0.0, bg: {src: 'img/p2.jpg', pos: '50% 22%', dark: 0.12, zoom: [1.3, 1.15]},
    texts: [{text: 'les gens ne vont pas', at: 0.05, kind: 'small'}, {text: "L'OUBLIER.", at: 0.78, kind: 'heavy'}]},
  {from: 4.28, to: 5.01, clip: 'wall_v7a.webm', clipFrom: 4.28, texts: [{text: 'POUR HOMME.', at: 4.61, kind: 'heavy'}]},
  {from: 5.01, to: 6.43, clip: 'wall_v7b.webm', clipFrom: 5.01,
    texts: [{text: 'POUR HOMME.', at: 4.61, kind: 'heavy', strikeAt: 5.05, until: 5.59}, {text: 'UNE FEMME', at: 5.59, kind: 'heavy', color: C.goldLight}]},
  {from: 8.83, to: 9.83, clip: 'wall_body1.webm', clipFrom: 8.83, bg: {src: 'img/p3.jpg', pos: '30% 50%', dark: 0.2, zoom: [1.3, 1.2]},
    texts: [{text: 'BOISÉ.', at: 8.83, kind: 'heavy'}]},
  {from: 9.83, to: 11.04, clip: 'wall_body1.webm', clipFrom: 8.83, bg: {src: 'broll/smoke.mp4', video: true, offset: 3.2, zoom: [1.0, 1.08]},
    texts: [{text: 'MYSTÉRIEUX.', at: 9.83, kind: 'heavy'}]},
  {from: 16.98, to: 17.78, clip: 'wall_v7c.webm', clipFrom: 16.98, top: 165,
    texts: [{text: "c'est plus", at: 16.99, kind: 'small'}, {text: 'PERCUTANT.', at: 17.32, kind: 'heavy', color: C.goldLight}]},
];
const wallAt = (t: number) => WALLS.find((w) => t >= w.from && t < w.to);

/* -------------------------------------------------------------- camera
   [time, scale, duration]: duration ≤ 0.12 = snap (punch-in/out with motion blur),
   longer = smooth push / pull. Origin sits on her face. */
const SNAP = 0.15;
const push = (from: number, to: number, ds: number) => Math.abs(to - from) / ds; // one push rate: 0.035 / s
const CAM: [number, number, number][] = [
  [0.0, 1.22, 0.01], [0.02, 1.1, SNAP], [0.2, 1.13, 0.55], [0.78, 1.18, SNAP],   // hook: slam back, creep, punch on L'OUBLIER
  [2.83, 1.0, 0.01], [2.86, 1.06, push(1.0, 1.06, 0.035)], [4.61, 1.1, SNAP],     // "dédié à la gente masculine" → POUR HOMME
  [5.01, 1.03, 0.01], [5.59, 1.1, SNAP], [7.52, 1.16, SNAP],                       // jump cut, UNE FEMME, TRUC EN PLUS
  [8.03, 1.0, 0.01], [9.83, 1.1, SNAP], [10.77, 1.16, SNAP],                       // boisé (wide, wall visible) → mystérieux → caractère
  [13.32, 1.0, 0.01], [13.35, 1.04, push(1.0, 1.04, 0.035)],
  [15.62, 1.0, 0.01], [15.65, 1.06, push(1.0, 1.06, 0.035)], [17.32, 1.16, SNAP], // build → PERCUTANT
];
const camAt = (t: number) => {
  let v = 1;
  for (let i = 0; i < CAM.length; i++) {
    const [k, s, d] = CAM[i];
    if (t < k) break;
    const p = interpolate(t, [k, k + d], [0, 1], {...clamp, easing: d <= 0.12 ? ease : inOut});
    v = v + (s - v) * p;
  }
  return v;
};
const camBlur = (t: number) => {
  if (CAM.some(([k, , d]) => d < 0.05 && Math.abs(t - k) < 1 / 25)) return 0; // hard cuts: no smear
  const dv = Math.abs(camAt(t + 1 / 60) - camAt(t - 1 / 60)) * 30; // scale change per second
  return Math.min(7, dv * 9);
};

/* ------------------------------------------------------------- type */
const fit = (text: string, size: number, k: number, maxW = 940) => Math.min(size, maxW / (text.length * k));

const Small: React.FC<{text: string; at: number; dark?: boolean}> = ({text, at, dark}) => {
  const t = useT();
  if (t < at) return <div style={{height: 58}} />;
  const p = interpolate(t, [at, at + 0.1], [0, 1], clamp);
  return <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 46, letterSpacing: -0.4, lineHeight: '58px', color: dark ? C.ink : '#fff',
    textShadow: dark ? 'none' : SHADOW, opacity: p, transform: `translateY(${(1 - p) * 8}px)`}}>{text}</div>;
};

const Main: React.FC<{b: Block; dark?: boolean}> = ({b, dark}) => {
  const t = useT();
  const heavy = b.kind === 'heavy';
  const size = heavy ? fit(b.main, 150, 0.68) : fit(b.main, 180, 0.48);
  if (t < b.mainAt) return <div style={{height: size * 0.95}} />;
  const p = interpolate(t, [b.mainAt, b.mainAt + (heavy ? 0.13 : 0.2)], [0, 1], {...clamp, easing: ease});
  const strike = b.strikeAt !== undefined ? interpolate(t, [b.strikeAt, b.strikeAt + 0.16], [0, 1], {...clamp, easing: ease}) : 0;
  const style: React.CSSProperties = heavy
    ? {fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.045, lineHeight: 0.95, textTransform: 'uppercase',
       color: b.color ?? (dark ? C.ink : '#fff'), opacity: p, transform: `scale(${1.12 - 0.12 * p})`}
    : {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: size, letterSpacing: -size * 0.02, lineHeight: 1.0,
       color: b.color ?? (dark ? C.gold : C.goldLight), opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: `blur(${(1 - p) * 4}px)`};
  return (
    <div style={{position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', textShadow: dark ? 'none' : SHADOW, ...style}}>
      {b.main}
      {strike > 0 ? <div style={{position: 'absolute', left: '-2%', top: '50%', height: Math.max(6, size * 0.07), width: `${104 * strike}%`,
        background: C.goldLight, transform: 'translateY(-50%)', boxShadow: '0 2px 10px rgba(0,0,0,0.35)'}} /> : null}
    </div>
  );
};

const BlockView: React.FC<{b: Block; dark?: boolean}> = ({b, dark}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: (b.y ?? 1110) - 960}}>
    <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {b.top ? <Small text={b.top} at={b.topAt ?? b.from} dark={dark} /> : null}
      <Main b={b} dark={dark} />
      {b.bottom ? <Small text={b.bottom} at={b.bottomAt ?? b.mainAt} dark={dark} /> : null}
    </div>
  </AbsoluteFill>
);

const Blocks: React.FC = () => {
  const b = blockAt(useT());
  return b ? <BlockView b={b} /> : null;
};

// Word-by-word captions (1–2 words) at the same centre position
type W = {w: string; s: number; e: number};
const WORDS = wordsJson as W[];
const CHUNKS: W[][] = (() => {
  const out: W[][] = [];
  let cur: W[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const n = WORDS[i + 1];
    if (!n || /[.,?]$/.test(w.w) || n.s - w.e > 0.25 || cur.length >= 2 || w.w.length > 7) { out.push(cur); cur = []; }
  });
  return out;
})();

const Captions: React.FC = () => {
  const t = useT();
  if (fullAt(t) || blockAt(t) || wallAt(t)) return null;
  const i = CHUNKS.findIndex((c, k) => t >= c[0].s - 0.03 && t < (CHUNKS[k + 1]?.[0].s ?? DURATION_V7) - 0.03);
  if (i < 0) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: 1110 - 960}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 50, letterSpacing: -0.6, color: '#fff', textShadow: SHADOW, whiteSpace: 'nowrap'}}>
        {CHUNKS[i].map((w, k) => {
          const p = interpolate(t, [w.s - 0.03, w.s + 0.04], [0, 1], clamp);
          return <span key={k} style={{display: 'inline-block', margin: '0 7px', opacity: p, transform: `scale(${0.92 + 0.08 * p})`}}>{w.w.replace(/,$/, '')}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------- the wall layer */
const WallBg: React.FC<{w: Wall}> = ({w}) => {
  const t = useT();
  if (!w.bg) return null;
  const b = w.bg;
  const o = win(t, w.from, w.to, 0.06, 0.06);
  const z = b.zoom ? interpolate(t, [w.from, w.to], b.zoom, clamp) : 1.05;
  const st: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: b.pos ?? '50% 50%', transform: `scale(${z})`};
  return (
    <AbsoluteFill style={{opacity: o, background: '#000'}}>
      {b.css ? <AbsoluteFill style={{background: b.css}} /> : b.video ? (
        <Sequence from={f(w.from)} layout="none"><OffthreadVideo src={staticFile(b.src!)} muted trimBefore={f(b.offset ?? 0)} style={st} /></Sequence>
      ) : <Img src={staticFile(b.src!)} style={st} />}
      <AbsoluteFill style={{background: `rgba(10,6,3,${b.dark ?? 0})`}} />
    </AbsoluteFill>
  );
};

const WallTexts: React.FC<{w: Wall}> = ({w}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{alignItems: 'center', top: w.top ?? 235, opacity: win(t, w.from, w.to, 0.01, 0.1)}}>
      {w.texts.filter((x) => t >= x.at && (x.until === undefined || t < x.until)).map((x, i) => {
        const p = interpolate(t, [x.at, x.at + (x.kind === 'serif' ? 0.2 : 0.12)], [0, 1], {...clamp, easing: ease});
        if (x.kind === 'small') return <div key={i} style={{fontFamily: SANS, fontWeight: 600, fontSize: 48, color: x.color ?? '#fff', textShadow: SHADOW, opacity: p, marginBottom: 6}}>{x.text}</div>;
        if (x.kind === 'serif') {
          const size = fit(x.text, 200, 0.48, 820);
          return <div key={i} style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: size, lineHeight: 1.0, letterSpacing: -size * 0.02, color: x.color ?? C.goldLight,
            opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: `blur(${(1 - p) * 4}px)`}}>{x.text}</div>;
        }
        const size = fit(x.text, 200, 0.68, 840);
        const k = x.strikeAt !== undefined ? interpolate(t, [x.strikeAt, x.strikeAt + 0.16], [0, 1], {...clamp, easing: ease}) : 0;
        return <div key={i} style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.045, lineHeight: 0.92, whiteSpace: 'nowrap',
          color: x.color ?? '#fff', opacity: p, transform: `scale(${1.12 - 0.12 * p})`, textShadow: '0 10px 40px rgba(0,0,0,0.3)'}}>
          {x.text}
          {k > 0 ? <div style={{position: 'absolute', left: '-2%', top: '48%', height: size * 0.08, width: `${104 * k}%`, background: C.goldLight, boxShadow: '0 2px 10px rgba(0,0,0,0.35)'}} /> : null}
        </div>;
      })}
    </AbsoluteFill>
  );
};

// One wall-only cut-out clip per window (sits above the new wall + words)
const WALL_CLIPS: {clip: string; from: number; to: number}[] = (() => {
  const m = new Map<string, {clip: string; from: number; to: number}>();
  for (const w of WALLS) {
    const c = m.get(w.clip) ?? {clip: w.clip, from: w.clipFrom, to: w.to};
    c.to = Math.max(c.to, w.to); m.set(w.clip, c);
  }
  return [...m.values()];
})();

const WallLayer: React.FC = () => {
  const t = useT();
  const w = wallAt(t);
  return (
    <>
      {w ? <WallBg w={w} /> : null}
      {w ? <WallTexts w={w} /> : null}
      {WALL_CLIPS.map((c, i) => (
        <Sequence key={i} from={f(c.from)} durationInFrames={f(c.to) - f(c.from)}>
          <OffthreadVideo src={staticFile(c.clip)} transparent muted />
        </Sequence>
      ))}
    </>
  );
};

/* ---------------------------------------------------------- overlays */
const Flash: React.FC<{at: number; dur?: number}> = ({at, dur = 0.15}) => {
  const t = useT();
  const o = interpolate(t, [at - 0.02, at, at + dur], [0, 0.9, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{background: '#fff', opacity: o}} /> : null;
};

/* ------------------------------------------------------- full scenes */
const Paper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #FBF9F5 0%, ${C.paper} 60%, #E6E0D6 100%)`}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`, backgroundSize: '54px 54px'}} />
    {children}
  </AbsoluteFill>
);

const Cover: React.FC<{src: string; from: number; to: number; z?: [number, number]; pos?: string; video?: boolean; offset?: number}> = ({src, from, to, z = [1.05, 1.15], pos, video, offset = 0}) => {
  const t = useT();
  const st: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos,
    transform: `scale(${interpolate(t, [from, to], z, clamp)})`, filter: src.includes('ink') ? 'saturate(0.78) brightness(0.9)' : undefined};
  return video ? <OffthreadVideo src={staticFile(src)} muted trimBefore={f(offset)} style={st} /> : <Img src={staticFile(src)} style={st} />;
};

const Shade: React.FC<{top?: number; bottom?: number}> = ({top = 0.45, bottom = 0.6}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(8,5,2,${top}) 0%, rgba(8,5,2,0) 35%, rgba(8,5,2,0) 50%, rgba(8,5,2,${bottom}) 100%)`}} />
);

const Tag: React.FC<{at: number; x: number; y: number; text: string; light?: boolean}> = ({at, x, y, text, light}) => {
  const t = useT();
  const p = interpolate(t, [at, at + 0.2], [0, 1], {...clamp, easing: ease});
  return <div style={{position: 'absolute', left: x, top: y, opacity: p, transform: `translateY(${(1 - p) * 10}px)`, padding: '12px 20px', borderRadius: 12,
    background: light ? C.goldLight : 'rgba(20,14,9,0.82)', color: light ? C.ink : C.goldLight, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 2.5}}>{text}</div>;
};

// A soft light sweep across glass (hook + product shots)
const Sweep: React.FC<{from: number; dur: number}> = ({from, dur}) => {
  const t = useT();
  const p = interpolate(t, [from, from + dur], [0, 1], {...clamp, easing: inOut});
  if (p <= 0 || p >= 1) return null;
  return <AbsoluteFill style={{mixBlendMode: 'screen', opacity: Math.sin(p * Math.PI) * 0.55,
    background: `linear-gradient(115deg, rgba(255,255,255,0) ${p * 140 - 30}%, rgba(255,236,200,0.65) ${p * 140 - 15}%, rgba(255,255,255,0) ${p * 140}%)`}} />;
};

const Title: React.FC<{s: Full}> = () => {
  const t = useT();
  const p = spring({frame: f(t - 0.98), fps: FPS, config: {damping: 22, mass: 0.8}});
  const z = interpolate(t, [0.98, 2.83], [1.12, 1.03], clamp);
  return (
    <Paper>
      <div style={{position: 'absolute', left: 540 - 320, top: 330, width: 640, height: 820, borderRadius: 40, overflow: 'hidden',
        transform: `translateY(${(1 - p) * 900}px)`, boxShadow: '0 40px 80px rgba(40,25,10,0.22), 0 8px 20px rgba(40,25,10,0.1)'}}>
        <Img src={staticFile('img/p6.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
        <Sweep from={1.5} dur={0.9} />
      </div>
      <Tag at={1.5} x={80} y={430} text="EAU DE PARFUM" />
      <Tag at={1.7} x={650} y={980} text="PRIVATE BLEND" />
      <BlockView dark b={{from: 1.33, to: 2.83, y: 1340, main: 'TOM FORD', mainAt: 1.33, kind: 'heavy', color: C.ink}} />
      <BlockView dark b={{from: 2.1, to: 2.83, y: 1480, main: 'Ébène Fumé', mainAt: 2.1, kind: 'serif', color: C.gold}} />
    </Paper>
  );
};

const NoteCard: React.FC<{at: number; x: number; y: number; pos: string; label: string; rot: number}> = ({at, x, y, pos, label, rot}) => {
  const t = useT();
  const p = spring({frame: f(t - at), fps: FPS, config: {damping: 18, mass: 0.6}});
  return (
    <div style={{position: 'absolute', left: x - 190, top: y - 240, width: 380, height: 480, borderRadius: 34, overflow: 'hidden', opacity: Math.min(1, p * 1.5),
      transform: `translateY(${(1 - p) * 50}px) rotate(${rot}deg)`, background: 'rgba(255,240,220,0.14)', border: '1px solid rgba(255,230,190,0.35)',
      backdropFilter: 'blur(18px)', boxShadow: '0 30px 60px rgba(0,0,0,0.35)'}}>
      <div style={{margin: 14, height: 350, borderRadius: 24, backgroundImage: `url(${staticFile('img/p3.jpg')})`, backgroundSize: '260%', backgroundPosition: pos}} />
      <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: '#FFF3DE'}}>{label}</div>
    </div>
  );
};

const Notes: React.FC<{s: Full}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(s.from)} layout="none"><Cover src="broll/ink2.mp4" video offset={13} from={s.from} to={s.to} z={[1.1, 1.2]} /></Sequence>
    <AbsoluteFill style={{background: 'rgba(22,11,4,0.45)'}} />
    <BlockView b={{from: s.from, to: s.to, y: 520, top: 'des notes', main: 'ambrées', mainAt: 12.06, kind: 'serif'}} />
    <NoteCard at={12.06} x={330} y={1180} pos="92% 80%" label="AMBRE" rot={-4} />
    <NoteCard at={12.86} x={750} y={1250} pos="12% 82%" label="BOIS DE SANTAL" rot={4} />
  </AbsoluteFill>
);

const Fire: React.FC<{s: Full}> = ({s}) => {
  const t = useT();
  // the photo itself punches in on each word
  const zp = 1.1 + 0.09 * interpolate(t, [14.6, 14.7], [0, 1], {...clamp, easing: ease}) + 0.09 * interpolate(t, [15.02, 15.12], [0, 1], {...clamp, easing: ease})
    + 0.03 * interpolate(t, [s.from, s.to], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile('img/p2.jpg')} style={{position: 'absolute', width: 1920, height: 1920, left: -420, top: 0, objectFit: 'cover', transform: `scale(${zp})`}} />
      <Shade top={0.35} bottom={0.7} />
      {t < 15.02
        ? <BlockView b={{from: s.from, to: 15.02, y: 1640, top: 'beaucoup', main: 'PLUS FORT.', mainAt: 14.6, kind: 'heavy'}} />
        : <BlockView b={{from: 15.02, to: s.to, y: 1640, main: 'PLUS PUISSANT.', mainAt: 15.02, kind: 'heavy', color: C.goldLight}} />}
    </AbsoluteFill>
  );
};

const Empreinte: React.FC<{s: Full}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(s.from)} layout="none"><Cover src="broll/gold.mp4" video offset={2} from={s.from} to={s.to} z={[1.18, 1.06]} /></Sequence>
    <AbsoluteFill style={{background: 'rgba(10,6,3,0.3)'}} />
    <BlockView b={{from: s.from, to: s.to, top: 'qui laisse', topAt: s.from, main: 'une empreinte', mainAt: 18.29, kind: 'serif', bottom: 'sans en faire trop.', bottomAt: 19.0}} />
  </AbsoluteFill>
);

const End: React.FC<{s: Full}> = () => {
  const t = useT();
  const p = spring({frame: f(t - 19.52), fps: FPS, config: {damping: 22, mass: 0.8}});
  const pill = interpolate(t, [21.0, 21.2], [0, 1], clamp);
  const z = interpolate(t, [19.5, DURATION_V7], [1.0, 1.06], clamp);
  return (
    <AbsoluteFill style={{background: '#120B06'}}>
      <Img src={staticFile('img/p4.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.45)', transform: 'scale(1.3)'}} />
      <div style={{position: 'absolute', left: 540 - 380, top: 300, width: 760, height: 616, borderRadius: 40, overflow: 'hidden', transform: `translateY(${(1 - p) * 900}px) scale(${z})`, boxShadow: '0 40px 90px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile('img/p4.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <Sweep from={20.2} dur={1.0} />
      </div>
      <BlockView b={{from: 19.52, to: 99, y: 1250, top: "celui-ci, c'est ma", main: 'meilleure', mainAt: 20.54, kind: 'serif', bottom: 'recommandation.', bottomAt: 20.88}} />
      <AbsoluteFill style={{top: 1560, alignItems: 'center'}}>
        <div style={{opacity: pill, transform: `translateY(${(1 - pill) * 10}px)`, padding: '18px 30px', borderRadius: 999, background: C.goldLight,
          fontFamily: SANS, fontWeight: 900, fontSize: 32, letterSpacing: 2, color: C.ink}}>TOM FORD · ÉBÈNE FUMÉ</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{s: Full}>> = {title: Title, notes: Notes, fire: Fire, empreinte: Empreinte, end: End};

const FullWrap: React.FC<{s: Full; children: React.ReactNode}> = ({s, children}) => {
  const t = useT();
  const pin = interpolate(t, [s.from, s.from + 0.22], [0, 1], {...clamp, easing: ease});
  const last = s.to >= DURATION_V7;
  const out = last ? 0 : interpolate(t, [s.to - 0.1, s.to], [0, 1], clamp);
  let tf = `scale(${1 + out * 0.06})`, blur = out * 10, op = 1 - out * 0.6;
  if (s.enter === 'up') { tf += ` translateY(${(1 - pin) * 1920}px)`; blur += (1 - pin) * 10; }
  if (s.enter === 'zoom') { tf += ` scale(${1.1 - 0.1 * pin})`; blur += (1 - pin) * 8; op = Math.min(op, pin * 1.5); }
  return <AbsoluteFill style={{transform: tf, filter: blur > 0.5 ? `blur(${blur}px)` : undefined, opacity: op}}>{children}</AbsoluteFill>;
};

/* ---------------------------------------------------------------- audio */
// Song drop (31.08 s into the track) lands on "PERCUTANT" (17.63): play the song from 13.45 s. Fixed level.
const SONG_OFFSET = 31.08 - 17.63;
const Music: React.FC = () => (
  <Audio src={staticFile('music.wav')} trimBefore={Math.round(SONG_OFFSET * FPS)} volume={(fr) => {
    const t = fr / FPS;
    const fadeIn = interpolate(t, [0, 0.25], [0, 1], clamp);
    const fadeOut = interpolate(t, [DURATION_V7 - 0.8, DURATION_V7], [1, 0], clamp);
    return Math.pow(10, -18 / 20) * fadeIn * fadeOut;
  }} />
);

/* ------------------------------------------------------------------ main */
export const ReelV7: React.FC = () => {
  const t = useT();
  const s = camAt(t);
  const mb = camBlur(t);
  const full = fullAt(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '50% 32%', filter: mb > 0.4 ? `blur(${mb}px)` : undefined}}>
        <OffthreadVideo src={staticFile('base_v7.mp4')} muted />
        <WallLayer />
      </AbsoluteFill>
      {full ? <AbsoluteFill><FullWrap s={full}>{React.createElement(SCENES[full.kind], {s: full})}</FullWrap></AbsoluteFill> : null}
      {!full ? <Blocks /> : null}
      <Captions />
      <Flash at={0.95} />
      <Flash at={17.63} dur={0.18} />
      {/* audio: levelled voice, one SFX stem (scripts/mix_sfx.py + sfx_cues_v7.json), music at fixed level */}
      <Audio src={staticFile('voice_v7.wav')} />
      <Audio src={staticFile('sfx_stem_v7.wav')} />
      <Music />
    </AbsoluteFill>
  );
};
