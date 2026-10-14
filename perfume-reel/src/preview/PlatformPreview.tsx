import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Reel} from '../engine/Reel';
import type {Edl} from '../engine/types';

/* =====================================================================
   Platform preview — the finished reel shown as it will look in the app,
   arriving with a swipe from the previous video. Internal review only
   (never posted): checks what the app UI covers on each platform.
   Layouts: Instagram from the Style Lab iPhone measurements (1 pt ≈ 1.054 px,
   x = 54 + 1.054·pt); TikTok and YouTube Shorts from community measurements.
   ===================================================================== */

export type PreviewProps = {
  src: string;                 // finished reel under public/
  prevSrc?: string;            // the reel scrolled away at the start
  platform: 'instagram' | 'tiktok' | 'youtube';
  handle: string;              // without @
  caption: string;
  music: string;
  likes: string; comments: string; shares: string; saves: string;
  scroll: number;              // seconds of the previous reel before the swipe
  duration: number;            // reel duration (s)
  edl?: Edl;                   // planche mode: render the live reel instead of the mp4
};

const FONT = 'Inter, -apple-system, sans-serif';
const sh = '0 1px 3px rgba(0,0,0,0.45)';
const W = '#fff';

/* ---------------------------------------------------------------- icons */
const I = {
  heart: 'M12 20.2s-7.6-4.6-7.6-10.4A4.3 4.3 0 0 1 12 7.1a4.3 4.3 0 0 1 7.6 2.7c0 5.8-7.6 10.4-7.6 10.4z',
  comment: 'M20.4 11.6a8.2 8.2 0 1 1-3.3-6.6 8.2 8.2 0 0 1 3.3 6.6z M20.4 20.4l-2.8-1.6',
  repost: 'M16.4 3.4l3 3-3 3 M4.6 12v-1.9a3.6 3.6 0 0 1 3.6-3.6h11.2 M7.6 20.6l-3-3 3-3 M19.4 12v1.9a3.6 3.6 0 0 1-3.6 3.6H4.6',
  send: 'M21 3.2 3.2 10.3l7.1 3.1 3.1 7.1L21 3.2z M10.3 13.4 15.4 8.3',
  save: 'M5.4 4.5h13.2v15L12 15l-6.6 4.5z',
  more: 'M5.5 12h.01 M12 12h.01 M18.5 12h.01',
  plus: 'M12 4.5v15M4.5 12h15',
  chev: 'm6.5 9.5 5.5 5.5 5.5-5.5',
  home: 'M4 10.6 12 4l8 6.6V20h-5.4v-5.8H9.4V20H4z',
  search: 'M11 4.4a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2z m5 11.6 4.6 4.6',
  camera: 'M4 8h3l1.5-2h7L17 8h3v11H4z M12 10.5a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z',
  thumb: 'M7 10v10H4V10z M7 10l4-7c1.6 0 2.6 1.2 2.3 2.8L12.8 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7',
  bookmark: 'M6 3.5h12v17l-6-4-6 4z',
  share: 'M14 5l7 6.5-7 6.5v-4c-5 0-8.5 1.5-11 5 1-5 4-9.5 11-10z',
  remix: 'M4 7h10a5 5 0 0 1 0 10H8 M7 4 4 7l3 3 M17 20l3-3-3-3',
  inbox: 'M4 6h16v12H4z M4 6l8 7 8-7',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M2.5 20c.9-3.3 3.4-5 6.5-5s5.6 1.7 6.5 5 M16 4.3a3.5 3.5 0 0 1 0 6.4 M18 15c2 .5 3.2 2.2 3.6 5',
  subs: 'M4 6h16v13H4z M10 9.5v6l5-3z M7 3h10',
  shorts: 'M10 8.5v7l6-3.5z M8 3.5l8-0.5c3 0 4.6 3.6 2.4 5.6l-1 .9 1 .9c2.2 2 .6 5.6-2.4 5.6',
};
const Ic: React.FC<{d: string; size: number; fill?: boolean; stroke?: number; style?: React.CSSProperties}> = ({d, size, fill, stroke = 1.7, style}) => (
  <svg viewBox="0 0 24 24" style={{width: size, height: size, display: 'block', overflow: 'visible', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))', ...style}}>
    <path d={d} fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={fill ? 0 : stroke} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Avatar: React.FC<{size: number; ring?: string}> = ({size, ring}) => (
  <div style={{width: size, height: size, borderRadius: '50%', padding: ring ? size * 0.05 : 0, background: ring ?? 'transparent', flex: 'none'}}>
    <div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#111', border: ring ? `${size * 0.035}px solid #fff` : '2px solid #fff', display: 'grid', placeItems: 'center',
      fontFamily: FONT, fontWeight: 300, fontSize: size * 0.27, letterSpacing: '0.06em', color: '#fff'}}>ALOI</div>
  </div>
);

