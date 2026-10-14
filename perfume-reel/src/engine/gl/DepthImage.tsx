import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useDelayRender} from 'remotion';
import {GlProgram, getGl, loadImage, makeProgram, makeTexture, setUniform, sourceSize, uploadTexture} from './glcore';

/* ------------------------------------------------------------------------------------------
   <DepthImage> — "3D photo": a still image + its depth map (scripts/depth.py) rendered with
   steep parallax mapping, so a camera move (off) reveals real depth: the bottle slides over
   the background, edges occlude correctly. Optional glint: a light band that only catches
   near surfaces (depth-weighted), i.e. it slides over the product, not the backdrop.
   ------------------------------------------------------------------------------------------ */

const FRAG = `precision highp float;
varying vec2 _uv;
uniform sampler2D img, dep;
uniform vec2 res, isz, pos, off;
uniform float zoom, focus, glint, glintAmt, expo;
vec2 cover(vec2 uv){
  float ca = res.x/res.y, ia = isz.x/isz.y;
  vec2 f = vec2(1.0);
  if (ia > ca) f.x = ca/ia; else f.y = ia/ca;
  vec2 st = vec2(pos.x*(1.0-f.x), (1.0-pos.y)*(1.0-f.y));
  vec2 c = st + 0.5*f;
  return c + (st + uv*f - c)/zoom;
}
void main(){
  vec2 x = cover(_uv);
  const int N = 40;
  vec2 prevS = x - off*(1.0-focus);
  float prevL = 1.0;
  float prevD = texture2D(dep, prevS).r;
  vec2 hit = prevS;
  if (prevD < 1.0) {
    for (int i = 1; i <= N; i++) {
      float L = 1.0 - float(i)/float(N);
      vec2 cs = x - off*(L - focus);
      float d = texture2D(dep, cs).r;
      if (d >= L) {
        float a = prevD - prevL, b = d - L;
        hit = mix(prevS, cs, clamp(a/(a-b), 0.0, 1.0));
        break;
      }
      prevL = L; prevS = cs; prevD = d;
    }
  }
  vec3 col = texture2D(img, hit).rgb * expo;
  if (glintAmt > 0.0) {
    float dd = texture2D(dep, hit).r;
    float band = exp(-pow((_uv.x + (1.0-_uv.y)*0.55 - glint)/0.07, 2.0));
    col += band * smoothstep(0.45, 0.85, dd) * glintAmt * vec3(1.0, 0.9, 0.75);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

export type DepthImageProps = {
  src: string;            // staticFile() url of the image
  depth: string;          // staticFile() url of the depth map (white = near)
  width: number;          // canvas resolution (CSS size is 100% of the parent)
  height: number;
  pos?: [number, number]; // object-position, 0..1 (x from left, y from top)
  zoom?: number;
  off?: [number, number]; // parallax camera offset in image-uv units (≈ ±0.02..0.05)
  focus?: number;         // depth plane that stays still (0 far .. 1 near)
  glint?: number;         // light band position (−0.3 .. 1.9 sweeps across)
  glintAmt?: number;
  expo?: number;          // exposure multiplier
  style?: React.CSSProperties;
};

export const DepthImage: React.FC<DepthImageProps> = (props) => {
  const {src, depth, width, height, style} = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef<{p: GlProgram; size: [number, number]; ready: boolean} | null>(null);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender('DepthImage ' + src));
  const latest = useRef(props);
  latest.current = props;

  const draw = () => {
    const s = st.current;
    if (!s || !s.ready) return;
    const {p} = s;
    const {gl} = p;
    const L = latest.current;
    gl.useProgram(p.prog);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    setUniform(p, 'res', 'vec2', [width, height]);
    setUniform(p, 'isz', 'vec2', s.size);
    setUniform(p, 'pos', 'vec2', L.pos ?? [0.5, 0.5]);
    setUniform(p, 'off', 'vec2', L.off ?? [0, 0]);
    setUniform(p, 'zoom', 'float', L.zoom ?? 1);
    setUniform(p, 'focus', 'float', L.focus ?? 0.5);
    setUniform(p, 'glint', 'float', L.glint ?? -1);
    setUniform(p, 'glintAmt', 'float', L.glintAmt ?? 0);
    setUniform(p, 'expo', 'float', L.expo ?? 1);
    gl.uniform1i(p.uniformLoc('img'), 0);
    gl.uniform1i(p.uniformLoc('dep'), 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  useEffect(() => {
    let cancelled = false;
    try {
      const gl = getGl(canvas.current!);
      const p = makeProgram(gl, FRAG);
      const t0 = makeTexture(gl), t1 = makeTexture(gl);
      st.current = {p, size: [1, 1], ready: false};
      Promise.all([loadImage(src), loadImage(depth)]).then(([im, dm]) => {
        if (cancelled) return;
        uploadTexture(gl, t0, 0, im);
        uploadTexture(gl, t1, 1, dm);
        st.current!.size = sourceSize(im);
        st.current!.ready = true;
        draw();
        continueRender(handle);
      }).catch((e) => cancelRender(e));
      return () => {
        cancelled = true;
        p.dispose();
        gl.deleteTexture(t0);
        gl.deleteTexture(t1);
        st.current = null;
      };
    } catch (e) {
      cancelRender(e as Error);
    }
  }, [src, depth]);

  useLayoutEffect(() => {
    draw();
  });

  return <canvas ref={canvas} width={width} height={height} style={{width: '100%', height: '100%', display: 'block', ...style}} />;
};
