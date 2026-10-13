import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, Easing,
} from 'remotion';
import wordsJson from './words_v4.json';

/* =====================================================================
   Ébène Fumé — v4
   Same DNA as v2/v3 (backgrounds, type, scenes) minus the clutter.
   Text system from the reference: word-by-word captions at centre, and
   on key beats ONE centred block (small lead-in + big HEAVY word, or
   small + italic serif accent + small). One text element at a time.
   All times are OUTPUT seconds.
   ===================================================================== */

export const FPS = 30;
export const DURATION_V4 = 1325 / 30 + 1.0; // +1 s hold on the end card

const C = {
  paper: '#F4F1EC',
  grid: 'rgba(60,40,20,0.06)',
  ink: '#1C1712',
  gold: '#B8843A',
  goldLight: '#E2B36A',
};
const SANS = 'Inter, sans-serif';
const SERIF = '"Playfair Display", serif';
const SHADOW = '0 2px 6px rgba(0,0,0,0.35), 0 6px 26px rgba(0,0,0,0.45)';

const f = (s: number) => Math.round(s * FPS);
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useT = () => useCurrentFrame() / FPS;
const win = (t: number, a: number, b: number, fi = 0.12, fo = 0.12) =>
  interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], clamp);

/* ------------------------------------------------------------ timeline */
type Full = {from: number; to: number; kind: string; enter: 'cut' | 'up' | 'zoom'};
const FULL: Full[] = [
  {from: 0.0, to: 1.36, kind: 'hook', enter: 'cut'},
  {from: 4.87, to: 6.72, kind: 'title', enter: 'up'},
  {from: 10.95, to: 13.53, kind: 'gold', enter: 'zoom'},
  {from: 13.53, to: 16.19, kind: 'product', enter: 'cut'},
  {from: 24.2, to: 26.21, kind: 'swatches', enter: 'up'},
  {from: 28.62, to: 30.23, kind: 'notes', enter: 'zoom'},
  {from: 35.43, to: 38.29, kind: 'empreinte', enter: 'zoom'},
  {from: 42.39, to: DURATION_V4, kind: 'end', enter: 'up'},
];
const fullAt = (t: number) => FULL.find((s) => t >= s.from && t < s.to);

// Backgrounds behind the matted subject (kept from v2/v3)
type Bg = {from: number; to: number; src?: string; css?: string; video?: boolean; offset?: number; pos?: string; blur?: number; dark?: number; zoom?: [number, number]};
const BGS: Bg[] = [
  {from: 1.36, to: 2.31, src: 'broll/ink2.mp4', video: true, offset: 2, dark: 0.5, zoom: [1.15, 1.05]},
  {from: 8.41, to: 9.41, src: 'img/p3.jpg', pos: '30% 50%', blur: 3, dark: 0.25, zoom: [1.25, 1.15]},
  {from: 9.41, to: 10.35, src: 'broll/smoke.mp4', video: true, offset: 3.2, dark: 0, zoom: [1.0, 1.08]},
  {from: 10.35, to: 10.98, src: 'broll/ink2.mp4', video: true, offset: 9, dark: 0.35},
  {from: 21.91, to: 24.25, css: 'radial-gradient(ellipse at 30% 25%, #F7DCE0 0%, #F3E4CF 40%, #E7DAF0 75%, #EFE6F3 100%)'},
  {from: 26.21, to: 28.65, src: 'img/p1.jpg', blur: 16, dark: 0.35, zoom: [1.3, 1.15]},
  {from: 30.23, to: 32.58, src: 'img/p2.jpg', pos: '50% 30%', dark: 0.2, zoom: [1.3, 1.1]},
];

