import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import words from './words.json';

export const FPS = 30;
export const DURATION = 45.23;

// Palette — Tom Ford amber instead of the reference's blue accent
const C = {
  paper: '#F4F1EC',
  grid: 'rgba(60,40,20,0.06)',
  ink: '#1C1712',
  gold: '#C8913F',
  goldLight: '#E9BE72',
  card: '#FFFFFF',
};
const SANS = 'Inter, sans-serif';
const SERIF = '"Playfair Display", serif';

const f = (s: number) => Math.round(s * FPS);
const ease = Easing.bezier(0.22, 1, 0.36, 1);

/* ---------------------------------------------------------------- scenes */
// Full-screen animation windows (seconds). Outside them: talking head.
type Scene = {from: number; to: number; kind: 'title' | 'feminin' | 'notes' | 'fire' | 'end'};
const SCENES: Scene[] = [
  {from: 2.7, to: 4.55, kind: 'title'},
  {from: 18.4, to: 24.0, kind: 'feminin'},
  {from: 24.0, to: 28.0, kind: 'notes'},
  {from: 32.8, to: 36.3, kind: 'fire'},
  {from: 43.4, to: DURATION, kind: 'end'},
];
const sceneAt = (t: number) => SCENES.find((s) => t >= s.from && t < s.to);

/* ------------------------------------------------------------- captions */
const KEYWORDS = new Set([
  'Tom', 'Ford', 'Ébène', 'Fumé.', 'boisé,', 'mystérieux,', 'caractère.', 'élégance', 'audacieux,',
  'masculine,', 'truc', 'plus.', 'subtil,', 'sucré,', 'fleuri,', 'ambrées', 'santal,', 'fort,',
  'puissant.', 'percutant.', 'empreinte', "l'oublier.", 'meilleure', 'recommandation.',
]);
type W = {w: string; s: number; e: number};
const WORDS = words as W[];

// Group into short lines: break on punctuation, keyword runs, or 4 words.
const LINES: W[][] = (() => {
  const out: W[][] = [];
  let cur: W[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    const punct = /[.,]$/.test(w.w);
    const gap = next && next.s - w.e > 0.35;
    if (punct || gap || cur.length >= 4 || !next) { out.push(cur); cur = []; }
  });
  return out;
})();

const Word: React.FC<{w: W; t: number; dark: boolean}> = ({w, t, dark}) => {
  const p = interpolate(t, [w.s - 0.05, w.s + 0.12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const key = KEYWORDS.has(w.w);
  const style: React.CSSProperties = key
    ? {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 92, color: dark ? C.gold : C.goldLight,
       letterSpacing: -1, textShadow: dark ? 'none' : '0 4px 30px rgba(0,0,0,0.45)'}
    : {fontFamily: SANS, fontWeight: 400, fontSize: 50, color: dark ? C.ink : '#FFFFFF',
       letterSpacing: -0.5, textShadow: dark ? 'none' : '0 2px 18px rgba(0,0,0,0.55)'};
  return (
    <span style={{...style, display: 'inline-block', margin: '0 10px', opacity: p,
      filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 14}px)`}}>
      {w.w.replace(/[,]$/, '')}
    </span>
  );
};

const Captions: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const line = LINES.find((l, i) => t >= l[0].s - 0.05 && t < (LINES[i + 1]?.[0].s ?? DURATION) - 0.05);
  if (!line) return null;
  const sc = sceneAt(t);
  if (sc) return null; // full-screen scenes carry their own type
  const dark = false;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', top: sc ? 1180 : 1080}}>
      <div style={{width: 940, textAlign: 'center', lineHeight: 1.15}}>
        {line.map((w, i) => <Word key={i} w={w} t={t} dark={dark} />)}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------- primitives */
const Paper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{
    background: `radial-gradient(ellipse at 50% 35%, #FBF9F5 0%, ${C.paper} 60%, #E9E4DC 100%)`,
  }}>
    <AbsoluteFill style={{
      backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
      backgroundSize: '54px 54px',
    }} />
    {/* soft window-light shadow like the reference */}
    <AbsoluteFill style={{background: 'linear-gradient(115deg, transparent 30%, rgba(0,0,0,0.035) 45%, transparent 60%)'}} />
    {children}
  </AbsoluteFill>
);

const usePop = (at: number, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - f(at), fps, config: {damping, mass: 0.7}});
};

