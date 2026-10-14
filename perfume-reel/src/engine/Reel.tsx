import React, {createContext, useContext} from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, Easing, random,
} from 'remotion';
import type {Block, Card, Edl, Media, Overlay, Scene, Tag, TransitionName, Wall} from './types';

/* =====================================================================
   Generic reel renderer: <Reel edl={...}/> — no hard-coded timings here.
   Layers (back → front):
     camera group [ base talking head → wall bg → wall words → wall cut-out clip ]
     full-screen scenes (with enter/exit transitions)
     centred blocks / captions
     overlays (flash, light leak, grain, video)
   ===================================================================== */

const Ctx = createContext<Edl | null>(null);
const useEdl = () => useContext(Ctx)!;
const useT = () => {
  const edl = useEdl();
  return useCurrentFrame() / edl.fps;
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.inOut(Easing.cubic);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const win = (t: number, a: number, b: number, fi = 0.12, fo = 0.12) => interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], clamp);
const fit = (text: string, size: number, k: number, maxW = 940) => Math.min(size, maxW / (Math.max(1, text.length) * k));
const SHADOW = '0 2px 6px rgba(0,0,0,0.35), 0 6px 26px rgba(0,0,0,0.45)';

/* ---------------------------------------------------------------- media */
const MediaView: React.FC<{m: Media; from: number; to: number}> = ({m, from, to}) => {
  const edl = useEdl();
  const t = useT();
  const z = m.zoom ? interpolate(t, [from, to], m.zoom, clamp) : 1.05;
  const st: React.CSSProperties = m.width
    ? {position: 'absolute', width: m.width, height: m.width, left: m.left ?? (edl.width - m.width) / 2, top: 0, objectFit: 'cover', objectPosition: m.pos, transform: `scale(${z})`, filter: m.filter}
    : {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: m.pos ?? '50% 50%', transform: `scale(${z})`, filter: m.filter};
  if (!m.video) return <Img src={staticFile(m.src)} style={st} />;
  return (
    <Sequence from={Math.round(from * edl.fps)} layout="none">
      <OffthreadVideo src={staticFile(m.src)} muted trimBefore={Math.round((m.offset ?? 0) * edl.fps)} style={st} />
    </Sequence>
  );
};

/* ----------------------------------------------------------------- type */
const Small: React.FC<{text: string; at: number; dark?: boolean}> = ({text, at, dark}) => {
  const {theme} = useEdl();
  const t = useT();
  if (t < at) return <div style={{height: 58}} />;
  const p = interpolate(t, [at, at + 0.1], [0, 1], clamp);
  return <div style={{fontFamily: theme.sans, fontWeight: 600, fontSize: 46, letterSpacing: -0.4, lineHeight: '58px', color: dark ? theme.ink : '#fff',
    textShadow: dark ? 'none' : SHADOW, opacity: p, transform: `translateY(${(1 - p) * 8}px)`}}>{text}</div>;
};

