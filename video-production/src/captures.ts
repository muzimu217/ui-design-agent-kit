// Live captures of the running project UI, taken with Playwright from output/*.html.
// Imported as modules (not staticFile) so the bundler inlines them deterministically.
import site from './assets/site.png';
import canvasIndex from './assets/canvas-index.png';
import miniDashboard from './assets/mini-dashboard.png';
import chain from './assets/chain.png';

export const CAPTURES = {site, canvasIndex, miniDashboard, chain};
