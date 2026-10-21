import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
// Three.js needs a real GL backend in headless Chrome.
Config.setChromiumOpenGlRenderer('angle');
Config.setCodec('h264');
Config.setCrf(18);
