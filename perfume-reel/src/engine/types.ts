/* =====================================================================
   Edit Decision List (EDL) — everything a reel needs, as plain JSON.
   One generic composition (src/engine/Reel.tsx) renders any EDL, so a new
   video = a new EDL file (written by Claude from the transcript) + assets.
   All times are OUTPUT seconds. Positions are in the 1080x1920 frame.
   ===================================================================== */

export type Word = {w: string; s: number; e: number};

/** [time, targetScale, duration]. duration < 0.05 = hard cut, ≤ 0.2 = snap (punch), longer = smooth push/pull. */
export type CamKey = [number, number, number];

export type Media = {
  src: string;              // path under public/
  video?: boolean;
  offset?: number;          // seconds into the source video
  pos?: string;             // CSS object-position
  zoom?: [number, number];  // scale at scene start → end
  filter?: string;          // CSS filter (e.g. 'saturate(0.8) brightness(0.9)')
  width?: number;           // optional explicit size for oversize framing (e.g. 1920 for a square photo)
  left?: number;
};

/** Centred emphasis block: small lead-in + HEAVY word, or small + serif accent + small. */
export type Block = {
  from: number; to: number; y?: number; dark?: boolean;
  top?: string; topAt?: number;
  main: string; mainAt: number; kind: 'heavy' | 'serif'; color?: string; strikeAt?: number;
  bottom?: string; bottomAt?: number;
  anim?: 'pop' | 'slam' | 'mask' | 'type';   // text animation preset (default pop for heavy, rise for serif)
};

export type WallText = {text: string; at: number; kind: 'heavy' | 'serif' | 'small'; color?: string; until?: number; strikeAt?: number};
/** Wall-only replacement: new background + words BEHIND her, under a wall-only cut-out clip (scripts/rvm_wall.py). */
export type Wall = {
  from: number; to: number; clip: string; clipFrom: number;
  bg?: Media & {css?: string; dark?: number};
  texts: WallText[]; top?: number;
  captions?: boolean;          // keep the word captions on while this wall is up
  enter?: 'fade' | 'scan';     // scan = the new background wipes down behind a light line
  fadeIn?: number; fadeOut?: number;  // seconds (0.001 = hard join with the next wall)
};

export type Tag = {text: string; at: number; x: number; y: number; light?: boolean};
export type Card = {at: number; x: number; y: number; image: string; pos?: string; size?: string; label: string; rot?: number};

export type TransitionName =
  | 'cut' | 'up' | 'zoom' | 'whip' | 'whipLeft' | 'zoomBlur' | 'flashCut' | 'luma' | 'glitch' | 'iris' | 'push';

type SceneBase = {from: number; to: number; enter: TransitionName; exit?: TransitionName; sweepAt?: number; tags?: Tag[]; captions?: boolean};
export type Scene =
  | (SceneBase & {kind: 'title'; image: string; brand: string; brandAt: number; name: string; nameAt: number; paper?: boolean})
  | (SceneBase & {kind: 'media'; media: Media; dark?: number; shade?: [number, number]; punches?: number[]; blocks?: Block[]; hud?: boolean})
  | (SceneBase & {kind: 'cards'; media: Media; dark?: number; blocks?: Block[]; cards: Card[]})
  | (SceneBase & {kind: 'end'; image: string; blocks?: Block[]; pill?: {text: string; at: number}})
  | (SceneBase & {kind: 'paper'; tone?: 'light' | 'dark'});

export type Overlay =
  | {kind: 'flash'; at: number; dur?: number; color?: string}
  | {kind: 'leak'; from: number; to: number; intensity?: number; hue?: number}      // light leak
  | {kind: 'grain'; from: number; to: number; amount?: number}                    // film grain
  | {kind: 'video'; from: number; to: number; media: Media; blend?: string; opacity?: number};

export type SfxCue = [string, number, number, 'start' | 'peak' | 'end'];          // [file under sfx root, time, rel dB vs voice, align]

