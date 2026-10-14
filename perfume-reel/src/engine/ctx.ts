import {createContext, useContext} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {Edl} from './types';

export const Ctx = createContext<Edl | null>(null);
export const useEdl = () => useContext(Ctx)!;
export const useT = () => useCurrentFrame() / useEdl().fps;

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const expo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.inOut(Easing.cubic);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const SHADOW = '0 2px 6px rgba(0,0,0,0.35), 0 6px 26px rgba(0,0,0,0.45)';

export const camAt = (edl: Edl, t: number) => {
  let v = 1;
  for (const [k, s, d] of edl.camera) {
    if (t < k) break;
    const p = interpolate(t, [k, k + Math.max(d, 0.001)], [0, 1], {...clamp, easing: d <= 0.2 ? ease : inOut});
    v = v + (s - v) * p;
  }
  return v;
};

/* Per-platform top layout (each app has its own header; the master is rendered once per platform).
   shift: how far the top band (titles, badges, cards in the upper half) moves up from the 240-px Instagram default.
   ref / mark: where the reference label and the ALOI mark sit.                                              */
export const LAYOUT = {
  instagram: {shift: 85, ref: {left: 96, top: 208}, mark: {right: 250, top: 146}},   // first text line at y ≈ 215, under "Reels ⌄ Amis"
  tiktok: {shift: 110, ref: {left: 96, top: 184}, mark: {right: 96, top: 176}},       // first text line at y ≈ 190, under "Pour toi"
  youtube: {shift: 160, ref: {left: 66, top: 128}, mark: {right: 330, top: 120}},     // first text line at y ≈ 140 (only icons top-right)
} as const;
export const layoutOf = (edl: Edl) => LAYOUT[edl.platform ?? 'instagram'];
/** moves a y in the upper half of the frame up by the platform shift */
export const upY = (edl: Edl, y: number) => (y < 760 ? y - layoutOf(edl).shift : y);
