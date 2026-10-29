// Bounded local rendering check. No real Telegram or Analytics requests.
const { chromium } = require(process.env.TINO_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => v / 255)
  .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);

(async () => {
  const root = path.resolve('dist');
  fs.mkdirSync('qa', { recursive: true });
  const base = 'http://127.0.0.1:4392';
  const headers = JSON.parse(fs.readFileSync('vercel.json', 'utf8')).headers[0].headers;
  const server = http.createServer((req, res) => {
    let file = path.resolve(root, '.' + new URL(req.url, base).pathname);
    if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(404); res.end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    for (const { key, value } of headers) if (key !== 'Content-Security-Policy') res.setHeader(key, value);
    // Local HTTP is intentionally not upgraded to HTTPS by the production CSP.
    res.setHeader('Content-Security-Policy', "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
    res.setHeader('Content-Type', { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(4392, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-proxy-server'] });
  const errors = [], results = [];
  try {
    const context = await browser.newContext();
    await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__spotlightReads = 0;
      const original = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function () {
        if (this.classList.contains('spotlight-card')) window.__spotlightReads++;
        return original.call(this);
      };
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      await page.goto(base + '/');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1600);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const photo = await page.locator('.window-photo').evaluate(img => ({ source: img.currentSrc, width: img.naturalWidth, loaded: img.complete && img.naturalWidth > 0, loading: img.loading, priority: img.fetchPriority }));
      assert.equal(photo.loaded, true);
      assert.ok(photo.source.includes('/_astro/'));
      assert.equal(photo.loading, 'eager');
      assert.equal(photo.priority, 'high');
      const logo = await page.locator('.brand > img').evaluate(img => img.currentSrc);
      assert.ok(logo.includes('/_astro/'));
      await page.screenshot({ path: `qa/performance-home-${width}.png` });
      const glass = page.locator('.glass-touch');
      await glass.press('End');
      assert.equal(await glass.getAttribute('aria-valuenow'), '100');
      await glass.press('Home');
      assert.equal(await glass.getAttribute('aria-valuenow'), '0');
      await glass.scrollIntoViewIfNeeded();
      const rect = await glass.boundingBox();
      await page.mouse.move(rect.x + rect.width * .2, rect.y + rect.height * .5);
      await page.mouse.down();
      await page.mouse.move(rect.x + rect.width * .65, rect.y + rect.height * .5, { steps: 12 });
      await page.mouse.up();
      await page.waitForTimeout(450);
      const wipe = Number(await glass.getAttribute('aria-valuenow'));
      assert.ok(wipe >= 35 && wipe <= 100, String(wipe));
      if (width === 1440) {
        const card = page.locator('.trust-card').first();
        await card.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        const box = await card.boundingBox();
        const readsBefore = await page.evaluate(() => window.__spotlightReads);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
        await page.waitForTimeout(600);
        assert.ok(Number(await card.locator('.spotlight-card__light').evaluate(el => getComputedStyle(el).opacity)) > 0);
        const reads = await page.evaluate(() => window.__spotlightReads) - readsBefore;
        assert.ok(reads <= 4, `Unexpected repeated spotlight measurements: ${reads}`);
        const link = page.locator('.floating-zalo');
        await link.hover();
        await page.waitForTimeout(350);
        assert.notEqual(await link.locator('..').evaluate(el => getComputedStyle(el).transform), 'none');
        const glare = page.locator('.showcase-glare-wrap').first();
        await glare.scrollIntoViewIfNeeded();
        await page.mouse.move(5, 5);
        await page.waitForTimeout(900);
        const band = glare.locator('.glare-hover__band').first();
        const before = await band.evaluate(el => el.style.transform);
        await glare.hover();
        await page.waitForTimeout(220);
        assert.notEqual(await band.evaluate(el => el.style.transform), before);
        await page.locator('.showcase-media').first().click();
        assert.ok((await page.locator('.showcase-modal-img').getAttribute('src')).startsWith('/images/'));
        await page.getByRole('button', { name: 'Đóng hộp thoại', exact: true }).click();
        results.push({ spotlightEffect: true, magnetEffect: true, glareEffect: true, spotlightGeometryReadsDuringHover: reads });
      }
      const preview = page.locator('.explorer-img');
      await preview.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const island = document.querySelector('.explorer-img')?.closest('astro-island');
        return island && !island.hasAttribute('ssr');
      });
      await page.getByRole('tab', { name: /Chung cư trọn gói/ }).click();
      assert.ok((await preview.getAttribute('src')).includes('/_astro/ve-sinh-chung-cu.'));
      assert.ok((await preview.getAttribute('srcset')).includes('480w'));
      const gallery = page.locator('.showcase-img').first();
      await gallery.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      const images = await gallery.evaluate(img => ({ source: img.currentSrc, candidates: img.srcset, loaded: img.complete && img.naturalWidth > 0 }));
      assert.equal(images.loaded, true);
      assert.ok(images.source.includes('/_astro/'));
      assert.ok(images.candidates.includes('480w'));
      await page.screenshot({ path: `qa/performance-gallery-${width}.png` });
      await page.locator('.showcase-tabs').getByRole('tab', { name: 'Kính cao ốc', exact: true }).click();
      assert.equal(await page.locator('.showcase-img').count(), 2);
      assert.ok((await page.locator('.showcase-img').first().getAttribute('srcset')).includes('480w'));
      await page.locator('.footer-bottom').scrollIntoViewIfNeeded();
      const contrastStyles = await page.evaluate(() => ['.explorer-tab:not(.is-active) .tab-number', '.form-disclaimer', '.faq-section .text-link', '.footer-bottom > span', '.footer-bottom > a'].map(selector => {
        const el = document.querySelector(selector), style = getComputedStyle(el);
        let ancestor = el, background = style.backgroundColor;
        while (ancestor && background === 'rgba(0, 0, 0, 0)') { ancestor = ancestor.parentElement; if (ancestor) background = getComputedStyle(ancestor).backgroundColor; }
        return { selector, color: style.color, background, opacity: style.opacity };
      }));
      for (const style of contrastStyles) {
        const a = luminance(style.color), b = luminance(style.background);
        style.ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
        assert.ok(style.ratio >= 4.5, `${style.selector}: ${style.ratio}`);
        assert.equal(style.opacity, '1');
      }
      await page.screenshot({ path: `qa/performance-footer-${width}.png` });
      await page.goto(base + '/gioi-thieu/');
      await page.locator('.about-teaser').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1800);
      const layout = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, h1: document.querySelectorAll('h1').length }));
      assert.equal(layout.overflow, false);
      assert.equal(layout.h1, 1);
      await page.screenshot({ path: `qa/performance-about-${width}.png` });
      if (width <= 390) {
        await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
        await page.locator('#mobile-nav').getByRole('link', { name: 'Trang chủ', exact: true }).click();
        await page.waitForURL(base + '/');
        await page.waitForTimeout(700);
        await page.locator('.glass-touch').press('End');
        assert.equal(await page.locator('.glass-touch').getAttribute('aria-valuenow'), '100');
      }
      results.push({ width, cpuSlowdown: 4, photo, wipe, images, contrastStyles, ...layout });
    }
    for (const dpr of [1.75, 3]) {
      const mobileContext = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: dpr });
      await mobileContext.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
      const mobile = await mobileContext.newPage();
      mobile.on('pageerror', error => errors.push(error.message));
      await mobile.goto(base + '/');
      await mobile.locator('.window-photo').evaluate(img => img.decode());
      const hero = await mobile.locator('.window-photo').evaluate(img => ({ source: img.currentSrc, renderedWidth: img.clientWidth, loaded: img.complete }));
      assert.ok(hero.source.includes('/_astro/'));
      const bytes = fs.statSync(path.resolve(root, '.' + new URL(hero.source).pathname)).size;
      results.push({ dpr, hero: { ...hero, bytes } });
      await mobileContext.close();
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(base + '/');
    await page.locator('.glass-touch').press('End');
    assert.equal(await page.locator('.glass-touch').getAttribute('aria-valuenow'), '100');
    assert.deepEqual(errors, []);
    fs.writeFileSync('qa/performance-browser.json', JSON.stringify({ passed: true, results, errors }, null, 2));
    console.log(JSON.stringify({ passed: true, results, errors }, null, 2));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
