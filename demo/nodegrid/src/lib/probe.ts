// ============================================================
// 门E 探针：window.__nodegrid = { globeReady, mapReady, nodeCount, visibleLabels }
// ============================================================

import { NODES } from '../data/nodes';

export interface NodegridProbe {
  globeReady: boolean;
  mapReady: boolean;
  nodeCount: number;
  visibleLabels: number;
}

export const probe: NodegridProbe = {
  globeReady: false,
  mapReady: false,
  nodeCount: NODES.length,
  visibleLabels: 0,
};

declare global {
  interface Window {
    __nodegrid?: NodegridProbe;
  }
}

if (typeof window !== 'undefined') {
  window.__nodegrid = probe;
}