const Main: React.FC<{b: Block; dark?: boolean}> = ({b, dark}) => {
  const {theme} = useEdl();
  const t = useT();
  const heavy = b.kind === 'heavy';
  const size = heavy ? fit(b.main, 150, 0.68) : fit(b.main, 180, 0.48);
  if (t < b.mainAt) return <div style={{height: size * 0.95}} />;
  const anim = b.anim ?? (heavy ? 'pop' : 'rise');
  const dur = anim === 'slam' ? 0.1 : heavy ? 0.13 : 0.2;
  const p = interpolate(t, [b.mainAt, b.mainAt + dur], [0, 1], {...clamp, easing: ease});
  const strike = b.strikeAt !== undefined ? interpolate(t, [b.strikeAt, b.strikeAt + 0.16], [0, 1], {...clamp, easing: ease}) : 0;
  let motion: React.CSSProperties;
  if (anim === 'slam') motion = {opacity: Math.min(1, p * 2), transform: `scale(${1.6 - 0.6 * p})`, filter: `blur(${(1 - p) * 6}px)`};
  else if (anim === 'mask') motion = {clipPath: `inset(0 ${100 - 100 * p}% 0 0)`};
  else if (heavy) motion = {opacity: p, transform: `scale(${1.12 - 0.12 * p})`};
  else motion = {opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: `blur(${(1 - p) * 4}px)`};
  const base: React.CSSProperties = heavy
    ? {fontFamily: theme.sans, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.045, lineHeight: 0.95, textTransform: 'uppercase', color: b.color ?? (dark ? theme.ink : '#fff')}
    : {fontFamily: theme.serif, fontStyle: 'italic', fontWeight: 600, fontSize: size, letterSpacing: -size * 0.02, lineHeight: 1.0, color: b.color ?? (dark ? theme.gold : theme.goldLight)};
  return (
    <div style={{position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', textShadow: dark ? 'none' : SHADOW, ...base, ...motion}}>
      {b.main}
      {strike > 0 ? <div style={{position: 'absolute', left: '-2%', top: '50%', height: Math.max(6, size * 0.07), width: `${104 * strike}%`,
        background: theme.goldLight, transform: 'translateY(-50%)', boxShadow: '0 2px 10px rgba(0,0,0,0.35)'}} /> : null}
    </div>
  );
};

export const BlockView: React.FC<{b: Block; dark?: boolean}> = ({b, dark}) => {
  const {theme} = useEdl();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: (b.y ?? theme.captionY) - 960}}>
      <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {b.top ? <Small text={b.top} at={b.topAt ?? b.from} dark={dark ?? b.dark} /> : null}
        <Main b={b} dark={dark ?? b.dark} />
        {b.bottom ? <Small text={b.bottom} at={b.bottomAt ?? b.mainAt} dark={dark ?? b.dark} /> : null}
      </div>
    </AbsoluteFill>
  );
};

const BlocksAt: React.FC<{blocks: Block[]}> = ({blocks}) => {
  const t = useT();
  const b = blocks.find((x) => t >= x.from && t < x.to);
  return b ? <BlockView b={b} /> : null;
};

/* ------------------------------------------------------------- captions */
const useChunks = () => {
  const {words} = useEdl();
  return React.useMemo(() => {
    const out: typeof words[] = [];
    let cur: typeof words = [];
    words.forEach((w, i) => {
      cur.push(w);
      const n = words[i + 1];
      if (!n || /[.,?!]$/.test(w.w) || n.s - w.e > 0.25 || cur.length >= 2 || w.w.length > 7) { out.push(cur); cur = []; }
    });
    return out;
  }, [words]);
};

