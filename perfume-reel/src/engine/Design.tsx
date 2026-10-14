import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile} from 'remotion';
import type {CardFace, Edl, FloatCard, Line, Sheet, TypeComp} from './types';
import {useEdl, useT, expo, clamp, SHADOW, camAt} from './ctx';

/* =====================================================================
   Design layer — what makes it look designed rather than "a word in the middle":
   - TypeComp: multi-line typographic compositions (sans + serif italic + mono labels),
     each line with its own entrance (word rise behind a mask, letter blur, tracking,
     slam, typing), a self-drawing underline or hairline, and an animated exit.
   - FloatCard: white/black cards (label, title, optional photo) that spring in, float,
     follow the camera with parallax, sit behind the speaker, and can flip over.
   - Sheet: the product sheet ("la fiche") — photo + rows that write themselves + CTA pill.
   - YassCaptions: word-by-word captions, chosen words in serif italic.
   ===================================================================== */

const MUTED = '#8C867D';
const CARD = '#F7F5F1';
const INK = '#141210';

const fontOf = (edl: Edl, f: Line['font']) => (f === 'serif' ? edl.theme.serif : f === 'mono' ? edl.theme.mono ?? 'monospace' : edl.theme.sans);

/* ------------------------------------------------------------ a line */
const Underline: React.FC<{at: number; color: string}> = ({at, color}) => {
  const t = useT();
  const q = interpolate(t, [at, at + 0.35], [0, 1], {...clamp, easing: expo});
  if (q <= 0) return null;
  return (
    <svg viewBox="0 0 100 12" preserveAspectRatio="none" style={{position: 'absolute', left: '-2%', width: '104%', bottom: '-0.12em', height: '0.24em', overflow: 'visible'}}>
      <path d="M1 8 C 22 3, 48 11, 70 6 S 92 4, 99 5" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" vectorEffect="non-scaling-stroke"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q} />
    </svg>
  );
};

export const KLine: React.FC<{l: Line; shadow?: boolean}> = ({l, shadow}) => {
  const edl = useEdl();
  const t = useT();
  const font = l.font ?? 'sans';
  const color = l.color ?? '#fff';
  if (l.rule !== undefined) {
    const q = interpolate(t, [l.at, l.at + 0.5], [0, 1], {...clamp, easing: expo});
    return <div style={{width: l.rule, height: 2, background: color, opacity: 0.85, transform: `translate(${l.dx ?? 0}px, ${l.dy ?? 0}px) scaleX(${q})`, transformOrigin: 'left'}} />;
  }
  const size = l.size ?? (font === 'serif' ? 160 : font === 'mono' ? 28 : font === 'caps' ? 130 : 58);
  const base: React.CSSProperties = {
    fontFamily: fontOf(edl, font), fontSize: size, color, whiteSpace: 'pre',
    fontStyle: font === 'serif' ? 'italic' : 'normal',
    fontWeight: l.weight ?? (font === 'serif' ? 400 : font === 'caps' ? 800 : font === 'mono' ? 500 : 600),
    letterSpacing: `${l.tracking ?? (font === 'mono' ? 0.16 : font === 'serif' ? -0.015 : -0.03)}em`,
    textTransform: font === 'mono' || font === 'caps' ? 'uppercase' : undefined,
    lineHeight: font === 'serif' ? 1.0 : 1.05,
    textShadow: shadow ? SHADOW : undefined,
  };
  const anim = l.anim ?? (font === 'serif' ? 'blur' : font === 'mono' ? 'type' : font === 'caps' ? 'slam' : 'rise');
  const wrap: React.CSSProperties = {...base, position: 'relative', display: 'inline-block', transform: `translate(${l.dx ?? 0}px, ${l.dy ?? 0}px)`};
  if (anim === 'none') return <div style={{...wrap, opacity: t >= l.at ? 1 : 0}}>{l.text}{l.underlineAt !== undefined ? <Underline at={l.underlineAt} color={color} /> : null}</div>;
  if (anim === 'track') {
    const q = interpolate(t, [l.at, l.at + (l.dur ?? 0.6)], [0, 1], {...clamp, easing: expo});
    const tr = (l.tracking ?? 0.1) + 0.55 * (1 - q);
    return <div style={{...wrap, letterSpacing: `${tr}em`, opacity: Math.min(1, q * 2.5), filter: `blur(${(1 - q) * 6}px)`}}>{l.text}</div>;
  }
  const byWord = anim === 'rise' || anim === 'slam';
  const parts = byWord ? l.text.split(/(\s+)/) : [...l.text];
  const st = l.stagger ?? (byWord ? 0.05 : anim === 'type' ? 0.028 : 0.011);
  const dur = l.dur ?? (anim === 'rise' ? 0.42 : anim === 'slam' ? 0.16 : 0.3);
  let k = 0;
  return (
    <div style={wrap}>
      {parts.map((p, i) => {
        if (/^\s+$/.test(p)) return <span key={i}>{p}</span>;
        const a = l.at + k++ * st;
        const q = interpolate(t, [a, a + dur], [0, 1], {...clamp, easing: expo});
        if (anim === 'rise') {
          return (
            <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', padding: '0.06em 0.04em 0.16em', margin: '-0.06em -0.04em -0.16em'}}>
              <span style={{display: 'inline-block', transform: `translateY(${(1 - q) * 115}%)`}}>{p}</span>
            </span>
          );
        }
        if (anim === 'slam') return <span key={i} style={{display: 'inline-block', opacity: Math.min(1, q * 2), transform: `scale(${1.45 - 0.45 * q})`, filter: `blur(${(1 - q) * 9}px)`}}>{p}</span>;
        if (anim === 'type') return <span key={i} style={{opacity: t >= a ? 1 : 0}}>{p}</span>;
        return <span key={i} style={{display: 'inline-block', opacity: q, filter: `blur(${(1 - q) * 12}px)`, transform: `translateY(${(1 - q) * 0.22}em)`}}>{p}</span>;
      })}
      {l.underlineAt !== undefined ? <Underline at={l.underlineAt} color={color} /> : null}
    </div>
  );
};

