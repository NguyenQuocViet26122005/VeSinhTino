// Loading/UX regression checks against a local build only. No real messages are sent.
const { chromium } = require(process.env.TINO_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:4394';
const reactRuntime = url => /\/(?:client|react|jsx-runtime)\.[^/]+\.js$/.test(url);
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-proxy-server'] });
  const results = [], errors = [];
  try {
    for (const variant of (process.argv[2] ? [process.argv[2]] : ['mobile', 'desktop', 'desktop-retina', 'webp-fallback', 'no-js'])) {
      assert.ok(['mobile', 'desktop', 'desktop-retina', 'webp-fallback', 'no-js'].includes(variant));
      const desktop = variant.startsWith('desktop');
      const context = await browser.newContext({ viewport: { width: desktop ? 1440 : 390, height: desktop ? 900 : 844 }, deviceScaleFactor: desktop ? (variant === 'desktop-retina' ? 3 : 1) : 1.75, hasTouch: !desktop, isMobile: !desktop, javaScriptEnabled: variant !== 'no-js' });
      await context.route('**/*', async route => {
        if (!route.request().url().startsWith(base + '/')) return route.abort();
        if (variant === 'webp-fallback' && route.request().resourceType() === 'document') {
          const response = await route.fetch();
          // Exercise the fallback branch as if the browser did not support AVIF.
          return route.fulfill({ response, body: (await response.text()).replaceAll('type="image/avif"', 'type="image/x-unsupported-test"') });
        }
        return route.continue();
      });
      const page = await context.newPage(), scripts = new Set(), photos = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', req => { if (req.resourceType() === 'script') scripts.add(req.url()); });
      page.on('response', response => { if (/\/_astro\/023091033e9c8b53\./.test(response.url())) photos.push(response.url()); });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.goto(base + '/');
      await page.locator('.window-photo').evaluate(img => img.decode());
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1600);
      assert.equal([...scripts].some(reactRuntime), false, 'Top viewport must not load React for floating links');
      const source = await page.locator('.window-photo').evaluate(img => img.currentSrc);
      assert.ok(source.endsWith(variant === 'webp-fallback' ? '.webp' : '.avif'), source);
      assert.equal(new Set(photos).size, 1, 'Load one hero candidate, without downloading both formats');
      const zalo = page.locator('.floating-zalo'), phone = page.locator('.floating-phone');
      assert.equal(await zalo.isVisible(), true);
      assert.equal(await phone.isVisible(), true);
      assert.ok((await zalo.getAttribute('href')).startsWith('https://zalo.me/'));
      assert.ok((await phone.getAttribute('href')).startsWith('tel:'));
      if (desktop) {
        const wrapper = page.locator('[data-contact-magnet]').first();
        const rect = await zalo.boundingBox();
        await page.mouse.move(rect.x + rect.width * .7, rect.y + rect.height * .5);
        await page.waitForTimeout(400);
        assert.equal(await wrapper.getAttribute('data-magnet-active'), '');
        assert.equal(await page.locator('[data-contact-magnet][data-magnet-active]').count(), 1);
        assert.notEqual(await wrapper.locator(':scope > div').evaluate(el => getComputedStyle(el).transform), 'none');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => matchMedia('(prefers-reduced-motion: reduce)').matches && !document.querySelector('[data-contact-magnet]')?.hasAttribute('data-magnet-active'), null, { timeout: 5000 });
        assert.equal(await wrapper.getAttribute('data-magnet-active'), null);
        assert.equal(await wrapper.locator(':scope > div').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).isIdentity), true);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.mouse.move(5, 5);
        await page.waitForTimeout(120);
      }
      if (variant === 'mobile' || desktop) {
        await page.locator('.explorer-img').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => !document.querySelector('.explorer-img')?.closest('astro-island')?.hasAttribute('ssr'));
        await page.getByRole('tab', { name: /Chung cư trọn gói/ }).click();
        assert.ok((await page.locator('.explorer-img').getAttribute('src')).includes('ve-sinh-chung-cu'));
        assert.equal([...scripts].some(reactRuntime), true, 'Interactive React sections must still hydrate when needed');
        await page.evaluate(() => document.querySelector('.brand').click());
        await page.waitForURL(base + '/');
        // Repeated route changes must leave exactly two working contact controllers.
        for (let step = 0; step < 2; step++) {
          const next = base + '/gioi-thieu/';
          await page.evaluate(() => document.querySelector('.footer a[href="/gioi-thieu/"]').click());
          await page.waitForURL(next);
          assert.equal(await page.locator('[data-contact-magnet]').count(), 2);
          assert.equal(await page.evaluate(() => document.head.textContent.includes('.recruit-panel')), true, 'Interior CSS must arrive on navigation');
          await page.locator('.brand').click();
          await page.waitForURL(base + '/');
          assert.equal(await page.evaluate(() => document.head.textContent.includes('.recruit-panel')), false, 'Homepage must not retain interior CSS after navigation');
          await page.locator('.glass-touch').press('End');
          assert.equal(await page.locator('.glass-touch').getAttribute('aria-valuenow'), '100');
        }
      }
      results.push({ variant, source, initialHeroRequests: new Set(photos).size, linksPresent: true });
      await context.close();
    }
    assert.deepEqual(errors, []);
    fs.mkdirSync('qa', { recursive: true });
    fs.writeFileSync('qa/loading-browser.json', JSON.stringify({ passed: true, results, errors }, null, 2));
    console.log(JSON.stringify({ passed: true, results, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