const Captions: React.FC<{hidden: boolean}> = ({hidden}) => {
  const edl = useEdl();
  const t = useT();
  const chunks = useChunks();
  if (hidden) return null;
  const i = chunks.findIndex((c, k) => t >= c[0].s - 0.03 && t < (chunks[k + 1]?.[0].s ?? edl.duration) - 0.03);
  if (i < 0) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: edl.theme.captionY - 960}}>
      <div style={{fontFamily: edl.theme.sans, fontWeight: 700, fontSize: edl.theme.captionSize, letterSpacing: -0.6, color: '#fff', textShadow: SHADOW, whiteSpace: 'nowrap'}}>
        {chunks[i].map((w, k) => {
          const p = interpolate(t, [w.s - 0.03, w.s + 0.04], [0, 1], clamp);
          return <span key={k} style={{display: 'inline-block', margin: '0 7px', opacity: p, transform: `scale(${0.92 + 0.08 * p})`}}>{w.w.replace(/,$/, '')}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- walls */
const WallBg: React.FC<{w: Wall}> = ({w}) => {
  const t = useT();
  if (!w.bg) return null;
  const o = win(t, w.from, w.to, 0.06, 0.06);
  return (
    <AbsoluteFill style={{opacity: o, background: '#000'}}>
      {w.bg.css ? <AbsoluteFill style={{background: w.bg.css}} /> : <MediaView m={w.bg} from={w.from} to={w.to} />}
      <AbsoluteFill style={{background: `rgba(10,6,3,${w.bg.dark ?? 0})`}} />
    </AbsoluteFill>
  );
};

const WallTexts: React.FC<{w: Wall}> = ({w}) => {
  const {theme} = useEdl();
  const t = useT();
  return (
    <AbsoluteFill style={{alignItems: 'center', top: w.top ?? 235, opacity: win(t, w.from, w.to, 0.01, 0.1)}}>
      {w.texts.filter((x) => t >= x.at && (x.until === undefined || t < x.until)).map((x, i) => {
        const p = interpolate(t, [x.at, x.at + (x.kind === 'serif' ? 0.2 : 0.12)], [0, 1], {...clamp, easing: ease});
        if (x.kind === 'small') return <div key={i} style={{fontFamily: theme.sans, fontWeight: 600, fontSize: 48, color: x.color ?? '#fff', textShadow: SHADOW, opacity: p, marginBottom: 6}}>{x.text}</div>;
        if (x.kind === 'serif') {
          const size = fit(x.text, 200, 0.48, 820);
          return <div key={i} style={{fontFamily: theme.serif, fontStyle: 'italic', fontWeight: 600, fontSize: size, lineHeight: 1.0, letterSpacing: -size * 0.02, color: x.color ?? theme.goldLight,
            opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: `blur(${(1 - p) * 4}px)`}}>{x.text}</div>;
        }
        const size = fit(x.text, 200, 0.68, 840);
        const k = x.strikeAt !== undefined ? interpolate(t, [x.strikeAt, x.strikeAt + 0.16], [0, 1], {...clamp, easing: ease}) : 0;
        return <div key={i} style={{position: 'relative', fontFamily: theme.sans, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.045, lineHeight: 0.92, whiteSpace: 'nowrap',
          color: x.color ?? '#fff', opacity: p, transform: `scale(${1.12 - 0.12 * p})`, textShadow: '0 10px 40px rgba(0,0,0,0.3)'}}>
          {x.text}
          {k > 0 ? <div style={{position: 'absolute', left: '-2%', top: '48%', height: size * 0.08, width: `${104 * k}%`, background: theme.goldLight, boxShadow: '0 2px 10px rgba(0,0,0,0.35)'}} /> : null}
        </div>;
      })}
    </AbsoluteFill>
  );
};

const WallLayer: React.FC = () => {
  const edl = useEdl();
  const t = useT();
  const w = edl.walls.find((x) => t >= x.from && t < x.to);
  const clips = React.useMemo(() => {
    const m = new Map<string, {clip: string; from: number; to: number}>();
    for (const x of edl.walls) {
      const c = m.get(x.clip) ?? {clip: x.clip, from: x.clipFrom, to: x.to};
      c.to = Math.max(c.to, x.to); m.set(x.clip, c);
    }
    return [...m.values()];
  }, [edl.walls]);
  return (
    <>
      {w ? <WallBg w={w} /> : null}
      {w ? <WallTexts w={w} /> : null}
      {clips.map((c, i) => (
        <Sequence key={i} from={Math.round(c.from * edl.fps)} durationInFrames={Math.round(c.to * edl.fps) - Math.round(c.from * edl.fps)}>
          <OffthreadVideo src={staticFile(c.clip)} transparent muted />
        </Sequence>
      ))}
    </>
  );
};

/* --------------------------------------------------------------- camera */
const camAt = (edl: Edl, t: number) => {
  let v = 1;
  for (const [k, s, d] of edl.camera) {
    if (t < k) break;
    const p = interpolate(t, [k, k + Math.max(d, 0.001)], [0, 1], {...clamp, easing: d <= 0.2 ? ease : inOut});
    v = v + (s - v) * p;
  }
  return v;
};
const camBlur = (edl: Edl, t: number) => {
  if (edl.camera.some(([k, , d]) => d < 0.05 && Math.abs(t - k) < 1 / 25)) return 0;
  const dv = Math.abs(camAt(edl, t + 1 / 60) - camAt(edl, t - 1 / 60)) * 30;
  return Math.min(7, dv * 9);
};

/* ------------------------------------------------------------ scene bits */
const Paper: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {theme} = useEdl();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #FBF9F5 0%, ${theme.paper} 60%, #E6E0D6 100%)`}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(60,40,20,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(60,40,20,0.06) 1px, transparent 1px)', backgroundSize: '54px 54px'}} />
      {children}
    </AbsoluteFill>
  );
};

const Shade: React.FC<{top?: number; bottom?: number}> = ({top = 0.45, bottom = 0.6}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(8,5,2,${top}) 0%, rgba(8,5,2,0) 35%, rgba(8,5,2,0) 50%, rgba(8,5,2,${bottom}) 100%)`}} />
);

const TagView: React.FC<{tag: Tag}> = ({tag}) => {
  const {theme} = useEdl();
  const t = useT();
  const p = interpolate(t, [tag.at, tag.at + 0.2], [0, 1], {...clamp, easing: ease});
  return <div style={{position: 'absolute', left: tag.x, top: tag.y, opacity: p, transform: `translateY(${(1 - p) * 10}px)`, padding: '12px 20px', borderRadius: 12,
    background: tag.light ? theme.goldLight : 'rgba(20,14,9,0.82)', color: tag.light ? theme.ink : theme.goldLight, fontFamily: theme.sans, fontWeight: 700, fontSize: 24, letterSpacing: 2.5}}>{tag.text}</div>;
};

const Sweep: React.FC<{from: number; dur?: number}> = ({from, dur = 0.9}) => {
  const t = useT();
  const p = interpolate(t, [from, from + dur], [0, 1], {...clamp, easing: inOut});
  if (p <= 0 || p >= 1) return null;
  return <AbsoluteFill style={{mixBlendMode: 'screen', opacity: Math.sin(p * Math.PI) * 0.55,
    background: `linear-gradient(115deg, rgba(255,255,255,0) ${p * 140 - 30}%, rgba(255,236,200,0.65) ${p * 140 - 15}%, rgba(255,255,255,0) ${p * 140}%)`}} />;
};

const CardView: React.FC<{c: Card}> = ({c}) => {
  const edl = useEdl();
  const t = useT();
  const p = spring({frame: Math.round((t - c.at) * edl.fps), fps: edl.fps, config: {damping: 18, mass: 0.6}});
  return (
    <div style={{position: 'absolute', left: c.x - 190, top: c.y - 240, width: 380, height: 480, borderRadius: 34, overflow: 'hidden', opacity: Math.min(1, p * 1.5),
      transform: `translateY(${(1 - p) * 50}px) rotate(${c.rot ?? 0}deg)`, background: 'rgba(255,240,220,0.14)', border: '1px solid rgba(255,230,190,0.35)',
      backdropFilter: 'blur(18px)', boxShadow: '0 30px 60px rgba(0,0,0,0.35)'}}>
      <div style={{margin: 14, height: 350, borderRadius: 24, backgroundImage: `url(${staticFile(c.image)})`, backgroundSize: c.size ?? 'cover', backgroundPosition: c.pos ?? '50% 50%'}} />
      <div style={{textAlign: 'center', fontFamily: edl.theme.sans, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: '#FFF3DE'}}>{c.label}</div>
    </div>
  );
};

/* --------------------------------------------------------------- scenes */
const TitleScene: React.FC<{s: Extract<Scene, {kind: 'title'}>}> = ({s}) => {
  const edl = useEdl();
  const t = useT();
  const p = spring({frame: Math.round((t - s.from - 0.03) * edl.fps), fps: edl.fps, config: {damping: 22, mass: 0.8}});
  const z = interpolate(t, [s.from, s.to], [1.12, 1.03], clamp);
  return (
    <Paper>
      <div style={{position: 'absolute', left: 540 - 320, top: 330, width: 640, height: 820, borderRadius: 40, overflow: 'hidden',
        transform: `translateY(${(1 - p) * 900}px)`, boxShadow: '0 40px 80px rgba(40,25,10,0.22), 0 8px 20px rgba(40,25,10,0.1)'}}>
        <Img src={staticFile(s.image)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
        {s.sweepAt !== undefined ? <Sweep from={s.sweepAt} /> : null}
      </div>
      {(s.tags ?? []).map((tg, i) => <TagView key={i} tag={tg} />)}
      <BlockView dark b={{from: s.brandAt, to: s.to, y: 1340, main: s.brand, mainAt: s.brandAt, kind: 'heavy', color: edl.theme.ink}} />
      <BlockView dark b={{from: s.nameAt, to: s.to, y: 1480, main: s.name, mainAt: s.nameAt, kind: 'serif', color: edl.theme.gold}} />
    </Paper>
  );
};

const MediaScene: React.FC<{s: Extract<Scene, {kind: 'media'}>}> = ({s}) => {
  const t = useT();
  const punch = (s.punches ?? []).reduce((acc, at) => acc + 0.09 * interpolate(t, [at, at + 0.1], [0, 1], {...clamp, easing: ease}), 0);
  const m = {...s.media, zoom: s.media.zoom ? [s.media.zoom[0] + punch, s.media.zoom[1] + punch] as [number, number] : [1.08 + punch, 1.12 + punch] as [number, number]};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <MediaView m={m} from={s.from} to={s.to} />
      {s.dark ? <AbsoluteFill style={{background: `rgba(10,6,3,${s.dark})`}} /> : null}
      {s.shade ? <Shade top={s.shade[0]} bottom={s.shade[1]} /> : null}
      {s.sweepAt !== undefined ? <Sweep from={s.sweepAt} /> : null}
      {(s.tags ?? []).map((tg, i) => <TagView key={i} tag={tg} />)}
      {s.blocks ? <BlocksAt blocks={s.blocks} /> : null}
    </AbsoluteFill>
  );
};

const CardsScene: React.FC<{s: Extract<Scene, {kind: 'cards'}>}> = ({s}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <MediaView m={s.media} from={s.from} to={s.to} />
    {s.dark ? <AbsoluteFill style={{background: `rgba(22,11,4,${s.dark})`}} /> : null}
    {s.blocks ? <BlocksAt blocks={s.blocks} /> : null}
    {s.cards.map((c, i) => <CardView key={i} c={c} />)}
  </AbsoluteFill>
);

const EndScene: React.FC<{s: Extract<Scene, {kind: 'end'}>}> = ({s}) => {
  const edl = useEdl();
  const t = useT();
  const p = spring({frame: Math.round((t - s.from - 0.03) * edl.fps), fps: edl.fps, config: {damping: 22, mass: 0.8}});
  const z = interpolate(t, [s.from, edl.duration], [1.0, 1.06], clamp);
  const pill = s.pill ? interpolate(t, [s.pill.at, s.pill.at + 0.2], [0, 1], clamp) : 0;
  return (
    <AbsoluteFill style={{background: '#120B06'}}>
      <Img src={staticFile(s.image)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.45)', transform: 'scale(1.3)'}} />
      <div style={{position: 'absolute', left: 540 - 380, top: 300, width: 760, height: 616, borderRadius: 40, overflow: 'hidden', transform: `translateY(${(1 - p) * 900}px) scale(${z})`, boxShadow: '0 40px 90px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile(s.image)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {s.sweepAt !== undefined ? <Sweep from={s.sweepAt} dur={1.0} /> : null}
      </div>
      {s.blocks ? <BlocksAt blocks={s.blocks} /> : null}
      {s.pill ? (
        <AbsoluteFill style={{top: 1560, alignItems: 'center'}}>
          <div style={{opacity: pill, transform: `translateY(${(1 - pill) * 10}px)`, padding: '18px 30px', borderRadius: 999, background: edl.theme.goldLight,
            fontFamily: edl.theme.sans, fontWeight: 900, fontSize: 32, letterSpacing: 2, color: edl.theme.ink}}>{s.pill.text}</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{s: Scene}> = ({s}) => {
  switch (s.kind) {
    case 'title': return <TitleScene s={s} />;
    case 'media': return <MediaScene s={s} />;
    case 'cards': return <CardsScene s={s} />;
    case 'end': return <EndScene s={s} />;
  }
};

/* ---------------------------------------------------------- transitions
   Enter/exit transforms applied to a full-screen scene. Pure CSS (works headless).
   'flashCut' is handled by an automatic white flash overlay at the boundary.   */
const transitionStyle = (name: TransitionName | undefined, p: number, dir: 'in' | 'out'): React.CSSProperties => {
  const q = 1 - p; // 1 at the far end of the move, 0 when settled
  switch (name) {
    case 'up': return {transform: `translateY(${q * 1920}px)`, filter: `blur(${q * 10}px)`};
    case 'zoom': return {transform: `scale(${1.1 - 0.1 * p})`, filter: `blur(${q * 8}px)`, opacity: Math.min(1, p * 1.5)};
    case 'zoomBlur': return {transform: `scale(${dir === 'in' ? 1 + q * 0.6 : 1 + q * 0.35})`, filter: `blur(${q * 22}px)`, opacity: Math.min(1, p * 2)};
    case 'whip': return {transform: `translateX(${(dir === 'in' ? 1 : -1) * q * 1080}px) skewX(${q * -8}deg)`, filter: `blur(${q * 26}px)`};
    case 'whipLeft': return {transform: `translateX(${(dir === 'in' ? -1 : 1) * q * 1080}px) skewX(${q * 8}deg)`, filter: `blur(${q * 26}px)`};
    case 'push': return {transform: `translateY(${(dir === 'in' ? 1 : -1) * q * 1920}px)`};
    case 'iris': return {clipPath: `circle(${p * 120}% at 50% 45%)`};
    case 'luma': return {maskImage: `linear-gradient(115deg, #000 ${p * 140 - 40}%, transparent ${p * 140}%)`, WebkitMaskImage: `linear-gradient(115deg, #000 ${p * 140 - 40}%, transparent ${p * 140}%)`};
    case 'glitch': {
      const j = q > 0.02 ? Math.round(random(`g${Math.round(p * 40)}`) * 60 - 30) : 0;
      return {transform: `translateX(${j}px)`, filter: q > 0.02 ? `hue-rotate(${j * 3}deg) saturate(${1 + q})` : undefined, opacity: Math.min(1, p * 3)};
    }
    default: return {};
  }
};