/* ------------------------------------------------------ compositions */
export const TypeCompView: React.FC<{c: TypeComp}> = ({c}) => {
  const t = useT();
  if (t < c.from || t >= c.to) return null;
  const ex = c.exit ?? 'blur';
  const q = ex === 'cut' ? 0 : interpolate(t, [c.to - 0.14, c.to], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const exitStyle: React.CSSProperties = ex === 'up'
    ? {opacity: 1 - q, transform: `translateY(${-q * 90}px)`}
    : {opacity: 1 - q, filter: q > 0 ? `blur(${q * 12}px)` : undefined, transform: `translateY(${-q * 24}px)`};
  const left = c.align === 'left';
  const scrim = (c.scrim ?? !c.behind) ? interpolate(t, [c.from, c.from + 0.2], [0, 1], clamp) * (1 - q) : 0;
  return (
    <>
    {scrim > 0 ? <AbsoluteFill style={{opacity: scrim, background: `radial-gradient(ellipse 75% 16% at 50% ${c.y + 150}px, rgba(12,9,6,0.42), rgba(12,9,6,0) 100%)`}} /> : null}
    <AbsoluteFill style={{top: c.y, alignItems: left ? 'flex-start' : 'center', paddingLeft: left ? c.x ?? 90 : 0, ...exitStyle}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: left ? 'flex-start' : 'center', gap: c.gap ?? 6}}>
        {c.lines.map((l, i) => <KLine key={i} l={l} shadow={c.shadow ?? !c.behind} />)}
      </div>
    </AbsoluteFill>
    </>
  );
};

/* ------------------------------------------------------------- cards */
const Face: React.FC<{f: CardFace; w: number; image?: string; imagePos?: string; imageH?: number; back?: boolean}> = ({f, w, image, imagePos, imageH, back}) => {
  const edl = useEdl();
  const ink = f.dark ? '#F4F1EC' : INK;
  const titleFont = f.titleFont ?? 'serif';
  return (
    <div style={{position: back ? 'absolute' : 'relative', inset: back ? 0 : undefined, width: w, padding: 24, borderRadius: 30, background: f.dark ? '#121110' : CARD,
      boxShadow: '0 34px 70px rgba(0,0,0,0.30), 0 3px 8px rgba(0,0,0,0.12)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
      transform: back ? 'rotateY(180deg)' : undefined, display: 'flex', flexDirection: 'column', gap: 10}}>
      {image ? <div style={{height: imageH ?? w * 0.92, borderRadius: 20, overflow: 'hidden', marginBottom: 6}}>
        <Img src={staticFile(image)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: imagePos ?? '50% 50%'}} />
      </div> : null}
      {f.label ? <div style={{fontFamily: edl.theme.mono, fontWeight: 500, fontSize: 21, letterSpacing: '0.16em', textTransform: 'uppercase', color: f.dark ? '#A49D92' : MUTED}}>{f.label}</div> : null}
      {f.title ? <div style={{fontFamily: titleFont === 'serif' ? edl.theme.serif : edl.theme.sans, fontStyle: titleFont === 'serif' ? 'italic' : 'normal',
        fontWeight: titleFont === 'serif' ? 400 : titleFont === 'caps' ? 800 : 600, fontSize: titleFont === 'serif' ? 92 : 64, lineHeight: 1.0,
        letterSpacing: titleFont === 'serif' ? '-0.01em' : '-0.03em', textTransform: titleFont === 'caps' ? 'uppercase' : undefined, color: ink}}>{f.title}</div> : null}
      {f.sub ? <div style={{fontFamily: edl.theme.sans, fontWeight: 500, fontSize: 27, color: f.dark ? '#B9B2A7' : MUTED}}>{f.sub}</div> : null}
    </div>
  );
};

