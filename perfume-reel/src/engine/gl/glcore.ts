// Minimal, dependency-free WebGL1 helpers for Remotion (works under SwiftShader / ANGLE).
// One full-screen triangle, a fragment shader, N textures, typed uniforms.

export type UniformValue = number | boolean | number[];
export type TexSource = TexImageSource; // HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap ...

export const VERT = `attribute vec2 _p;
varying vec2 _uv;
void main(){ gl_Position = vec4(_p,0.0,1.0); _uv = 0.5*(_p+1.0); }`;

export type GlProgram = {
  gl: WebGLRenderingContext;
  prog: WebGLProgram;
  uniformLoc: (name: string) => WebGLUniformLocation | null;
  dispose: () => void;
};

export const getGl = (canvas: HTMLCanvasElement): WebGLRenderingContext => {
  const gl = canvas.getContext('webgl', {
    preserveDrawingBuffer: true, // REQUIRED: Remotion screenshots after our draw call
    premultipliedAlpha: false,
    alpha: true,
    antialias: false,
  }) as WebGLRenderingContext | null;
  if (!gl) throw new Error('WebGL unavailable in this Chromium (try --gl=swangle or --gl=angle)');
  return gl;
};

export const glInfo = (gl: WebGLRenderingContext) => {
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    renderer: ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER)),
    vendor: ext ? String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)) : String(gl.getParameter(gl.VENDOR)),
    version: String(gl.getParameter(gl.VERSION)),
    maxTex: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)),
  };
};

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error('Shader compile error: ' + log + '\n' + src.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n'));
  }
  return s;
};

export const makeProgram = (gl: WebGLRenderingContext, frag: string): GlProgram => {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('Link error: ' + gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  // one big triangle covering the viewport
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 4, -1, -1, 4]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, '_p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    gl,
    prog,
    uniformLoc: (n) => {
      if (!cache.has(n)) cache.set(n, gl.getUniformLocation(prog, n));
      return cache.get(n)!;
    },
    dispose: () => {
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    },
  };
};

export const setUniform = (p: GlProgram, name: string, type: string, v: UniformValue) => {
  const {gl} = p;
  const l = p.uniformLoc(name);
  if (l === null) return; // optimized away
  const a = Array.isArray(v) ? v : [Number(v)];
  switch (type) {
    case 'float': gl.uniform1f(l, a[0]); break;
    case 'int': case 'bool': gl.uniform1i(l, Number(a[0])); break;
    case 'vec2': gl.uniform2f(l, a[0], a[1]); break;
    case 'vec3': gl.uniform3f(l, a[0], a[1], a[2]); break;
    case 'vec4': gl.uniform4f(l, a[0], a[1], a[2], a[3]); break;
    case 'ivec2': gl.uniform2i(l, a[0], a[1]); break;
    case 'ivec3': gl.uniform3i(l, a[0], a[1], a[2]); break;
    case 'ivec4': gl.uniform4i(l, a[0], a[1], a[2], a[3]); break;
    default: throw new Error('Unsupported uniform type ' + type);
  }
};

export const makeTexture = (gl: WebGLRenderingContext) => {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // NPOT-safe in WebGL1
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
};

export const uploadTexture = (gl: WebGLRenderingContext, tex: WebGLTexture, unit: number, src: TexSource) => {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // image top = uv.y 1.0 (GL convention used by gl-transitions)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
};

export const sourceSize = (s: TexSource): [number, number] => {
  const a = s as any;
  return [a.naturalWidth || a.videoWidth || a.displayWidth || a.width, a.naturalHeight || a.videoHeight || a.displayHeight || a.height];
};

export const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('Failed to load ' + src));
    i.src = src;
  });
