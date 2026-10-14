import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {AbsoluteFill, OffthreadVideo, useDelayRender} from 'remotion';
import transitions from 'gl-transitions';
import {GlProgram, TexSource, UniformValue, getGl, loadImage, makeProgram, makeTexture, setUniform, sourceSize, uploadTexture} from './glcore';

/* ------------------------------------------------------------------------------------------
   <GlTransition> — renders any of the 125 gl-transitions (MIT) between two media sources.
   - from/to: still image URL or a video (frames delivered by <OffthreadVideo onVideoFrame>)
   - progress: 0..1 (drive it with interpolate()/spring() from useCurrentFrame())
   - zoomFrom/zoomTo: extra Ken-Burns scale applied inside the shader (1 = none)
   Needs WebGL in the render browser: render with `--gl=swangle` (SwiftShader via ANGLE) or `--gl=angle`.
   ------------------------------------------------------------------------------------------ */

export type Media = {kind: 'image'; src: string} | {kind: 'video'; src: string; startFrom?: number};
export type TransitionDef = {glsl: string; paramsTypes: Record<string, string>; defaultParams: Record<string, UniformValue>; textures?: string[]};

const RESIZE = {
  cover: (r: string) => `.5+(uv-.5)*vec2(min(ratio/${r},1.),min(${r}/ratio,1.))`,
  contain: (r: string) => `.5+(uv-.5)*vec2(max(ratio/${r},1.),max(${r}/ratio,1.))`,
  stretch: () => 'uv',
};

const makeFrag = (glsl: string, mode: keyof typeof RESIZE) => `precision highp float;
varying vec2 _uv;
uniform sampler2D from, to;
uniform float progress, ratio, _fromR, _toR, _zf, _zt;
vec4 getFromColor(vec2 uv){ uv = .5+(uv-.5)/_zf; return texture2D(from, ${RESIZE[mode]('_fromR')}); }
vec4 getToColor(vec2 uv){ uv = .5+(uv-.5)/_zt; return texture2D(to, ${RESIZE[mode]('_toR')}); }
${glsl}
void main(){ gl_FragColor = transition(_uv); }`;

export const getTransition = (name: string): TransitionDef => {
  const t = (transitions as any[]).find((x) => x.name === name);
  if (!t) throw new Error('Unknown gl-transition ' + name);
  return t;
};

type Props = {
  from: Media;
  to: Media;
  transition: string | TransitionDef;
  progress: number;
  params?: Record<string, UniformValue>;
  /** extra textures (e.g. `luma` mask for "luma", `displacementMap` for "displacement") */
  textures?: Record<string, string>;
  resizeMode?: keyof typeof RESIZE;
  zoomFrom?: number;
  zoomTo?: number;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
};

export const GlTransition: React.FC<Props> = ({from, to, transition, progress, params = {}, textures = {}, resizeMode = 'cover', zoomFrom = 1, zoomTo = 1, width = 1080, height = 1920, style}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef<{p: GlProgram; tex: WebGLTexture[]; size: [number, number][]; ready: boolean[]} | null>(null);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const def = useMemo(() => (typeof transition === 'string' ? getTransition(transition) : transition), [transition]);
  const extraNames = useMemo(() => def.textures ?? Object.entries(def.paramsTypes).filter(([, t]) => t === 'sampler2D').map(([n]) => n), [def]);
  const [initHandle] = useState(() => delayRender('GlTransition init'));
  const latest = useRef({progress, params, zoomFrom, zoomTo});
  latest.current = {progress, params, zoomFrom, zoomTo};

  const draw = useCallback(() => {
    const s = state.current;
    if (!s || !s.ready[0] || !s.ready[1]) return;
    const {p} = s;
    const {gl} = p;
    const L = latest.current;
    gl.useProgram(p.prog);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    setUniform(p, 'progress', 'float', Math.min(1, Math.max(0, L.progress)));
    setUniform(p, 'ratio', 'float', width / height);
    setUniform(p, '_fromR', 'float', s.size[0][0] / s.size[0][1]);
    setUniform(p, '_toR', 'float', s.size[1][0] / s.size[1][1]);
    setUniform(p, '_zf', 'float', L.zoomFrom);
    setUniform(p, '_zt', 'float', L.zoomTo);
    for (const [k, type] of Object.entries(def.paramsTypes)) {
      if (type === 'sampler2D') continue;
      const v = k in L.params ? L.params[k] : def.defaultParams[k];
      if (v !== undefined) setUniform(p, k, type, v);
    }
    s.tex.forEach((t, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
    });
    gl.uniform1i(p.uniformLoc('from'), 0);
    gl.uniform1i(p.uniformLoc('to'), 1);
    extraNames.forEach((n, i) => gl.uniform1i(p.uniformLoc(n), 2 + i));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }, [def, extraNames, width, height]);

  const setSource = useCallback((slot: number, src: TexSource) => {
    const s = state.current;
    if (!s) return;
    uploadTexture(s.p.gl, s.tex[slot], slot, src);
    s.size[slot] = sourceSize(src);
    s.ready[slot] = true;
    draw();
  }, [draw]);

  // STABLE callbacks: an inline arrow would change identity every frame and make Remotion's
  // internal <Img> re-run its decode effect on an already-revoked blob URL (EncodingError spam).
  const onFromFrame = useCallback((f: CanvasImageSource) => setSource(0, f as TexSource), [setSource]);
  const onToFrame = useCallback((f: CanvasImageSource) => setSource(1, f as TexSource), [setSource]);

  // init GL + load still images / extra textures once
  useEffect(() => {
    let cancelled = false;
    try {
      const gl = getGl(canvas.current!);
      const p = makeProgram(gl, makeFrag(def.glsl, resizeMode));
      const tex = [makeTexture(gl), makeTexture(gl), ...extraNames.map(() => makeTexture(gl))];
      state.current = {p, tex, size: [[1, 1], [1, 1]], ready: [false, false]};
      const jobs: Promise<void>[] = [];
      [from, to].forEach((m, slot) => {
        if (m.kind === 'image') jobs.push(loadImage(m.src).then((img) => { if (!cancelled) setSource(slot, img); }));
      });
      extraNames.forEach((n, i) => {
        const url = textures[n];
        if (!url) throw new Error(`gl-transition needs texture "${n}"`);
        jobs.push(loadImage(url).then((img) => {
          if (cancelled) return;
          uploadTexture(gl, tex[2 + i], 2 + i, img);
        }));
      });
      Promise.all(jobs).then(() => {
        draw();
        continueRender(initHandle);
      }).catch((e) => cancelRender(e));
      return () => {
        cancelled = true;
        p.dispose();
        tex.forEach((t) => gl.deleteTexture(t));
        state.current = null;
      };
    } catch (e) {
      cancelRender(e as Error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def, resizeMode, from.src, to.src]);

  // redraw every frame (progress / params changed)
  useLayoutEffect(() => {
    draw();
  });

  return (
    <AbsoluteFill style={style}>
      {[from, to].map((m, slot) =>
        m.kind === 'video' ? (
          <OffthreadVideo
            key={slot}
            src={m.src}
            startFrom={m.startFrom}
            muted
            onVideoFrame={slot === 0 ? onFromFrame : onToFrame}
            style={{position: 'absolute', width: 2, height: 2, opacity: 0, pointerEvents: 'none'}}
          />
        ) : null,
      )}
      <canvas ref={canvas} width={width} height={height} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
