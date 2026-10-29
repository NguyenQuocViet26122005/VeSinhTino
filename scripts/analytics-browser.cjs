// Runs entirely on intercepted responses from dist; never sends real Analytics events.
const { chromium } = require(process.env.TINO_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
    args: ['--no-proxy-server']
  });
  const root = path.resolve('dist');
  let tagLoads = 0;
  let existingTag = false;
  const errors = [];
  try {
    const context = await browser.newContext();
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'www.googletagmanager.com') {
        tagLoads++;
        return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* mock gtag */' });
      }
      if (!['vesinhtino.com', 'preview.vercel.app', 'localhost'].includes(url.hostname)) return route.abort();
      let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
      const type = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2' }[path.extname(file)] || 'application/octet-stream';
      let body = fs.readFileSync(file);
      if (type === 'text/html') {
        let html = body.toString();
        assert.match(html, /name="tino-ga-id" content="G-824Z7LYPZ5"/);
        html = html.replace('content="G-824Z7LYPZ5"', 'content="G-TESTONLY123"');
        if (existingTag) html = html.replace('</head>', '<script async src="https://www.googletagmanager.com/gtag/js?id=AW-TESTONLY"></script></head>');
        body = Buffer.from(html);
      }
      await route.fulfill({ status: 200, contentType: type, body });
    });
    const page = await context.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', error => errors.push(error.message));
    const views = () => page.evaluate(() => (window.dataLayer || []).filter(item => item[0] === 'event' && item[1] === 'page_view').map(item => item[2]));
    await page.goto('https://vesinhtino.com/?private=test#secret');
    await page.waitForFunction(() => (window.dataLayer || []).some(item => item[1] === 'page_view'));
    assert.equal((await views()).length, 1);
    assert.equal((await views())[0].page_location, 'https://vesinhtino.com/');
    assert.equal((await views())[0].send_to, 'G-TESTONLY123');
    assert.equal(await page.evaluate(() => location.search + location.hash), '?private=test#secret');
    await page.locator('.desktop-nav a[href="/gioi-thieu/"]').click();
    await page.waitForURL('**/gioi-thieu/');
    await page.waitForFunction(() => (window.dataLayer || []).filter(item => item[1] === 'page_view').length === 2);
    assert.equal((await views())[1].page_location, 'https://vesinhtino.com/gioi-thieu/');
    assert.equal((await views())[1].page_referrer, 'https://vesinhtino.com/');
    await page.goBack();
    await page.waitForFunction(() => (window.dataLayer || []).filter(item => item[1] === 'page_view').length === 3);
    assert.equal(tagLoads, 1);
    for (const host of ['localhost', 'preview.vercel.app']) {
      await page.goto(`https://${host}/`);
      await page.waitForLoadState('networkidle');
      assert.equal((await views()).length, 0);
    }
    assert.equal(tagLoads, 1);

    // Coexist with an Ads tag without replacing its gtag function or loading it twice.
    existingTag = true;
    await page.addInitScript(() => {
      window.dataLayer = [];
      window.existingGtag = window.gtag = function () { window.dataLayer.push(arguments); };
    });
    await page.goto('https://vesinhtino.com/?utm_source=google&utm_medium=cpc&gclid=test-click&email=private%40example.invalid#secret');
    await page.waitForFunction(() => (window.dataLayer || []).some(item => item[1] === 'page_view'));
    await page.waitForLoadState('networkidle');
    assert.equal((await views()).length, 1);
    assert.equal((await views())[0].page_location, 'https://vesinhtino.com/?utm_source=google&utm_medium=cpc&gclid=test-click');
    assert.equal(await page.evaluate(() => window.gtag === window.existingGtag), true);
    assert.equal(tagLoads, 2);
    const configs = await page.evaluate(() => window.dataLayer.filter(item => item[0] === 'config').map(item => [item[1], item[2]]));
    assert.equal(configs.length, 1);
    assert.equal(configs[0][0], 'G-TESTONLY123');
    assert.equal(configs[0][1].send_page_view, false);
    assert.doesNotMatch(configs[0][1].page_location, /email|private|secret/);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: true, initialPageviews: 1, navigationPageviews: 1, backPageviews: 1, campaignPreserved: true, arbitraryParametersExcluded: true, existingAdsTagPreserved: true, tagLoads, excluded: ['localhost', 'preview'] }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
