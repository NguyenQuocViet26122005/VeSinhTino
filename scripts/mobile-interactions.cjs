// Local native-touch profiling. CPU throttling does not emulate a weak phone GPU.
const { chromium } = require(process.env.TINO_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const label = process.argv[2] || 'current';
if (!/^[a-z0-9_-]{1,32}$/i.test(label)) throw new Error('Use a short filename label containing letters, digits, _ or -.');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-proxy-server'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.75, hasTouch: true, isMobile: true });
    await context.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:4394/') ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto('http://127.0.0.1:4394/');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.__mobile = { frames: [], longTasks: [] };
      const observer = new PerformanceObserver(list => window.__mobile.longTasks.push(...list.getEntries().map(e => e.duration)));
      observer.observe({ type: 'longtask' });
      window.__mobile.stop = () => observer.disconnect();
      let last = performance.now();
      const tick = now => { window.__mobile.frames.push(now - last); last = now; window.__mobile.raf = requestAnimationFrame(tick); };
      window.__mobile.raf = requestAnimationFrame(tick);
    });
    await cdp.send('Tracing.start', { categories: 'devtools.timeline,blink.user_timing', transferMode: 'ReturnAsStream' });
    const initialScroll = await page.evaluate(() => scrollY);
    for (let gesture = 0; gesture < 4; gesture++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 660 }] });
      for (let step = 1; step <= 20; step++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y: 660 - 520 * step / 20 }] });
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(160);
    }
    const scrolled = await page.evaluate(() => scrollY) - initialScroll;
    const carousel = page.locator('.showcase-grid');
    await carousel.scrollIntoViewIfNeeded();
    const box = await carousel.boundingBox();
    const carouselY = Math.max(140, Math.min(650, box.y + 150));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 280, y: carouselY }] });
    for (let i = 1; i <= 15; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 280 - 220 * i / 15, y: carouselY }] });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(300);
    const carouselOffset = await carousel.evaluate(el => el.scrollLeft);
    const quantity = page.locator('.qty-slider');
    await quantity.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector('.qty-slider')?.closest('astro-island')?.hasAttribute('ssr'));
    const range = await quantity.boundingBox();
    const quantityBefore = await quantity.evaluate(el => el.valueAsNumber);
    const rangeY = range.y + range.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: range.x + range.width * .15, y: rangeY }] });
    for (let i = 1; i <= 12; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: range.x + range.width * (.15 + .5 * i / 12), y: rangeY }] });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const quantityAfter = await quantity.evaluate(el => el.valueAsNumber);
    const rangeScrollStart = await page.evaluate(() => scrollY);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: range.x + range.width / 2, y: rangeY }] });
    for (let i = 1; i <= 12; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: range.x + range.width / 2, y: rangeY - 180 * i / 12 }] });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(250);
    const rangeVerticalScroll = await page.evaluate(() => scrollY) - rangeScrollStart;
    const glass = page.locator('.glass-touch');
    await glass.scrollIntoViewIfNeeded();
    await glass.press('Home');
    const pane = await glass.boundingBox();
    const y = pane.y + pane.height * .5;
    const start = pane.x + pane.width * .15;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start, y }] });
    for (let i = 1; i <= 20; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start + pane.width * .6 * i / 20, y }] });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(400);
    const wipe = Number(await glass.getAttribute('aria-valuenow'));
    await page.getByRole('button', { name: 'Mở menu', exact: true }).tap();
    const menuOpened = await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'true';
    await page.getByRole('button', { name: 'Đóng menu', exact: true }).tap();
    const frames = await page.evaluate(() => {
      cancelAnimationFrame(window.__mobile.raf); window.__mobile.stop();
      return { frames: window.__mobile.frames, longTasks: window.__mobile.longTasks };
    });
    const traceComplete = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
    await cdp.send('Tracing.end');
    const { stream } = await traceComplete;
    let raw = '';
    while (true) { const part = await cdp.send('IO.read', { handle: stream }); raw += part.data; if (part.eof) break; }
    await cdp.send('IO.close', { handle: stream });
    const trace = JSON.parse(raw), cost = {};
    for (const event of trace.traceEvents) if (event.ph === 'X' && ['Layout', 'UpdateLayoutTree', 'Paint', 'PrePaint', 'FunctionCall', 'HitTest'].includes(event.name)) cost[event.name] = (cost[event.name] || 0) + event.dur / 1000;
    const sorted = frames.frames.filter(v => v > 0).sort((a, b) => a - b);
    const result = { label, cpuSlowdown: 4, width: 390, scrolled, carouselOffset, quantityBefore, quantityAfter, rangeVerticalScroll, wipe, menuOpened, frames: sorted.length, frameP95Ms: sorted[Math.floor(sorted.length * .95)], framesOver50Ms: sorted.filter(v => v > 50).length, longTasksMs: frames.longTasks, costMs: cost, errors };
    fs.writeFileSync(`qa/mobile-interactions-${label}.json`, JSON.stringify(result, null, 2));
    fs.writeFileSync(`qa/mobile-interactions-${label}.trace.json`, raw);
    console.log(JSON.stringify(result, null, 2));
    assert.ok(scrolled > 1000, 'Native vertical touch scroll must move the document');
    assert.ok(carouselOffset > 50, 'Native horizontal swipe must move the photo track');
    assert.ok(quantityAfter > quantityBefore, 'Horizontal touch drag must change the native quantity slider');
    assert.ok(rangeVerticalScroll > 40, 'Vertical touch on the quantity slider must still scroll the page');
    assert.ok(wipe > 30 && wipe < 90, 'Touch dragging must update the wipe from zero');
    assert.equal(menuOpened, true);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
