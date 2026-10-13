import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, Easing,
} from 'remotion';
import wordsJson from './words_v6.json';

/* =====================================================================
   Ébène Fumé — v6
   - Only the WALL behind her is cut out (scripts/rvm_wall.py): bed, pillows and the
     way she sits stay real. New backgrounds, words and motion design live on that wall.
   - Hook opens on "Les gens ne vont pas l'oublier." with the wall on fire.
   - Fewer zooms, all at the same speed (snap 0.15 s / slow push at one rate).
   - Shorter cutaways; no slider bar, no swatch page.
   All times are OUTPUT seconds.
   ===================================================================== */

export const FPS = 30;
export const DURATION_V6 = 1250 / 30 + 1.0; // 41.67 s of voice + 1 s end-card hold

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
  {from: 0.95, to: 2.31, kind: 'hook', enter: 'cut'},
  {from: 2.31, to: 4.22, kind: 'title', enter: 'up'},
  {from: 8.45, to: 10.19, kind: 'gold', enter: 'zoom'},
  {from: 12.29, to: 13.69, kind: 'product', enter: 'cut'},
  {from: 26.0, to: 27.6, kind: 'notes', enter: 'zoom'},
  {from: 28.9, to: 30.05, kind: 'fire', enter: 'cut'},
  {from: 34.4, to: 35.79, kind: 'empreinte', enter: 'zoom'},
  {from: 39.89, to: DURATION_V6, kind: 'end', enter: 'up'},
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
  {from: 0.97, to: 1.72, y: 1660, top: 'un parfum', main: 'POUR HOMME.', mainAt: 0.97, kind: 'heavy', strikeAt: 1.53},
  {from: 1.72, to: 2.31, y: 1660, top: "quand c'est", main: 'une femme', mainAt: 1.72, kind: 'serif', bottom: 'qui le porte', bottomAt: 2.02},
  {from: 7.69, to: 8.45, top: 'beaucoup de', main: 'caractère', mainAt: 8.12, kind: 'serif'},
  {from: 10.19, to: 11.03, top: 'et assez', main: 'AUDACIEUX.', mainAt: 10.64, kind: 'heavy'},
  {from: 16.65, to: 17.78, top: 'un petit', main: 'TRUC EN PLUS.', mainAt: 17.23, kind: 'heavy'},
  {from: 37.15, to: 38.17, top: 'changer de', main: 'parfum ?', mainAt: 37.63, kind: 'serif'},
];
const blockAt = (t: number) => BLOCKS.find((b) => t >= b.from && t < b.to);

// The wall behind her: optional new background + words, under the wall-only cut-out clip
type WallText = {text: string; at: number; kind: 'heavy' | 'serif' | 'small'; color?: string; until?: number};
type Wall = {from: number; to: number; clip: string; clipFrom: number; bg?: {src?: string; css?: string; video?: boolean; offset?: number; pos?: string; dark?: number; zoom?: [number, number]}; texts: WallText[]; top?: number};
const PASTEL = 'radial-gradient(ellipse at 30% 25%, #F7DCE0 0%, #F3E4CF 45%, #E7DAF0 80%, #EFE6F3 100%)';
const WALLS: Wall[] = [
  {from: 0.0, to: 0.95, clip: 'wall_hook.webm', clipFrom: 0.0, bg: {src: 'img/p2.jpg', pos: '50% 22%', dark: 0.12, zoom: [1.3, 1.15]},
    texts: [{text: 'les gens ne vont pas', at: 0.05, kind: 'small'}, {text: "L'OUBLIER.", at: 0.78, kind: 'heavy'}]},
  {from: 5.91, to: 6.91, clip: 'wall_body1.webm', clipFrom: 5.91, bg: {src: 'img/p3.jpg', pos: '30% 50%', dark: 0.2, zoom: [1.3, 1.2]},
    texts: [{text: 'BOISÉ.', at: 5.91, kind: 'heavy'}]},
  {from: 6.91, to: 8.12, clip: 'wall_body1.webm', clipFrom: 5.91, bg: {src: 'broll/smoke.mp4', video: true, offset: 3.2, zoom: [1.0, 1.08]},
    texts: [{text: 'MYSTÉRIEUX.', at: 6.91, kind: 'heavy'}]},
  {from: 15.2, to: 16.1, clip: 'wall_femme.webm', clipFrom: 15.2, texts: [{text: 'UNE FEMME', at: 15.3, kind: 'heavy', color: C.goldLight}]},
  {from: 19.4, to: 23.75, clip: 'wall_feminin.webm', clipFrom: 19.4, bg: {css: PASTEL}, top: 210,
    texts: [{text: 'féminin', at: 19.51, kind: 'serif', color: C.gold, until: 21.9},
            {text: 'subtil.', at: 21.9, kind: 'serif', color: C.gold, until: 22.48}, {text: 'sucré.', at: 22.48, kind: 'serif', color: C.gold, until: 23.16}, {text: 'fleuri.', at: 23.16, kind: 'serif', color: C.gold}]},
  {from: 31.9, to: 33.0, clip: 'wall_perc.webm', clipFrom: 31.9, top: 165, texts: [{text: "c'est plus", at: 31.92, kind: 'small'}, {text: 'PERCUTANT.', at: 32.04, kind: 'heavy', color: C.goldLight}]},
  {from: 38.95, to: 39.9, clip: 'wall_quoi.webm', clipFrom: 38.95, texts: [{text: 'QUOI PRENDRE ?', at: 39.09, kind: 'heavy'}]},
];
const wallAt = (t: number) => WALLS.find((w) => t >= w.from && t < w.to);