// Centred emphasis blocks (replace the caption while on screen)
type Block = {
  from: number; to: number; y?: number; dark?: boolean;
  top?: string; topAt?: number;
  main: string; mainAt: number; kind: 'heavy' | 'serif'; color?: string; strikeAt?: number;
  bottom?: string; bottomAt?: number;
};
const BLOCKS: Block[] = [
  // hook
  {from: 0.05, to: 0.82, y: 1660, top: 'un parfum', main: 'POUR HOMME.', mainAt: 0.05, kind: 'heavy', strikeAt: 0.58},
  {from: 0.82, to: 1.36, y: 1660, top: "quand c'est", main: 'une femme', mainAt: 0.82, kind: 'serif', bottom: 'qui le porte', bottomAt: 1.05},
  {from: 1.41, to: 2.31, top: 'les gens ne vont pas', main: "L'OUBLIER.", mainAt: 2.14, kind: 'heavy'},
  // body
  {from: 8.07, to: 9.41, top: 'son côté', main: 'boisé', mainAt: 8.41, kind: 'serif'},
  {from: 9.41, to: 10.35, top: 'assez', main: 'MYSTÉRIEUX.', mainAt: 9.41, kind: 'heavy'},
  {from: 10.35, to: 10.95, top: 'beaucoup de', main: 'caractère', mainAt: 10.62, kind: 'serif'},
  {from: 17.45, to: 18.55, top: "quand c'est", main: 'une femme', mainAt: 17.8, kind: 'serif', bottom: 'qui le porte', bottomAt: 18.08, y: 1000},
  {from: 19.15, to: 20.28, top: 'un petit', main: 'TRUC EN PLUS.', mainAt: 19.73, kind: 'heavy', y: 1000},
  {from: 21.71, to: 22.7, top: 'un parfum', main: 'féminin', mainAt: 22.01, kind: 'serif'},
  {from: 26.21, to: 27.5, top: 'alors que', main: 'CELUI-CI', mainAt: 26.57, kind: 'heavy', color: C.goldLight},
  {from: 30.97, to: 31.93, top: 'beaucoup', main: 'PLUS FORT.', mainAt: 31.18, kind: 'heavy'},
  {from: 31.93, to: 32.58, main: 'PLUS PUISSANT.', mainAt: 31.93, kind: 'heavy', color: C.goldLight},
  {from: 34.12, to: 35.43, top: "c'est plus", main: 'percutant.', mainAt: 34.54, kind: 'serif'},
  {from: 39.65, to: 40.9, top: 'changer de', main: 'parfum ?', mainAt: 40.13, kind: 'serif'},
];
const blockAt = (t: number) => BLOCKS.find((b) => t >= b.from && t < b.to);

// Camera: punch-in cuts on the talking head (no shake)
const CAM: [number, number][] = [
  [1.36, 1.1], [2.14, 1.16], [2.31, 1.0], [4.0, 1.05], [6.72, 1.0], [8.41, 1.08], [9.41, 1.03], [10.35, 1.1],
  [16.19, 1.0], [17.8, 1.08], [19.45, 1.03], [20.28, 1.0], [21.96, 1.06], [22.7, 1.0],
  [26.21, 1.1], [26.57, 1.15], [28.65, 1.0], [30.23, 1.05], [31.18, 1.1], [31.93, 1.15], [32.58, 1.0],
  [34.54, 1.12], [35.43, 1.0], [38.29, 1.0], [40.13, 1.07], [40.9, 1.0],
];
const camAt = (t: number) => {
  let s = 1, prev = 1, at = -9;
  for (const [k, v] of CAM) if (t >= k) { prev = s; s = v; at = k; }
  const p = interpolate(t, [at, at + 0.12], [0, 1], {...clamp, easing: ease});
  return prev + (s - prev) * p + 0.01 * Math.sin(t * 0.7);
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
  const t = useT();
  const b = blockAt(t);
  return b ? <BlockView b={b} /> : null;
};

// Word-by-word captions (1–2 words), same centre position as the blocks
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
  if (fullAt(t) || blockAt(t)) return null;
  const i = CHUNKS.findIndex((c, k) => t >= c[0].s - 0.03 && t < (CHUNKS[k + 1]?.[0].s ?? DURATION_V4) - 0.03);
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