const Card: React.FC<{at: number; x: number; y: number; w: number; h: number; children: React.ReactNode; rot?: number; from?: 'pop' | 'up'}> = ({at, x, y, w, h, children, rot = 0, from = 'pop'}) => {
  const p = usePop(at);
  const tf = from === 'pop'
    ? `scale(${0.6 + 0.4 * p}) rotate(${rot}deg)`
    : `translateY(${(1 - p) * 500}px) rotate(${rot}deg)`;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: Math.min(1, p * 1.4),
      transform: tf, background: C.card, borderRadius: 36, overflow: 'hidden',
      boxShadow: '0 30px 60px rgba(40,25,10,0.18), 0 6px 16px rgba(40,25,10,0.10)'}}>
      {children}
    </div>
  );
};

const Reveal: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const t = useCurrentFrame() / FPS;
  const p = interpolate(t, [at, at + 0.35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return <div style={{opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 20}px)`, ...style}}>{children}</div>;
};

const Sans: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 54, color = C.ink}) =>
  <span style={{fontFamily: SANS, fontSize: size, color, letterSpacing: -0.5}}>{children}</span>;
const Serif: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 110, color = C.gold}) =>
  <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: size, color, letterSpacing: -1.5}}>{children}</span>;

// Scene enter/exit: quick scale+fade so cuts feel like the reference's slides
const SceneWrap: React.FC<{s: Scene; children: React.ReactNode}> = ({s, children}) => {
  const t = useCurrentFrame() / FPS + s.from;
  const inP = interpolate(t, [s.from, s.from + 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const outP = s.to >= DURATION ? 1 : interpolate(t, [s.to - 0.2, s.to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: Math.min(inP, outP), transform: `scale(${1.06 - 0.06 * inP})`}}>{children}</AbsoluteFill>;
};

/* ---------------------------------------------------- full-screen scenes */
// times inside scenes are absolute seconds (Sequence offset is re-added)
const At: React.FC<{s: Scene; children: (t: number) => React.ReactNode}> = ({s, children}) => {
  const t = useCurrentFrame() / FPS + s.from;
  return <>{children(t)}</>;
};
const rel = (s: Scene, abs: number) => abs - s.from;

const TitleScene: React.FC<{s: Scene}> = ({s}) => (
  <Paper>
    <Card at={rel(s, 2.75)} x={540} y={900} w={620} h={820} from="up">
      <Img src={staticFile('img/p2.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 45%'}} />
    </Card>
    <div style={{position: 'absolute', top: 1400, width: '100%', textAlign: 'center'}}>
      <Reveal at={rel(s, 3.1)}><Sans size={58}>Le Tom Ford</Sans></Reveal>
      <Reveal at={rel(s, 3.8)}><Serif size={130}>Ébène Fumé</Serif></Reveal>
    </div>
  </Paper>
);

const Swatch: React.FC<{at: number; x: number; color: string; label: string; hex: string}> = ({at, x, color, label, hex}) => {
  const p = usePop(at, 12);
  return (
    <div style={{position: 'absolute', left: x - 130, top: 880, width: 260, textAlign: 'center', opacity: Math.min(1, p * 1.5), transform: `scale(${0.5 + 0.5 * p})`}}>
      <div style={{width: 230, height: 230, margin: '0 auto', borderRadius: 48, background: color,
        boxShadow: '0 24px 50px rgba(40,25,10,0.16), inset 0 0 0 1px rgba(0,0,0,0.04)'}} />
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: 3, marginTop: 28, color: C.ink}}>{label}</div>
      <div style={{fontFamily: SANS, fontSize: 22, color: 'rgba(0,0,0,0.35)', marginTop: 6}}>{hex}</div>
    </div>
  );
};

const FemininScene: React.FC<{s: Scene}> = ({s}) => (
  <Paper>
    <div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center'}}>
      <Reveal at={rel(s, 18.7)}><Sans size={60}>Quand on pense</Sans></Reveal>
      <Reveal at={rel(s, 19.6)}><Serif size={120}>parfum féminin…</Serif></Reveal>
    </div>
    <Swatch at={rel(s, 22.2)} x={225} color="#F3D9D6" label="SUBTIL" hex="#F3D9D6" />
    <Swatch at={rel(s, 23.02)} x={540} color="#F6E3C4" label="SUCRÉ" hex="#F6E3C4" />
    <Swatch at={rel(s, 23.54)} x={855} color="#E4D3EE" label="FLEURI" hex="#E4D3EE" />
    <At s={s}>{(t) => (
      <div style={{position: 'absolute', top: 1380, width: '100%', textAlign: 'center', opacity: interpolate(t, [20.4, 20.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        <Sans size={44} color="rgba(28,23,18,0.55)">on s'imagine quelque chose de…</Sans>
      </div>
    )}</At>
  </Paper>
);

const NoteCard: React.FC<{at: number; x: number; y: number; img: string; pos: string; label: string; rot: number}> = ({at, x, y, img, pos, label, rot}) => (
  <Card at={at} x={x} y={y} w={360} h={440} rot={rot}>
    <div style={{width: '100%', height: 330, backgroundImage: `url(${staticFile(img)})`, backgroundSize: '260%', backgroundPosition: pos}} />
    <div style={{height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 3, color: C.ink}}>{label}</div>
  </Card>
);

const NotesScene: React.FC<{s: Scene}> = ({s}) => (
  <Paper>
    <At s={s}>{(t) => {
      // gentle orbit drift of the cards like the luxury-logo cloud in the reference
      const d = Math.sin(t * 1.3) * 10;
      return (
        <>
          <div style={{position: 'absolute', top: 360, width: '100%', textAlign: 'center'}}>
            <Reveal at={rel(s, 24.1)}><Sans size={58}>Alors que celui-ci</Sans></Reveal>
            <Reveal at={rel(s, 26.24)}><Serif size={120}>notes ambrées</Serif></Reveal>
          </div>
          <div style={{transform: `translateY(${d}px)`}}>
            <NoteCard at={rel(s, 26.24)} x={330} y={1020} img="img/p3.jpg" pos="92% 80%" label="AMBRE" rot={-5} />
          </div>
          <div style={{transform: `translateY(${-d}px)`}}>
            <NoteCard at={rel(s, 27.48)} x={750} y={1110} img="img/p3.jpg" pos="12% 82%" label="BOIS DE SANTAL" rot={5} />
          </div>
          <div style={{position: 'absolute', top: 1500, width: '100%', textAlign: 'center'}}>
            <Reveal at={rel(s, 24.5)}><Sans size={40} color="rgba(28,23,18,0.5)">TOM FORD · ÉBÈNE FUMÉ</Sans></Reveal>
          </div>
        </>
      );
    }}</At>
  </Paper>
);

const FireScene: React.FC<{s: Scene}> = ({s}) => (
  <At s={s}>{(t) => {
    const z = interpolate(t, [s.from, s.to], [1.08, 1.22]);
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <Img src={staticFile('img/p2.jpg')} style={{position: 'absolute', width: 1920, height: 1920, left: -420, top: 0, objectFit: 'cover', transform: `scale(${z})`}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)'}} />
        <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center'}}>
          <Reveal at={rel(s, 34.6)}><Sans size={58} color="#fff">une fragrance qui laisse</Sans></Reveal>
          <Reveal at={rel(s, 35.04)}><Serif size={140} color={C.goldLight}>une empreinte</Serif></Reveal>
        </div>
      </AbsoluteFill>
    );
  }}</At>
);

const EndScene: React.FC<{s: Scene}> = ({s}) => (
  <Paper>
    <Card at={rel(s, 43.45)} x={540} y={860} w={720} h={584} from="up">
      <Img src={staticFile('img/p4.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </Card>
    <div style={{position: 'absolute', top: 1260, width: '100%', textAlign: 'center'}}>
      <Reveal at={rel(s, 43.6)}><Sans size={58}>Celui-ci, c'est ma</Sans></Reveal>
      <Reveal at={rel(s, 44.5)}><Serif size={112}>meilleure recommandation.</Serif></Reveal>
    </div>
  </Paper>
);

/* ---------------------------------------------- talking-head overlays */
const Darken: React.FC<{from: number; to: number}> = ({from, to}) => {
  const t = useCurrentFrame() / FPS;
  const o = interpolate(t, [from, from + 0.3, to - 0.3, to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o, background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(10,6,3,0.75) 100%)', backdropFilter: 'blur(0px)'}} />;
};

// Step indicator ①②③ for the three traits (mirrors the reference's progress pills)
const Traits: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const from = 5.7, to = 9.2;
  const items: [string, number][] = [['Boisé', 6.22], ['Mystérieux', 7.14], ['Caractère', 8.24]];
  const o = interpolate(t, [from, from + 0.3, to - 0.3, to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(t, [from, from + 0.35], [60, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return (
    <div style={{position: 'absolute', top: 1450, width: '100%', display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${y}px)`}}>
      <div style={{display: 'flex', gap: 14, padding: 14, borderRadius: 999, background: 'rgba(20,14,9,0.55)', border: '1px solid rgba(255,255,255,0.12)'}}>
        {items.map(([label, at], i) => {
          const on = t >= at;
          const p = interpolate(t, [at, at + 0.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 26px', borderRadius: 999,
              background: on ? `rgba(233,190,114,${0.95 * p})` : 'rgba(255,255,255,0.06)', transform: `scale(${1 + 0.08 * Math.sin(p * Math.PI)})`}}>
              <span style={{width: 34, height: 34, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SANS, fontSize: 20, fontWeight: 500, background: on ? C.ink : 'transparent', color: on ? C.goldLight : 'rgba(255,255,255,0.6)',
                border: on ? 'none' : '2px solid rgba(255,255,255,0.4)'}}>{i + 1}</span>
              <span style={{fontFamily: SANS, fontSize: 30, fontWeight: 500, color: on ? C.ink : 'rgba(255,255,255,0.6)'}}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Masculin → Féminin slider (mirrors Beginner → Professional slider)
const Slider: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const from = 12.9, to = 18.3;
  const o = interpolate(t, [from, from + 0.3, to - 0.3, to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(t, [from, from + 0.4], [80, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const k = interpolate(t, [15.6, 17.9], [0.04, 0.96], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const W = 760;
  return (
    <div style={{position: 'absolute', top: 1470, left: (1080 - W - 80) / 2, width: W + 80, padding: '34px 40px', borderRadius: 40,
      background: 'rgba(20,14,9,0.6)', border: '1px solid rgba(255,255,255,0.12)', opacity: o, transform: `translateY(${y}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 26, letterSpacing: 2, color: 'rgba(255,255,255,0.75)', marginBottom: 26}}>
        <span>MASCULIN</span><span style={{color: k > 0.9 ? C.goldLight : 'rgba(255,255,255,0.75)'}}>FÉMININ</span>
      </div>
      <div style={{position: 'relative', height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.15)'}}>
        <div style={{position: 'absolute', height: 10, borderRadius: 5, width: k * W, background: `linear-gradient(90deg, #8C5A22, ${C.goldLight})`}} />
        <div style={{position: 'absolute', left: k * W - 22, top: -17, width: 44, height: 44, borderRadius: 22, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.4)'}} />
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- audio */
type Cue = {src: string; at: number; vol: number; peak?: number};
const dB = (d: number) => Math.pow(10, d / 20);
// whoosh: align peak (seconds into file) to fastest frame; riser: end on transition frame
const WH = {whoosh_hollow: 0.385, whoosh_deep: 0.6, whoosh_soft: 0.72, whoosh_trans: 0.4} as Record<string, number>;
const RISER_LEN = 2.0;
const wh = (src: string, peakAt: number, d = -12): Cue => ({src, at: peakAt - WH[src], vol: dB(d)});
const tx = (src: string, at: number, d = -6): Cue => ({src, at, vol: dB(d)});
const rs = (src: string, endAt: number): Cue => ({src, at: endAt - RISER_LEN, vol: dB(-5)});

export const CUES: Record<string, Cue[]> = {
  WHOOSHES: [
    wh('whoosh_trans', 2.78, -10),   // title card slides up
    wh('whoosh_hollow', 4.6),        // back to talking head
    wh('whoosh_hollow', 5.95),       // trait pills slide up
    wh('whoosh_hollow', 13.1),       // slider panel slides up
    wh('whoosh_soft', 16.8),         // knob travels masculin → féminin
    wh('whoosh_trans', 18.45, -10),  // into féminin scene
    wh('whoosh_deep', 24.05),        // into notes scene
    wh('whoosh_hollow', 28.05),      // back to talking head
    wh('whoosh_soft', 33.2),         // slow push-in on fire
    wh('whoosh_trans', 36.35),       // back to talking head
    wh('whoosh_deep', 43.5, -10),    // end card slides up
  ],
  TEXTURES: [
    tx('scifi_impact', 2.85, -7),    // product reveal
    tx('pop', 6.22), tx('pop', 7.14), tx('pop', 8.24), // traits ①②③
    tx('click', 15.6),               // grab knob
    tx('click', 17.9),               // lands on féminin
    tx('pop', 22.2), tx('pop', 23.02), tx('pop', 23.54), // swatches
    tx('camera', 24.0, -7),          // clip-to-clip transition
    tx('scifi_impact', 26.24, -7),   // ambre card reveal
    tx('pop', 27.48),                // santal card
    tx('tick', 35.04),               // "empreinte" write-in
    tx('pop', 39.08, -7),            // "l'oublier"
    tx('success', 44.84, -7),        // conclusion
  ],
  RISERS: [
    rs('riser_bass', 4.55),   // ~5 s after hook → into body
    rs('riser_metal', 18.4),  // segment: masculin → féminin idea
    rs('riser_bass', 28.0),   // build into "plus fort, plus puissant"
    rs('riser_metal', 32.8),  // into fire / empreinte
  ],
  HITS: [tx('hit', 4.55, -8), tx('hit', 18.4, -9), tx('hit', 28.0, -8), tx('hit', 32.8, -9)],
};

const CueTrack: React.FC<{cues: Cue[]}> = ({cues}) => (
  <>
    {cues.map((c, i) => (
      <Sequence key={i} from={Math.max(0, f(c.at))} durationInFrames={f(3)}>
        <Audio src={staticFile(`sfx/${c.src}.wav`)} volume={c.vol} startFrom={c.at < 0 ? f(-c.at) : 0} />
      </Sequence>
    ))}
  </>
);

// Music: in after the hook so the track ends exactly with the video; ducked under full-screen graphics
const MUSIC_IN = 3.95;
const Music: React.FC = () => (
  <Sequence from={f(MUSIC_IN)}>
    <Audio src={staticFile('music.wav')} volume={(fr) => {
      const t = fr / FPS + MUSIC_IN;
      const base = sceneAt(t) ? dB(-26) : dB(-19);
      const fadeIn = interpolate(t, [MUSIC_IN, MUSIC_IN + 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      const fadeOut = interpolate(t, [DURATION - 1.2, DURATION], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return base * fadeIn * fadeOut;
    }} />
  </Sequence>
);

/* ------------------------------------------------------------------ main */
const SCENE_COMP = {title: TitleScene, feminin: FemininScene, notes: NotesScene, fire: FireScene, end: EndScene};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // subtle punch-ins on the talking head every few lines (reference keeps A-roll alive)
  const punch = [0, 4.55, 9.2, 12.9, 28.0, 30.36, 36.3, 39.54].reduce((z, at, i) => (t >= at ? (i % 2 ? 1.12 : 1.0) : z), 1.0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${punch})`, transformOrigin: '50% 30%'}}>
        <OffthreadVideo src={staticFile('raw.mp4')} />
      </AbsoluteFill>
      <Darken from={5.7} to={9.2} />
      <Darken from={12.9} to={18.3} />
      <Traits />
      <Slider />
      {SCENES.map((s, i) => {
        const Comp = SCENE_COMP[s.kind];
        return (
          <Sequence key={i} from={f(s.from)} durationInFrames={f(s.to) - f(s.from)}>
            <SceneWrap s={s}><Comp s={s} /></SceneWrap>
          </Sequence>
        );
      })}
      <Captions />
      {Object.entries(CUES).map(([name, cues]) => <CueTrack key={name} cues={cues} />)}
      <Music />
    </AbsoluteFill>
  );
};