const Status: React.FC<{y?: number}> = ({y = 0}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 92, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 70px 0 120px', color: W,
    fontFamily: FONT, fontWeight: 600, fontSize: 44, textShadow: sh}}>
    <span>9:41</span>
    <span style={{display: 'flex', gap: 14, alignItems: 'center'}}>
      <svg viewBox="0 0 34 22" style={{width: 46, height: 30}}><g fill="#fff">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 9} y={16 - i * 5} width={6} height={6 + i * 5} rx={1.5} />)}</g></svg>
      <svg viewBox="0 0 54 24" style={{width: 70, height: 32}}><rect x={1} y={2} width={46} height={20} rx={6} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={2} /><rect x={4} y={5} width={36} height={14} rx={3.5} fill="#fff" /><rect x={49} y={8} width={3} height={8} rx={1.5} fill="#fff" fillOpacity={0.5} /></svg>
    </span>
  </div>
);

/* ------------------------------------------------------------ Instagram
   Generic phone = iPhone 13 (390×844 pt, status bar 47 pt, Instagram tab bar 83 pt). The 9:16 reel fills the
   761 pt above the tab bar → 2.523 px per pt in our 1080×1920 frame, ~48 px cropped per side.            */
const IgUi: React.FC<{p: PreviewProps; liked: boolean}> = ({p, liked}) => {
  const u = (pt: number) => 54 + pt * 1.054, v = (pt: number) => pt * 1.054;
  const rail: [keyof typeof I, number, string][] = [['heart', 994, p.likes], ['comment', 1145, p.comments], ['repost', 1302, ''], ['send', 1407, p.shares], ['save', 1563, p.saves], ['more', 1712, '']];
  return (
    <AbsoluteFill style={{color: W, fontFamily: FONT, textShadow: sh}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.5) 100%)'}} />
      <Status />
      {/* header row, iPhone 13: centre y ≈ 65 pt → 165 px; title centred, + left, camera right */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 165 - 34, height: 68, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34, fontWeight: 700, fontSize: 50}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 10}}>Reels <Ic d={I.chev} size={34} stroke={2.4} /></span>
        <span style={{color: 'rgba(255,255,255,0.6)'}}>Amis</span>
      </div>
      <div style={{position: 'absolute', left: 74, top: 165 - 30}}><Ic d={I.plus} size={60} stroke={2} /></div>
      <div style={{position: 'absolute', right: 74, top: 165 - 30}}><Ic d={I.camera} size={60} /></div>
      {rail.map(([k, cy, n]) => (
        <div key={k} style={{position: 'absolute', left: u(857) - 60, width: 120, top: v(cy) - 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
          <Ic d={I[k]} size={76} fill={k === 'heart' && liked} style={{color: k === 'heart' && liked ? '#FF3040' : W}} stroke={k === 'more' ? 4 : 1.8} />
          {n ? <span style={{fontWeight: 600, fontSize: 27}}>{n}</span> : null}
        </div>
      ))}
      <div style={{position: 'absolute', left: u(34), top: v(1590), display: 'flex', alignItems: 'center', gap: 22}}>
        <Avatar size={100} ring="linear-gradient(45deg,#fdc830,#f37335 30%,#ee2a7b 65%,#c837ab)" />
        <span style={{fontWeight: 600, fontSize: 32}}>{p.handle}</span>
        <span style={{border: '2px solid rgba(255,255,255,0.6)', borderRadius: 14, padding: '6px 18px', fontWeight: 600, fontSize: 30}}>Suivre</span>
      </div>
      <div style={{position: 'absolute', left: u(36), width: 760, top: v(1712), fontSize: 30, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p.caption}</div>
      <div style={{position: 'absolute', left: u(36), top: v(1760), fontSize: 27, opacity: 0.9}}>♫ {p.music}</div>
      <div style={{position: 'absolute', left: u(49), width: v(825), top: v(1826), height: v(123), borderRadius: v(62), background: 'rgba(46,46,50,0.62)', backdropFilter: 'blur(10px) saturate(1.3)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', textShadow: 'none'}}>
        <Ic d={I.home} size={64} /><div style={{background: 'rgba(255,255,255,0.16)', borderRadius: 60, padding: '16px 36px'}}><Ic d={I.shorts} size={64} /></div>
        <Ic d={I.send} size={60} /><Ic d={I.search} size={64} /><Avatar size={56} />
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- TikTok */
const TtUi: React.FC<{p: PreviewProps; liked: boolean; t: number}> = ({p, liked, t}) => {
  const rail: [keyof typeof I, string][] = [['heart', p.likes], ['comment', p.comments], ['bookmark', p.saves], ['share', p.shares]];
  return (
    <AbsoluteFill style={{color: W, fontFamily: FONT, textShadow: sh}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.55) 92%)'}} />
      <Status />
      <div style={{position: 'absolute', left: 0, right: 0, top: 112, display: 'flex', justifyContent: 'center', gap: 44, fontWeight: 700, fontSize: 40}}>
        <span style={{opacity: 0.65}}>Explorer</span><span style={{opacity: 0.65}}>Abonnements</span>
        <span style={{position: 'relative'}}>Pour toi<span style={{position: 'absolute', left: '30%', right: '30%', bottom: -12, height: 5, borderRadius: 3, background: '#fff'}} /></span>
      </div>
      <div style={{position: 'absolute', left: 50, top: 116}}><span style={{border: '3px solid #fff', borderRadius: 10, padding: '0 8px', fontWeight: 800, fontSize: 26}}>LIVE</span></div>
      <div style={{position: 'absolute', right: 50, top: 108}}><Ic d={I.search} size={58} stroke={2.2} /></div>
      <div style={{position: 'absolute', right: 30, width: 130, top: 860, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
        <div style={{position: 'relative', marginBottom: 18}}><Avatar size={104} />
          <div style={{position: 'absolute', left: 32, bottom: -18, width: 40, height: 40, borderRadius: '50%', background: '#FE2C55', display: 'grid', placeItems: 'center', fontSize: 34, fontWeight: 700, lineHeight: 1}}>+</div></div>
        {rail.map(([k, n]) => (
          <div key={k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <Ic d={I[k]} size={84} fill style={{color: k === 'heart' && liked ? '#FE2C55' : W}} />
            <span style={{fontWeight: 700, fontSize: 28}}>{n}</span>
          </div>
        ))}
        <div style={{width: 96, height: 96, borderRadius: '50%', background: 'radial-gradient(circle, #555 0 22%, #111 23% 100%)', border: '14px solid #222', transform: `rotate(${t * 90}deg)`}} />
      </div>
      <div style={{position: 'absolute', left: 40, width: 800, top: 1540, display: 'flex', flexDirection: 'column', gap: 12}}>
        <span style={{fontWeight: 700, fontSize: 36}}>{p.handle}</span>
        <span style={{fontSize: 32, lineHeight: 1.3}}>{p.caption} <b>#montre #rolex #lyon</b></span>
        <span style={{fontSize: 30, opacity: 0.95}}>♫ {p.music}</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: '#000', display: 'flex', justifyContent: 'space-around', alignItems: 'center', fontSize: 22, textShadow: 'none'}}>
        {(['home', 'users'] as const).map((k, i) => <div key={k} style={{display: 'grid', justifyItems: 'center', gap: 6, opacity: i ? 0.7 : 1}}><Ic d={I[k]} size={52} fill={!i} /><span>{i ? 'Amis' : 'Accueil'}</span></div>)}
        <div style={{width: 110, height: 70, borderRadius: 18, background: 'linear-gradient(90deg,#25F4EE 0 12%,#fff 12% 88%,#FE2C55 88%)', display: 'grid', placeItems: 'center', color: '#000', fontSize: 50, fontWeight: 700}}>+</div>
        {(['inbox', 'user'] as const).map((k, i) => <div key={k} style={{display: 'grid', justifyItems: 'center', gap: 6, opacity: 0.7}}><Ic d={I[k]} size={52} /><span>{i ? 'Profil' : 'Boîte de réception'}</span></div>)}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------- YouTube Shorts */
const YtUi: React.FC<{p: PreviewProps; liked: boolean}> = ({p, liked}) => {
  const rail: [keyof typeof I, string, boolean?][] = [['thumb', p.likes], ['thumb', 'Je n’aime pas', true], ['comment', p.comments], ['share', 'Partager'], ['remix', 'Remixer']];
  return (
    <AbsoluteFill style={{color: W, fontFamily: FONT, textShadow: sh}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.55) 92%)'}} />
      <Status />
      <div style={{position: 'absolute', right: 50, top: 112, display: 'flex', gap: 40}}><Ic d={I.search} size={58} stroke={2.2} /><Ic d={I.camera} size={58} /><Ic d={I.more} size={58} stroke={5} style={{transform: 'rotate(90deg)'}} /></div>
      <div style={{position: 'absolute', right: 26, width: 150, top: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        {rail.map(([k, n, down], i) => (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <div style={{width: 104, height: 104, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center'}}>
              <Ic d={I[k]} size={58} fill={k === 'thumb' && !down && liked} style={{transform: down ? 'rotate(180deg)' : undefined}} />
            </div>
            <span style={{fontWeight: 600, fontSize: 25}}>{n}</span>
          </div>
        ))}
        <div style={{width: 84, height: 84, borderRadius: 16, background: '#111', border: '3px solid #fff', marginTop: 6}} />
      </div>
      <div style={{position: 'absolute', left: 36, width: 820, top: 1560, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <Avatar size={76} /><span style={{fontWeight: 600, fontSize: 32}}>@{p.handle}</span>
          <span style={{background: '#fff', color: '#0f0f0f', borderRadius: 40, padding: '10px 26px', fontWeight: 600, fontSize: 28, textShadow: 'none'}}>S'abonner</span>
        </div>
        <span style={{fontSize: 33, lineHeight: 1.3}}>{p.caption}</span>
        <span style={{fontSize: 28, opacity: 0.9}}>♫ {p.music}</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: '#0f0f0f', display: 'flex', justifyContent: 'space-around', alignItems: 'center', fontSize: 22, textShadow: 'none'}}>
        {([['home', 'Accueil'], ['shorts', 'Shorts']] as const).map(([k, l]) => <div key={k} style={{display: 'grid', justifyItems: 'center', gap: 6}}><Ic d={I[k]} size={50} fill={k === 'shorts'} /><span>{l}</span></div>)}
        <div style={{width: 86, height: 86, borderRadius: '50%', border: '3px solid #fff', display: 'grid', placeItems: 'center'}}><Ic d={I.plus} size={48} stroke={2.4} /></div>
        {([['subs', 'Abonnements'], ['user', 'Vous']] as const).map(([k, l]) => <div key={k} style={{display: 'grid', justifyItems: 'center', gap: 6}}><Ic d={I[k]} size={50} /><span>{l}</span></div>)}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- the feed */
export const PlatformPreview: React.FC<PreviewProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const S = Math.round(p.scroll * fps);
  // swipe: finger drags up, the next reel follows and settles
  const sw = spring({frame: frame - S, fps, config: {damping: 30, mass: 0.9, stiffness: 160}});
  const y = interpolate(sw, [0, 1], [0, -1920]);
  const liked = t > p.scroll + 6.5;   // a double tap later in the reel turns the heart red
  const ui = (cur: boolean) => p.platform === 'instagram' ? <IgUi p={p} liked={cur && liked} /> : p.platform === 'tiktok' ? <TtUi p={p} liked={cur && liked} t={t} /> : <YtUi p={p} liked={cur && liked} />;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translateY(${y}px)`}}>
        {p.prevSrc ? <OffthreadVideo src={staticFile(p.prevSrc)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)'}} /> : <AbsoluteFill style={{background: '#222'}} />}
        {ui(false)}
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translateY(${y + 1920}px)`}}>
        <Sequence from={S} layout="none">
          <AbsoluteFill>{p.edl ? <Reel edl={p.edl} /> : <OffthreadVideo src={staticFile(p.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}</AbsoluteFill>
        </Sequence>
        {ui(true)}
      </AbsoluteFill>
      {/* a thumb drag hint during the swipe */}
      {t > p.scroll - 0.25 && t < p.scroll + 0.35 ? (
        <div style={{position: 'absolute', left: 540 - 50, top: interpolate(t, [p.scroll - 0.25, p.scroll + 0.35], [1400, 700], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)}),
          width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', border: '3px solid rgba(255,255,255,0.7)'}} />
      ) : null}
    </AbsoluteFill>
  );
};
