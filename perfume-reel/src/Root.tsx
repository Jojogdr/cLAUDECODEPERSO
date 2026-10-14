import {Composition} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/900.css';
import '@fontsource/playfair-display/600-italic.css';
import {Reel, FPS, DURATION} from './Reel';
import {ReelV2, DURATION_V2} from './ReelV2';
import {ReelV4, DURATION_V4} from './ReelV4';
import {ReelV5, DURATION_V5} from './ReelV5';
import {ReelV6, DURATION_V6} from './ReelV6';
import {ReelV7, DURATION_V7} from './ReelV7';
import {Reel as EngineReel} from './engine/Reel';
import type {Edl} from './engine/types';
import ebeneV7 from '../edl/ebene_v7.json';
import {GlPost} from './engine/GlPost';
import type {GlPostProps} from './engine/GlPost';

export const RemotionRoot = () => (
  <>
    <Composition id="EbeneFume" component={Reel} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="EbeneFumeV2" component={ReelV2} durationInFrames={Math.round(DURATION_V2 * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="EbeneFumeV4" component={ReelV4} durationInFrames={Math.round(DURATION_V4 * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="EbeneFumeV5" component={ReelV5} durationInFrames={Math.round(DURATION_V5 * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="EbeneFumeV6" component={ReelV6} durationInFrames={Math.round(DURATION_V6 * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="EbeneFumeV7" component={ReelV7} durationInFrames={Math.round(DURATION_V7 * FPS)} fps={FPS} width={1080} height={1920} />
    {/* Generic engine: render any EDL with --props='{"edl": ...}' (see edl/*.json) */}
    <Composition id="Reel" component={EngineReel} fps={30} width={1080} height={1920} durationInFrames={1}
      defaultProps={{edl: ebeneV7 as unknown as Edl}}
      calculateMetadata={({props}) => ({durationInFrames: Math.round(props.edl.duration * props.edl.fps), fps: props.edl.fps, width: props.edl.width, height: props.edl.height})} />
    {/* Pass 2: GL transitions over a clean render (scripts/render_reel.py) */}
    <Composition id="GlPost" component={GlPost} fps={30} width={1080} height={1920} durationInFrames={1}
      defaultProps={{video: '', framesDir: '', fps: 30, duration: 1, cuts: []} as GlPostProps}
      calculateMetadata={({props}) => ({durationInFrames: Math.round(props.duration * props.fps), fps: props.fps})} />
  </>
);
