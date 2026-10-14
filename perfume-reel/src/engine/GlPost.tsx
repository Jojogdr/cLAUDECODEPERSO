import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {GlTransition} from './gl/GlTransition';

/* =====================================================================
   Pass 2 — GL transitions on top of an already-rendered "clean" reel.
   Pass 1 renders the EDL with hard cuts at every transition point; here,
   inside each window we feed the WebGL shader the last frame before the
   cut (outgoing, live until the cut then held) and the first frame after
   it (incoming, held until the cut then live) — so any layered scene
   (walls, words, cards) gets a real gl-transition. Frames come from
   scripts/gl_post_frames.py. Render with --gl=swangle.
   ===================================================================== */

export type GlCut = {
  at: number;               // cut time (s) in the clean render
  name: string;             // gl-transitions name, e.g. CrossZoom, DreamyZoom, FilmBurn, LinearBlur
  frames: number;           // total window length (frames), centred on the cut
  params?: Record<string, number | boolean | number[]>;
  flash?: number;           // white flash peak at the cut (0..1)
  leak?: number;            // warm light-leak intensity (0..1)
};

export type GlPostProps = {video: string; framesDir: string; fps: number; duration: number; cuts: GlCut[]};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pad = (n: number) => String(n).padStart(5, '0');

export const windowOf = (c: GlCut, fps: number) => {
  const cutF = Math.round(c.at * fps);
  const a = cutF - Math.floor(c.frames / 2);
  return {cutF, a, b: a + c.frames}; // [a, b)
};

export const GlPost: React.FC<GlPostProps> = ({video, framesDir, fps, cuts}) => {
  const frame = useCurrentFrame();
  const cut = cuts.find((c) => {
    const w = windowOf(c, fps);
    return frame >= w.a && frame < w.b;
  });
  let layer: React.ReactNode = <OffthreadVideo src={staticFile(video)} muted />;
  let light: React.ReactNode = null;
  if (cut) {
    const {cutF, a, b} = windowOf(cut, fps);
    const fromIdx = Math.min(frame, cutF - 1);
    const toIdx = Math.max(frame, cutF);
    const progress = interpolate(frame, [a, b - 1], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
    layer = (
      <GlTransition
        key={frame}
        from={{kind: 'image', src: staticFile(`${framesDir}/f${pad(fromIdx)}.png`)}}
        to={{kind: 'image', src: staticFile(`${framesDir}/f${pad(toIdx)}.png`)}}
        transition={cut.name}
        params={cut.params}
        progress={progress}
      />
    );
    const d = Math.abs(frame - cutF + 0.5) / (cut.frames / 2); // 0 at the cut, 1 at the window edges
    const flash = (cut.flash ?? 0) * Math.max(0, 1 - d * 1.6);
    const leak = (cut.leak ?? 0) * Math.max(0, 1 - d);
    light = (
      <>
        {leak > 0 ? <AbsoluteFill style={{mixBlendMode: 'screen', opacity: leak,
          background: `radial-gradient(ellipse 70% 45% at ${30 + 40 * progress}% 35%, rgba(255,170,90,0.95), transparent 70%), radial-gradient(ellipse 50% 40% at ${80 - 30 * progress}% 75%, rgba(255,215,160,0.7), transparent 70%)`}} /> : null}
        {flash > 0 ? <AbsoluteFill style={{background: '#fff', opacity: flash}} /> : null}
      </>
    );
  }
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {layer}
      {light}
    </AbsoluteFill>
  );
};