const SceneWrap: React.FC<{s: Scene; children: React.ReactNode}> = ({s, children}) => {
  const edl = useEdl();
  const t = useT();
  const IN = s.enter === 'whip' || s.enter === 'whipLeft' ? 0.16 : 0.22;
  const pin = interpolate(t, [s.from, s.from + IN], [0, 1], {...clamp, easing: ease});
  const last = s.to >= edl.duration - 0.01;
  const pout = last ? 1 : interpolate(t, [s.to - 0.12, s.to], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const a = transitionStyle(s.enter, pin, 'in');
  const exitName = s.exit ?? 'zoomBlur';
  const b = last ? {} : transitionStyle(exitName, pout, 'out');
  return (
    <AbsoluteFill style={b}>
      <AbsoluteFill style={a}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- overlays */
const Flash: React.FC<{at: number; dur?: number; color?: string}> = ({at, dur = 0.15, color = '#fff'}) => {
  const t = useT();
  const o = interpolate(t, [at - 0.02, at, at + dur], [0, 0.9, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{background: color, opacity: o}} /> : null;
};

// Procedural light leak: two drifting warm radial blooms in screen mode
const Leak: React.FC<{from: number; to: number; intensity?: number; hue?: number}> = ({from, to, intensity = 0.6, hue = 28}) => {
  const t = useT();
  const o = win(t, from, to, 0.18, 0.3) * intensity;
  if (o <= 0) return null;
  const p = (t - from) / Math.max(0.01, to - from);
  const x1 = -10 + 70 * p, y1 = 20 + 10 * Math.sin(p * 3), x2 = 110 - 60 * p, y2 = 75 - 15 * p;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: o,
      background: `radial-gradient(ellipse 55% 40% at ${x1}% ${y1}%, hsla(${hue},100%,62%,0.85), transparent 70%),
                   radial-gradient(ellipse 45% 35% at ${x2}% ${y2}%, hsla(${hue + 14},100%,70%,0.6), transparent 70%)`}} />
  );
};

const Grain: React.FC<{from: number; to: number; amount?: number}> = ({from, to, amount = 0.07}) => {
  const edl = useEdl();
  const t = useT();
  if (t < from || t >= to) return null;
  const seed = Math.floor(t * edl.fps);
  return (
    <AbsoluteFill style={{opacity: amount, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

const OverlayView: React.FC<{o: Overlay}> = ({o}) => {
  const t = useT();
  switch (o.kind) {
    case 'flash': return <Flash at={o.at} dur={o.dur} color={o.color} />;
    case 'leak': return <Leak from={o.from} to={o.to} intensity={o.intensity} hue={o.hue} />;
    case 'grain': return <Grain from={o.from} to={o.to} amount={o.amount} />;
    case 'video': return win(t, o.from, o.to, 0.1, 0.1) > 0 ? (
      <AbsoluteFill style={{mixBlendMode: (o.blend ?? 'screen') as React.CSSProperties['mixBlendMode'], opacity: (o.opacity ?? 1) * win(t, o.from, o.to, 0.1, 0.1)}}>
        <MediaView m={o.media} from={o.from} to={o.to} />
      </AbsoluteFill>
    ) : null;
  }
};

/* ----------------------------------------------------------------- main */
export const Reel: React.FC<{edl: Edl}> = ({edl}) => {
  const frame = useCurrentFrame();
  const t = frame / edl.fps;
  const scene = edl.scenes.find((s) => t >= s.from && t < s.to);
  const wall = edl.walls.find((w) => t >= w.from && t < w.to);
  const block = edl.blocks.find((b) => t >= b.from && t < b.to);
  const s = camAt(edl, t);
  const mb = camBlur(edl, t);
  const music = edl.music;
  return (
    <Ctx.Provider value={edl}>
      <AbsoluteFill style={{background: '#000'}}>
        <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: edl.base.origin ?? '50% 32%', filter: mb > 0.4 ? `blur(${mb}px)` : undefined}}>
          <OffthreadVideo src={staticFile(edl.base.src)} muted />
          <WallLayer />
        </AbsoluteFill>
        {scene ? <SceneWrap s={scene}><SceneView s={scene} /></SceneWrap> : null}
        {!scene && block ? <BlockView b={block} /> : null}
        <Captions hidden={!!scene || !!block || !!wall} />
        {edl.overlays.map((o, i) => <OverlayView key={i} o={o} />)}
        <Audio src={staticFile(edl.voice)} />
        {edl.sfxStem ? <Audio src={staticFile(edl.sfxStem)} /> : null}
        {music ? (
          <Audio src={staticFile(music.src)} trimBefore={Math.round(music.offset * edl.fps)} volume={(fr) => {
            const tt = fr / edl.fps;
            const fi = interpolate(tt, [0, music.fadeIn ?? 0.25], [0, 1], clamp);
            const fo = interpolate(tt, [edl.duration - (music.fadeOut ?? 0.8), edl.duration], [1, 0], clamp);
            return Math.pow(10, music.db / 20) * fi * fo;
          }} />
        ) : null}
      </AbsoluteFill>
    </Ctx.Provider>
  );
};