/* ------------------------------------------------------- backgrounds */
const BgLayer: React.FC = () => {
  const t = useT();
  return (
    <>
      {BGS.map((b, i) => {
        const o = win(t, b.from, b.to, 0.06, 0.06);
        if (o <= 0) return null;
        const z = b.zoom ? interpolate(t, [b.from, b.to], b.zoom, clamp) : 1.05;
        const st: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: b.pos ?? '50% 50%', transform: `scale(${z})`,
          filter: [b.blur ? `blur(${b.blur}px)` : '', b.src?.includes('ink') ? 'saturate(0.78) brightness(0.9)' : ''].join(' ').trim() || undefined};
        return (
          <AbsoluteFill key={i} style={{opacity: o, background: '#000'}}>
            {b.css ? <AbsoluteFill style={{background: b.css}} /> : b.video ? (
              <Sequence from={f(b.from)} layout="none">
                <OffthreadVideo src={staticFile(b.src!)} muted trimBefore={f(b.offset ?? 0)} style={st} />
              </Sequence>
            ) : <Img src={staticFile(b.src!)} style={st} />}
            <AbsoluteFill style={{background: `rgba(10,6,3,${b.dark ?? 0})`}} />
          </AbsoluteFill>
        );
      })}
    </>
  );
};

const FG_WINDOWS: [number, number][] = BGS.map((b) => [Math.max(0, b.from - 0.1), b.to + 0.1]);
const Foreground: React.FC = () => (
  <>
    {FG_WINDOWS.map(([a, b], i) => (
      <Sequence key={i} from={f(a)} durationInFrames={f(b) - f(a)}>
        <OffthreadVideo src={staticFile('fg_v4.webm')} transparent muted trimBefore={f(a)} />
      </Sequence>
    ))}
  </>
);