export const FloatCardView: React.FC<{c: FloatCard; overBase?: boolean}> = ({c, overBase}) => {
  const edl = useEdl();
  const t = useT();
  if (t < c.from || t >= c.to) return null;
  const p = spring({frame: Math.round((t - c.at) * edl.fps), fps: edl.fps, config: {damping: 19, mass: 0.75, stiffness: 150}});
  const e = c.enter ?? 'rise';
  const enter = e === 'left' ? `translateX(${-(1 - p) * 760}px) rotate(${-(1 - p) * 8}deg)`
    : e === 'right' ? `translateX(${(1 - p) * 760}px) rotate(${(1 - p) * 8}deg)`
    : e === 'pop' ? `scale(${0.82 + 0.18 * p})` : `translateY(${(1 - p) * 220}px)`;
  const out = interpolate(t, [c.to - 0.18, c.to], [0, 1], {...clamp, easing: expo});
  const floatY = Math.sin((t - c.at) * 1.6 + c.x * 0.01) * 7;
  const rot = (c.rot ?? 0) + Math.sin((t - c.at) * 1.1) * 0.5;
  const flip = c.flipAt !== undefined ? interpolate(t, [c.flipAt, c.flipAt + 0.5], [0, 180], {...clamp, easing: expo}) : 0;
  const cam = overBase ? 1 + (camAt(edl, t) - 1) * (c.parallax ?? 0.6) : 1;
  return (
    <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: edl.base.origin ?? '50% 32%'}}>
      <div style={{position: 'absolute', left: c.x - c.w / 2, top: c.y, width: c.w, perspective: 1600,
        opacity: Math.min(1, p * 1.6) * (1 - out), filter: p < 0.98 || out > 0 ? `blur(${Math.max((1 - Math.min(1, p)) * 10, out * 12)}px)` : undefined,
        transform: `${enter} translateY(${floatY - out * 40}px) rotate(${rot}deg)`}}>
        <div style={{position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${flip}deg)`}}>
          <Face f={c} w={c.w} image={c.image} imagePos={c.imagePos} imageH={c.imageH} />
          {c.back ? <Face f={c.back} w={c.w} back /> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- sheet */
export const SheetView: React.FC<{s: Sheet}> = ({s}) => {
  const edl = useEdl();
  const t = useT();
  if (t < s.from || t >= s.to) return null;
  const p = spring({frame: Math.round((t - s.at) * edl.fps), fps: edl.fps, config: {damping: 21, mass: 0.8, stiffness: 140}});
  const z = interpolate(t, [s.at, s.to], [1.08, 1.0], clamp);
  const gap = s.rowGap ?? 0.22;
  const pill = s.pill ? spring({frame: Math.round((t - s.pill.at) * edl.fps), fps: edl.fps, config: {damping: 16, mass: 0.6}}) : 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 110, top: s.top ?? 230, width: 860, padding: 26, borderRadius: 34, background: CARD,
        boxShadow: '0 40px 90px rgba(0,0,0,0.28), 0 3px 10px rgba(0,0,0,0.10)', opacity: Math.min(1, p * 1.5),
        transform: `translateY(${(1 - p) * 260}px)`, filter: p < 0.98 ? `blur(${(1 - Math.min(1, p)) * 10}px)` : undefined}}>
        <div style={{height: 560, borderRadius: 22, overflow: 'hidden'}}>
          <Img src={staticFile(s.image)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.imagePos ?? '50% 50%', transform: `scale(${z})`}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 6px 8px', fontFamily: edl.theme.mono, fontSize: 21, fontWeight: 500, letterSpacing: '0.16em', color: MUTED}}>
          <span>{s.label}</span><span>ALOI</span>
        </div>
        {s.rows.map(([k, v], i) => {
          const a = s.rowsAt + i * gap;
          const q = interpolate(t, [a, a + 0.45], [0, 1], {...clamp, easing: expo});
          return (
            <div key={i} style={{position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '18px 6px 14px'}}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1.5, background: '#D9D3C9', transform: `scaleX(${q})`, transformOrigin: 'left'}} />
              <span style={{fontFamily: edl.theme.mono, fontSize: 21, fontWeight: 500, letterSpacing: '0.16em', color: MUTED, opacity: q}}>{k}</span>
              <span style={{overflow: 'hidden', display: 'inline-block'}}>
                <span style={{display: 'inline-block', fontFamily: edl.theme.sans, fontWeight: 600, fontSize: 38, letterSpacing: '-0.02em', color: INK,
                  transform: `translateY(${(1 - q) * 110}%)`}}>{v}</span>
              </span>
            </div>
          );
        })}
      </div>
      {s.pill ? (
        <AbsoluteFill style={{top: 1600, alignItems: 'center'}}>
          <div style={{opacity: Math.min(1, pill * 1.5), transform: `translateY(${(1 - pill) * 40}px) scale(${0.9 + 0.1 * pill})`, display: 'flex', alignItems: 'center', gap: 16,
            padding: '24px 40px', borderRadius: 999, background: INK, color: '#fff', fontFamily: edl.theme.sans, fontWeight: 600, fontSize: 36, letterSpacing: '-0.01em',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}}>
            {s.pill.text}<span style={{fontSize: 34, transform: `translateX(${(1 - pill) * -10}px)`}}>→</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------- captions */
const norm = (w: string) => w.toLowerCase().replace(/[.,!?;:«»"]/g, '');
export const YassCaptions: React.FC<{hidden: boolean}> = ({hidden}) => {
  const edl = useEdl();
  const t = useT();
  const chunks = React.useMemo(() => {
    const out: typeof edl.words[] = [];
    let cur: typeof edl.words = [];
    edl.words.forEach((w, i) => {
      cur.push(w);
      const n = edl.words[i + 1];
      if (!n || /[.,?!]$/.test(w.w) || n.s - w.e > 0.25 || cur.length >= 3 || cur.join('').length > 16) { out.push(cur); cur = []; }
    });
    return out;
  }, [edl.words]);
  if (hidden) return null;
  const i = chunks.findIndex((c, k) => t >= c[0].s - 0.03 && t < (chunks[k + 1]?.[0].s ?? edl.duration) - 0.03);
  if (i < 0) return null;
  const emph = new Set((edl.captionEmph ?? []).map(norm));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: edl.theme.captionY - 960}}>
      <div style={{whiteSpace: 'nowrap', textShadow: SHADOW, display: 'flex', alignItems: 'baseline', gap: 14}}>
        {chunks[i].map((w, k) => {
          const q = interpolate(t, [w.s - 0.04, w.s + 0.22], [0, 1], {...clamp, easing: expo});
          const isE = emph.has(norm(w.w));
          const txt = w.w.replace(/[.,!?;:]+$/, '');
          return (
            <span key={k} style={{display: 'inline-block', overflow: 'hidden', padding: '0.08em 0.05em 0.18em', margin: '-0.08em -0.05em -0.18em'}}>
              <span style={{display: 'inline-block', transform: `translateY(${(1 - q) * 100}%)`, opacity: Math.min(1, q * 3),
                fontFamily: isE ? edl.theme.serif : edl.theme.sans, fontStyle: isE ? 'italic' : 'normal', fontWeight: isE ? 400 : 600,
                fontSize: isE ? edl.theme.captionSize * 1.45 : edl.theme.captionSize, letterSpacing: isE ? '-0.01em' : '-0.025em', color: '#fff'}}>{txt}</span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------- helpers */
export const PaperBg: React.FC<{tone?: 'light' | 'dark'}> = ({tone}) =>
  tone === 'dark'
    ? <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #2A2622 0%, #12100E 70%)'}} />
    : <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #FAF8F4 0%, #EDE8E0 75%)'}}>
        <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(40,30,20,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(40,30,20,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
      </AbsoluteFill>;

/** true when a front design element owns the screen (captions step aside) */
export const activeFront = (edl: Edl, t: number) =>
  (edl.types ?? []).some((c) => !c.behind && t >= c.from && t < c.to) || (!!edl.sheet && t >= edl.sheet.from && t < edl.sheet.to);