/* -------------------------------------------------------------- camera
   [time, scale, duration]: duration ≤ 0.12 = snap (punch-in/out with motion blur),
   longer = smooth push / pull. Origin sits on her face. */
const SNAP = 0.15;
const push = (from: number, to: number, ds: number) => Math.abs(to - from) / ds; // one push rate: 0.035 / s
const CAM: [number, number, number][] = [
  [0.0, 1.22, 0.01], [0.02, 1.1, SNAP], [0.2, 1.13, 0.55], [0.78, 1.18, SNAP],         // hook: slam back, creep, punch on L'OUBLIER
  [4.22, 1.0, 0.01], [4.25, 1.06, push(1.0, 1.06, 0.035)],                              // "ce que j'aime" slow push
  [6.91, 1.1, SNAP], [8.12, 1.16, SNAP],                                                 // mystérieux / caractère
  [10.19, 1.0, 0.01], [10.64, 1.12, SNAP], [11.03, 1.0, SNAP], [11.06, 1.04, push(1.0, 1.04, 0.035)],
  [13.69, 1.0, 0.01], [15.3, 1.1, SNAP], [17.23, 1.16, SNAP], [17.78, 1.0, SNAP], [17.8, 1.05, push(1.0, 1.05, 0.035)],
  [19.51, 1.0, SNAP], [19.55, 1.06, push(1.0, 1.06, 0.035)], [24.07, 1.12, SNAP],          // pastel wall wide, then "celui-ci"
  [27.6, 1.0, 0.01], [27.62, 1.04, push(1.0, 1.04, 0.035)],
  [30.05, 1.0, 0.01], [30.07, 1.07, push(1.0, 1.07, 0.035)], [32.04, 1.16, SNAP], [33.0, 1.06, SNAP],
  [35.79, 1.0, 0.01], [37.63, 1.1, SNAP], [38.17, 1.0, SNAP], [39.09, 1.12, SNAP],
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
  const i = CHUNKS.findIndex((c, k) => t >= c[0].s - 0.03 && t < (CHUNKS[k + 1]?.[0].s ?? DURATION_V6) - 0.03);
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
        return <div key={i} style={{fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.045, lineHeight: 0.92, whiteSpace: 'nowrap',
          color: x.color ?? '#fff', opacity: p, transform: `scale(${1.12 - 0.12 * p})`, textShadow: '0 10px 40px rgba(0,0,0,0.3)'}}>{x.text}</div>;
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

// Product card sliding in front of her on "celui-ci" (like the phone in the Wimbledon edit)
const ProductCard: React.FC = () => {
  const t = useT();
  const at = 24.07, to = 25.6;
  if (t < at - 0.05 || t >= to) return null;
  const p = spring({frame: f(t - at), fps: FPS, config: {damping: 20, mass: 0.7}});
  const out = interpolate(t, [to - 0.18, to], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 600, top: 560, width: 400, height: 520, borderRadius: 32, overflow: 'hidden',
      transform: `translateX(${(1 - p) * 640 + out * 640}px) rotate(${4 - 2 * p}deg)`, boxShadow: '0 30px 70px rgba(0,0,0,0.45)'}}>
      <Img src={staticFile('img/p6.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)'}} />
    </div>
  );
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

const Hook: React.FC<{s: Full}> = ({s}) => {
  const t = useT();
  const z = interpolate(t, [s.from, s.from + 0.25, s.to], [1.32, 1.14, 1.08], {...clamp, easing: Easing.out(Easing.cubic)}) + (t > 1.53 ? 0.03 * Math.exp(-(t - 1.53) * 8) : 0);
  const blur = interpolate(t, [s.from, s.from + 0.18], [8, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile('img/p2.jpg')} style={{position: 'absolute', width: 1920, height: 1920, left: -420, top: 0, objectFit: 'cover', transform: `scale(${z})`, filter: `blur(${blur}px)`}} />
      <Sweep from={1.0} dur={0.9} />
      <Shade top={0.35} bottom={0.85} />
      <Tag at={1.0} x={70} y={150} text="TOM FORD · ÉBÈNE FUMÉ" light />
    </AbsoluteFill>
  );
};

