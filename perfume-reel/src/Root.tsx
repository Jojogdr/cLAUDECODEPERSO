import {Composition} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/playfair-display/600-italic.css';
import {Reel, FPS, DURATION} from './Reel';

export const RemotionRoot = () => (
  <Composition id="EbeneFume" component={Reel} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
);
