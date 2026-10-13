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

export const RemotionRoot = () => (
  <>
    <Composition id="EbeneFume" component={Reel} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="EbeneFumeV2" component={ReelV2} durationInFrames={Math.round(DURATION_V2 * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="EbeneFumeV4" component={ReelV4} durationInFrames={Math.round(DURATION_V4 * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
