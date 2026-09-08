// Run with Playwright browser_run_code_unsafe.filename while viewing the showcase.
async (page) => {
  const target = await page.evaluate(() => {
    const base = location.pathname.split('/demos/')[0].replace(/\/$/, '');
    return `${location.origin}${base}/demos/nodegrid/`;
  });
  const results = [];
  for (const [width, height] of [[375, 812], [390, 844], [768, 1024], [1440, 900]]) {
    const context = await page.context().browser().newContext({
      viewport: { width, height },
      reducedMotion: 'reduce',
      ignoreHTTPSErrors: false,
    });
    try {
      const check = await context.newPage();
      await check.goto(target);
      await check.waitForFunction(() => window.__nodegrid?.globeReady);
      await check.waitForFunction(() => {
        const canvas = document.querySelector('.globe-wrap canvas');
        const host = document.querySelector('.hero-globe');
        if (!canvas || !host) return false;
        return Math.abs(canvas.getBoundingClientRect().width - host.getBoundingClientRect().width) < 1;
      });
      const measured = await check.evaluate(() => {
        const canvas = document.querySelector('.globe-wrap canvas').getBoundingClientRect();
        return {
          viewport: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          canvasLeft: canvas.left,
          canvasRight: canvas.right,
          canvasWidth: canvas.width,
          nodeCount: window.__nodegrid.nodeCount,
        };
      });
      if (measured.scrollWidth > width || measured.canvasLeft < 0 || measured.canvasRight > width + 1) {
        throw new Error(`Canvas is clipped at ${width}px: ${JSON.stringify(measured)}`);
      }
      results.push(measured);
    } finally {
      await context.close();
    }
  }
  return { target, results };
}
