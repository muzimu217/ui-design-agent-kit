// Run with Playwright browser_run_code_unsafe.filename while viewing the showcase.
// This browser check is separate from the Node publication-boundary test suite.
async (page) => {
  const target = await page.evaluate(() => {
    const base = location.pathname.split('/demos/')[0].replace(/\/$/, '');
    return `${location.origin}${base}/demos/subway-runner/`;
  });
  const context = await page.context().browser().newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  let releaseTextures;
  const textureGate = new Promise((resolve) => { releaseTextures = resolve; });
  let failTextures = true;
  try {
    const mobile = await context.newPage();
    await context.route('**/models/skins/*.png', async (route) => {
      await textureGate;
      if (failTextures) await route.abort('failed');
      else await route.continue();
    });
    const textureRequest = mobile.waitForRequest((request) => request.url().includes('/models/skins/'));
    await mobile.goto(target, { waitUntil: 'domcontentloaded' });
    await textureRequest;
    const pending = await mobile.evaluate(() => ({
      actorsReady: window.__subway.actorsReady,
      phase: window.__subway.phase,
      disabled: document.getElementById('btn-start').disabled,
    }));
    if (pending.actorsReady || !pending.disabled || pending.phase !== 'title') {
      throw new Error('Gameplay became available before its skin textures loaded');
    }
    releaseTextures();
    const retry = mobile.getByRole('button', { name: '重试加载', exact: true });
    await retry.waitFor();
    if (await mobile.evaluate(() => window.__subway.actorsReady)) {
      throw new Error('A failed texture request was marked ready');
    }
    failTextures = false;
    await retry.tap();
    const start = mobile.getByRole('button', { name: '开始奔跑', exact: true });
    await start.waitFor();
    const loaded = await mobile.evaluate(() => {
      const textures = new Set();
      window.__three.env.scene.traverse((object) => {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) if (material?.map) textures.add(material.map);
      });
      return {
        ready: window.__subway.actorsReady,
        textures: textures.size,
        complete: [...textures].every((texture) => texture.image?.width > 0),
      };
    });
    if (!loaded.ready || !loaded.complete || loaded.textures < 2) {
      throw new Error('Retry completed without decoded skin textures');
    }
    await start.tap();
    const cdp = await context.newCDPSession(mobile);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 170, y: 470, id: 0 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 270, y: 470, id: 0 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const lane = await mobile.evaluate(() => window.__subway.lane);
    if (lane !== 1) throw new Error('Touch swipe did not change the active lane');
    await mobile.keyboard.press('Escape');
    const phase = await mobile.evaluate(() => window.__subway.phase);
    if (phase !== 'paused') throw new Error('Pause failed after asset recovery');
    return { target, pending, failureRetry: 'passed', loaded, touchLane: lane, phase };
  } finally {
    releaseTextures();
    await context.close();
  }
}