const Title: React.FC<{s: Full}> = () => {
  const t = useT();
  const p = spring({frame: f(t - 2.36), fps: FPS, config: {damping: 22, mass: 0.8}});
  const z = interpolate(t, [2.36, 4.22], [1.12, 1.03], clamp);
  return (
    <Paper>
      <div style={{position: 'absolute', left: 540 - 320, top: 330, width: 640, height: 820, borderRadius: 40, overflow: 'hidden',
        transform: `translateY(${(1 - p) * 900}px)`, boxShadow: '0 40px 80px rgba(40,25,10,0.22), 0 8px 20px rgba(40,25,10,0.1)'}}>
        <Img src={staticFile('img/p6.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
        <Sweep from={2.9} dur={0.9} />
      </div>
      <Tag at={3.0} x={80} y={430} text="EAU DE PARFUM" />
      <Tag at={3.25} x={650} y={980} text="PRIVATE BLEND" />
      <BlockView dark b={{from: 2.69, to: 4.22, y: 1340, main: 'TOM FORD', mainAt: 2.69, kind: 'heavy', color: C.ink}} />
      <BlockView dark b={{from: 3.46, to: 4.22, y: 1480, main: 'Ébène Fumé', mainAt: 3.46, kind: 'serif', color: C.gold}} />
    </Paper>
  );
};

const Gold: React.FC<{s: Full}> = ({s}) => {
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={f(s.from)} layout="none"><Cover src="broll/gold.mp4" video from={s.from} to={s.to} z={[1.08, 1.2]} /></Sequence>
      <AbsoluteFill style={{background: 'rgba(10,6,3,0.25)'}} />
      <BlockView b={{from: 8.91, to: 10.19, top: "d'une grande", topAt: 8.91, main: 'élégance', mainAt: 9.43, kind: 'serif'}} />
    </AbsoluteFill>
  );
};

const Product: React.FC<{s: Full}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Cover src="img/p5.jpg" from={s.from} to={s.to} z={[1.12, 1.3]} pos="40% 50%" />
    <Sweep from={12.4} dur={0.9} />
    <Shade top={0.3} bottom={0.7} />
    <Tag at={12.35} x={80} y={360} text="PRIVATE BLEND" />
    <BlockView b={{from: 12.29, to: 13.69, y: 1640, top: 'dédié à la gente', topAt: 12.29, main: 'MASCULINE.', mainAt: 13.32, kind: 'heavy'}} />
  </AbsoluteFill>
);

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
    <BlockView b={{from: s.from, to: s.to, y: 520, top: 'des notes', main: 'ambrées', mainAt: 26.47, kind: 'serif'}} />
    <NoteCard at={26.47} x={330} y={1180} pos="92% 80%" label="AMBRE" rot={-4} />
    <NoteCard at={27.17} x={750} y={1250} pos="12% 82%" label="BOIS DE SANTAL" rot={4} />
  </AbsoluteFill>
);

const Fire: React.FC<{s: Full}> = ({s}) => {
  const t = useT();
  // the photo itself punches in on each word
  const zp = 1.1 + 0.09 * interpolate(t, [29.01, 29.11], [0, 1], {...clamp, easing: ease}) + 0.09 * interpolate(t, [29.43, 29.53], [0, 1], {...clamp, easing: ease})
    + 0.03 * interpolate(t, [s.from, s.to], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile('img/p2.jpg')} style={{position: 'absolute', width: 1920, height: 1920, left: -420, top: 0, objectFit: 'cover', transform: `scale(${zp})`}} />
      <Shade top={0.35} bottom={0.7} />
      {t < 29.43
        ? <BlockView b={{from: s.from, to: 29.43, y: 1640, top: 'beaucoup', main: 'PLUS FORT.', mainAt: 29.01, kind: 'heavy'}} />
        : <BlockView b={{from: 29.43, to: s.to, y: 1640, main: 'PLUS PUISSANT.', mainAt: 29.43, kind: 'heavy', color: C.goldLight}} />}
    </AbsoluteFill>
  );
};

const Empreinte: React.FC<{s: Full}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(s.from)} layout="none"><Cover src="broll/ink2.mp4" video offset={19} from={s.from} to={s.to} z={[1.22, 1.05]} /></Sequence>
    <AbsoluteFill style={{background: 'rgba(22,11,4,0.58)'}} />
    <BlockView b={{from: s.from, to: s.to, top: 'qui laisse', topAt: s.from, main: 'une empreinte', mainAt: 34.53, kind: 'serif', bottom: 'sans en faire trop.', bottomAt: 35.24}} />
  </AbsoluteFill>
);