/* ---------------------------------------------------------- overlays */
const Flash: React.FC<{at: number; dur?: number}> = ({at, dur = 0.15}) => {
  const t = useT();
  const o = interpolate(t, [at - 0.02, at, at + dur], [0, 0.9, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{background: '#fff', opacity: o}} /> : null;
};

const Slider: React.FC = () => {
  const t = useT();
  const from = 16.25, to = 20.25;
  const o = win(t, from, to, 0.25, 0.2);
  if (o <= 0) return null;
  const y = interpolate(t, [from, from + 0.35], [60, 0], {...clamp, easing: ease});
  const k = interpolate(t, [16.7, 17.8], [0.04, 0.96], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const W = 760;
  return (
    <div style={{position: 'absolute', top: 1560, left: (1080 - W - 80) / 2, width: W + 80, padding: '34px 40px', borderRadius: 40,
      background: 'rgba(20,14,9,0.6)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(14px)', opacity: o, transform: `translateY(${y}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 2.5, color: 'rgba(255,255,255,0.75)', marginBottom: 26}}>
        <span>MASCULIN</span><span style={{color: k > 0.9 ? C.goldLight : 'rgba(255,255,255,0.75)'}}>FÉMININ</span>
      </div>
      <div style={{position: 'relative', height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.15)'}}>
        <div style={{position: 'absolute', height: 10, borderRadius: 5, width: k * W, background: `linear-gradient(90deg, #8C5A22, ${C.goldLight})`}} />
        <div style={{position: 'absolute', left: k * W - 22, top: -17, width: 44, height: 44, borderRadius: 22, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.4)'}} />
      </div>
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

const Tag: React.FC<{at: number; x: number; y: number; text: string}> = ({at, x, y, text}) => {
  const t = useT();
  const p = interpolate(t, [at, at + 0.2], [0, 1], {...clamp, easing: ease});
  return <div style={{position: 'absolute', left: x, top: y, opacity: p, transform: `translateY(${(1 - p) * 10}px)`, padding: '12px 20px', borderRadius: 12,
    background: 'rgba(20,14,9,0.82)', color: C.goldLight, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 2.5}}>{text}</div>;
};

const Hook: React.FC<{s: Full}> = ({s}) => {
  const t = useT();
  const z = interpolate(t, [0, 0.3, s.to], [1.32, 1.16, 1.1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile('img/p2.jpg')} style={{position: 'absolute', width: 1920, height: 1920, left: -420, top: 0, objectFit: 'cover', transform: `scale(${z})`}} />
      <Shade top={0.35} bottom={0.85} />
    </AbsoluteFill>
  );
};

const Title: React.FC<{s: Full}> = () => {
  const t = useT();
  const p = spring({frame: f(t - 4.9), fps: FPS, config: {damping: 22, mass: 0.8}});
  return (
    <Paper>
      <div style={{position: 'absolute', left: 540 - 320, top: 330, width: 640, height: 820, borderRadius: 40, overflow: 'hidden',
        transform: `translateY(${(1 - p) * 900}px)`, boxShadow: '0 40px 80px rgba(40,25,10,0.22), 0 8px 20px rgba(40,25,10,0.1)'}}>
        <Img src={staticFile('img/p6.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 - 0.05 * p})`}} />
      </div>
      <Tag at={5.5} x={80} y={430} text="EAU DE PARFUM" />
      <Tag at={5.75} x={650} y={980} text="PRIVATE BLEND" />
      <BlockView dark b={{from: 5.19, to: 6.72, y: 1340, main: 'TOM FORD', mainAt: 5.19, kind: 'heavy', color: C.ink}} />
      <BlockView dark b={{from: 5.96, to: 6.72, y: 1480, main: 'Ébène Fumé', mainAt: 5.96, kind: 'serif', color: C.gold}} />
    </Paper>
  );
};

const Gold: React.FC<{s: Full}> = ({s}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={f(s.from)} layout="none"><Cover src="broll/gold.mp4" video from={s.from} to={s.to} z={[1.08, 1.18]} /></Sequence>
      <AbsoluteFill style={{background: 'rgba(10,6,3,0.25)'}} />
      {t < 12.69
        ? <BlockView b={{from: 11.41, to: 12.69, top: "d'une grande", topAt: 11.41, main: 'élégance', mainAt: 11.93, kind: 'serif'}} />
        : <BlockView b={{from: 12.69, to: 13.53, top: 'et assez', main: 'AUDACIEUX.', mainAt: 13.14, kind: 'heavy'}} />}
    </AbsoluteFill>
  );
};

const Product: React.FC<{s: Full}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Cover src="img/p5.jpg" from={s.from} to={s.to} z={[1.15, 1.3]} pos="40% 50%" />
    <Shade top={0.3} bottom={0.7} />
    <Tag at={13.8} x={80} y={360} text="PRIVATE BLEND" />
    <BlockView b={{from: 14.79, to: 16.19, y: 1640, top: 'dédié à la gente', topAt: 14.79, main: 'MASCULINE.', mainAt: 15.82, kind: 'heavy'}} />
  </AbsoluteFill>
);

const Swatch: React.FC<{at: number; x: number; color: string; label: string}> = ({at, x, color, label}) => {
  const t = useT();
  const p = spring({frame: f(t - at), fps: FPS, config: {damping: 18, mass: 0.6}});
  return (
    <div style={{position: 'absolute', left: x - 130, top: 900, width: 260, textAlign: 'center', opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 60}px)`}}>
      <div style={{width: 230, height: 230, margin: '0 auto', borderRadius: 52, background: color, boxShadow: '0 24px 50px rgba(40,25,10,0.14), inset 0 0 0 1px rgba(0,0,0,0.04)'}} />
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 3, marginTop: 28, color: C.ink}}>{label}</div>
    </div>
  );
};

const Swatches: React.FC<{s: Full}> = () => (
  <Paper>
    <BlockView dark b={{from: 24.2, to: 26.21, y: 560, top: "on s'imagine quelque chose de", main: 'doux…', mainAt: 24.2, kind: 'serif', color: C.gold}} />
    <Swatch at={24.4} x={225} color="#F3D9D6" label="SUBTIL" />
    <Swatch at={24.98} x={540} color="#F6E3C4" label="SUCRÉ" />
    <Swatch at={25.66} x={855} color="#E4D3EE" label="FLEURI" />
  </Paper>
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
    <BlockView b={{from: 28.62, to: 30.23, y: 520, top: 'des notes', main: 'ambrées', mainAt: 28.97, kind: 'serif'}} />
    <NoteCard at={28.97} x={330} y={1180} pos="92% 80%" label="AMBRE" rot={-4} />
    <NoteCard at={29.67} x={750} y={1250} pos="12% 82%" label="BOIS DE SANTAL" rot={4} />
  </AbsoluteFill>
);

const Empreinte: React.FC<{s: Full}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={f(s.from)} layout="none"><Cover src="broll/ink2.mp4" video offset={19} from={s.from} to={s.to} z={[1.22, 1.05]} /></Sequence>
    <AbsoluteFill style={{background: 'rgba(22,11,4,0.58)'}} />
    <BlockView b={{from: 36.13, to: 38.29, top: 'une fragrance qui laisse', topAt: 36.13, main: 'une empreinte', mainAt: 37.03, kind: 'serif', bottom: 'sans en faire trop.', bottomAt: 37.74}} />
  </AbsoluteFill>
);

const End: React.FC<{s: Full}> = () => {
  const t = useT();
  const p = spring({frame: f(t - 42.42), fps: FPS, config: {damping: 22, mass: 0.8}});
  const pill = interpolate(t, [43.95, 44.15], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#120B06'}}>
      <Img src={staticFile('img/p4.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.45)', transform: 'scale(1.3)'}} />
      <div style={{position: 'absolute', left: 540 - 380, top: 300, width: 760, height: 616, borderRadius: 40, overflow: 'hidden', transform: `translateY(${(1 - p) * 900}px)`, boxShadow: '0 40px 90px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile('img/p4.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <BlockView b={{from: 42.42, to: 99, y: 1250, top: "celui-ci, c'est ma", main: 'meilleure', mainAt: 43.43, kind: 'serif', bottom: 'recommandation.', bottomAt: 43.77}} />
      <AbsoluteFill style={{top: 1560, alignItems: 'center'}}>
        <div style={{opacity: pill, transform: `translateY(${(1 - pill) * 10}px)`, padding: '18px 30px', borderRadius: 999, background: C.goldLight,
          fontFamily: SANS, fontWeight: 900, fontSize: 32, letterSpacing: 2, color: C.ink}}>TOM FORD · ÉBÈNE FUMÉ</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{s: Full}>> = {hook: Hook, title: Title, gold: Gold, product: Product, swatches: Swatches, notes: Notes, empreinte: Empreinte, end: End};

const FullWrap: React.FC<{s: Full; children: React.ReactNode}> = ({s, children}) => {
  const t = useT();
  const pin = interpolate(t, [s.from, s.from + 0.22], [0, 1], {...clamp, easing: ease});
  const last = s.to >= DURATION_V4;
  const out = last ? 0 : interpolate(t, [s.to - 0.12, s.to], [0, 1], clamp);
  let tf = '', blur = out * 10, op = 1 - out;
  if (s.enter === 'up') { tf = `translateY(${(1 - pin) * 1920}px)`; blur += (1 - pin) * 10; }
  if (s.enter === 'zoom') { tf = `scale(${1.1 - 0.1 * pin})`; blur += (1 - pin) * 8; op = Math.min(op, pin * 1.5); }
  return <AbsoluteFill style={{transform: tf, filter: blur > 0.5 ? `blur(${blur}px)` : undefined, opacity: op}}>{children}</AbsoluteFill>;
};

/* ---------------------------------------------------------------- audio */
// Song drop (31.08 s into the track) lands on "percutant" (34.54). Music at a FIXED level.
const MUSIC_IN = 34.54 - 31.08;
const Music: React.FC = () => (
  <Sequence from={f(MUSIC_IN)}>
    <Audio src={staticFile('music.wav')} volume={(fr) => {
      const t = fr / FPS + MUSIC_IN;
      const fadeIn = interpolate(t, [MUSIC_IN, MUSIC_IN + 0.6], [0, 1], clamp);
      const fadeOut = interpolate(t, [44.0, MUSIC_IN + 41.25], [1, 0], clamp);
      return Math.pow(10, -18 / 20) * fadeIn * fadeOut;
    }} />
  </Sequence>
);

/* ------------------------------------------------------------------ main */
export const ReelV4: React.FC = () => {
  const t = useT();
  const s = camAt(t);
  const full = fullAt(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '50% 34%'}}>
        <OffthreadVideo src={staticFile('base_v4.mp4')} muted />
        <BgLayer />
        <Foreground />
      </AbsoluteFill>
      <Slider />
      {full ? <AbsoluteFill><FullWrap s={full}>{React.createElement(SCENES[full.kind], {s: full})}</FullWrap></AbsoluteFill> : null}
      {!full || full.kind === 'hook' ? <Blocks /> : null}
      <Captions />
      <Flash at={2.31} />
      <Flash at={34.54} dur={0.18} />
      {/* audio: levelled voice, one SFX stem (scripts/mix_sfx.py + sfx_cues_v4.json), music at fixed level */}
      <Audio src={staticFile('voice_v4.wav')} />
      <Audio src={staticFile('sfx_stem_v4.wav')} />
      <Music />
    </AbsoluteFill>
  );
};