export type Theme = {
  ink: string; gold: string; goldLight: string; paper: string;
  sans: string; serif: string;
  mono?: string;               // labels / references (fiche)
  captionStyle?: 'classic' | 'yass';  // yass = word rise, emphasised words in serif italic, no punctuation
  captionY: number;            // centre line for captions/blocks
  captionSize: number;
};

export type Edl = {
  id: string;
  fps: number; width: number; height: number; duration: number;
  theme: Theme;
  base: {src: string; origin?: string};
  voice: string;
  sfxStem?: string;
  music?: {src: string; offset: number; db: number; fadeIn?: number; fadeOut?: number};
  words: Word[];
  camera: CamKey[];
  walls: Wall[];
  blocks: Block[];
  scenes: Scene[];
  overlays: Overlay[];
  sfx?: SfxCue[];              // consumed by scripts/mix_sfx.py → sfxStem
  /* design layer */
  types?: TypeComp[];
  cards?: FloatCard[];
  sheet?: Sheet;
  captionEmph?: string[];      // words shown in serif italic in yass captions
  grade?: string;              // ffmpeg -vf chain applied at the finish step (look / colour)
  fx?: Fx[];                   // punch layer: one literal visual per punchline (src/engine/Fx.tsx)
};

/* =====================================================================
   Design layer: typographic compositions, floating cards, product sheet.
   ===================================================================== */
export type TextAnim = 'rise' | 'blur' | 'track' | 'slam' | 'type' | 'none';
export type Line = {
  text: string; at: number;
  font?: 'sans' | 'serif' | 'mono' | 'caps';
  size?: number; weight?: number; color?: string; tracking?: number;
  anim?: TextAnim; stagger?: number; dur?: number;
  dx?: number; dy?: number;
  underlineAt?: number;        // hand-drawn underline that draws itself
  rule?: number;               // instead of text: a hairline of this width that grows
};
export type TypeComp = {
  from: number; to: number; y: number; x?: number; align?: 'center' | 'left';
  lines: Line[]; gap?: number; behind?: boolean; exit?: 'blur' | 'up' | 'cut'; shadow?: boolean; scrim?: boolean;
};
export type CardFace = {label?: string; title: string; titleFont?: 'serif' | 'sans' | 'caps'; sub?: string; dark?: boolean};
export type FloatCard = CardFace & {
  from: number; to: number; at: number; x: number; y: number; w: number; rot?: number;
  image?: string; imagePos?: string; imageH?: number;
  behind?: boolean; flipAt?: number; back?: CardFace;
  enter?: 'rise' | 'left' | 'right' | 'pop'; parallax?: number;
};
export type Sheet = {
  from: number; to: number; at: number; image: string; imagePos?: string; label: string;
  rows: [string, string][]; rowsAt: number; rowGap?: number; top?: number;
  pill?: {text: string; at: number};
};

/* =====================================================================
   Punch layer (src/engine/Fx.tsx)
   ===================================================================== */
export type Fx =
  | {kind: 'brand'; from: number; to: number; label: string; mark: string; color?: string; accent?: string}
  | {kind: 'badge'; from: number; to: number; x: number; y: number; size?: number; ring?: string; bg?: string; color?: string;
     image?: string; pos?: string; video?: string; offset?: number; icon?: 'moustache' | 'lips' | 'flame' | 'drop'; text?: string}
  | {kind: 'notifs'; from: number; to: number; y?: number; clock?: string; date?: string; items: {at: number; title: string; text: string; time?: string; app?: 'messages' | 'whatsapp'}[]}
  | {kind: 'gauge'; from: number; to: number; y: number; label: string; fillFrom: number; fillTo: number; steps?: number; accent?: string}
  | {kind: 'fingerprint'; from: number; to: number; y?: number; size?: number; color?: string}
  | {kind: 'burst'; from: number; to: number; at: number; x: number; y: number; color?: string}
  | {kind: 'scan'; from: number; to: number; at: number; dur?: number; color?: string}
  | {kind: 'endcard'; from: number; to: number; image: string; pos?: string; title: string; name: string; pill: string; cta: string; small?: string;
     accent?: string; pillAt?: number; ctaAt?: number};
