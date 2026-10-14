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