const End: React.FC<{s: Full}> = () => {
  const t = useT();
  const p = spring({frame: f(t - 39.92), fps: FPS, config: {damping: 22, mass: 0.8}});
  const pill = interpolate(t, [41.45, 41.65], [0, 1], clamp);
  const z = interpolate(t, [39.9, DURATION_V6], [1.0, 1.06], clamp);
  return (
    <AbsoluteFill style={{background: '#120B06'}}>
      <Img src={staticFile('img/p4.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.45)', transform: 'scale(1.3)'}} />
      <div style={{position: 'absolute', left: 540 - 380, top: 300, width: 760, height: 616, borderRadius: 40, overflow: 'hidden', transform: `translateY(${(1 - p) * 900}px) scale(${z})`, boxShadow: '0 40px 90px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile('img/p4.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <Sweep from={40.6} dur={1.0} />
      </div>
      <BlockView b={{from: 39.92, to: 99, y: 1250, top: "celui-ci, c'est ma", main: 'meilleure', mainAt: 40.93, kind: 'serif', bottom: 'recommandation.', bottomAt: 41.27}} />
      <AbsoluteFill style={{top: 1560, alignItems: 'center'}}>
        <div style={{opacity: pill, transform: `translateY(${(1 - pill) * 10}px)`, padding: '18px 30px', borderRadius: 999, background: C.goldLight,
          fontFamily: SANS, fontWeight: 900, fontSize: 32, letterSpacing: 2, color: C.ink}}>TOM FORD · ÉBÈNE FUMÉ</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{s: Full}>> = {hook: Hook, title: Title, gold: Gold, product: Product, notes: Notes, fire: Fire, empreinte: Empreinte, end: End};

const FullWrap: React.FC<{s: Full; children: React.ReactNode}> = ({s, children}) => {
  const t = useT();
  const pin = interpolate(t, [s.from, s.from + 0.22], [0, 1], {...clamp, easing: ease});
  const last = s.to >= DURATION_V6;
  const out = last ? 0 : interpolate(t, [s.to - 0.1, s.to], [0, 1], clamp);
  let tf = `scale(${1 + out * 0.06})`, blur = out * 10, op = 1 - out * 0.6;
  if (s.enter === 'up') { tf += ` translateY(${(1 - pin) * 1920}px)`; blur += (1 - pin) * 10; }
  if (s.enter === 'zoom') { tf += ` scale(${1.1 - 0.1 * pin})`; blur += (1 - pin) * 8; op = Math.min(op, pin * 1.5); }
  return <AbsoluteFill style={{transform: tf, filter: blur > 0.5 ? `blur(${blur}px)` : undefined, opacity: op}}>{children}</AbsoluteFill>;
};

/* ---------------------------------------------------------------- audio */
// Song drop (31.08 s into the track) lands on "PERCUTANT" (32.04). Music at a FIXED level.
const MUSIC_IN = 32.04 - 31.08;
const Music: React.FC = () => (
  <Sequence from={f(MUSIC_IN)}>
    <Audio src={staticFile('music.wav')} volume={(fr) => {
      const t = fr / FPS + MUSIC_IN;
      const fadeIn = interpolate(t, [MUSIC_IN, MUSIC_IN + 0.4], [0, 1], clamp);
      const fadeOut = interpolate(t, [41.6, MUSIC_IN + 41.25], [1, 0], clamp);
      return Math.pow(10, -18 / 20) * fadeIn * fadeOut;
    }} />
  </Sequence>
);

/* ------------------------------------------------------------------ main */
export const ReelV6: React.FC = () => {
  const t = useT();
  const s = camAt(t);
  const mb = camBlur(t);
  const full = fullAt(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '50% 32%', filter: mb > 0.4 ? `blur(${mb}px)` : undefined}}>
        <OffthreadVideo src={staticFile('base_v6.mp4')} muted />
        <WallLayer />
      </AbsoluteFill>
      <ProductCard />
      {full ? <AbsoluteFill><FullWrap s={full}>{React.createElement(SCENES[full.kind], {s: full})}</FullWrap></AbsoluteFill> : null}
      {!full || full.kind === 'hook' ? <Blocks /> : null}
      <Captions />
      <Flash at={2.31} />
      <Flash at={32.04} dur={0.18} />
      {/* audio: levelled voice, one SFX stem (scripts/mix_sfx.py + sfx_cues_v6.json), music at fixed level */}
      <Audio src={staticFile('voice_v6.wav')} />
      <Audio src={staticFile('sfx_stem_v6.wav')} />
      <Music />
    </AbsoluteFill>
  );
};
