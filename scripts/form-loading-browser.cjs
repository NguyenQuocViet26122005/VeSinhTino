// Simulate a customer typing/submitting before hydration. Telegram is never called.
const { chromium } = require(process.env.TINO_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:4394';
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-proxy-server'] });
  const results = [], errors = [];
  try {
    for (const mode of ['draft', 'early-submit', 'provider-error', 'honeypot']) {
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      const sent = [];
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      try {
        await context.route('**/*', async route => {
          const url = route.request().url();
          if (!url.startsWith(base + '/')) return route.abort();
          if (url.endsWith('/api/contact')) {
            sent.push(route.request().postDataJSON());
            return route.fulfill({ status: mode === 'provider-error' ? 503 : 200, contentType: 'application/json', body: JSON.stringify({ ok: mode !== 'provider-error' }) });
          }
          if (/\/(?:client|react|jsx-runtime)\.[^/]+\.js$/.test(url)) await gate;
          return route.continue();
        });
        const page = await context.newPage();
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => typeof document.querySelector('.menu-toggle')?.onclick === 'function');
        await page.locator('#user-name').fill('Kiểm tra nội bộ');
        await page.locator('#user-phone').fill('0900000000');
        await page.locator('#user-service').selectOption('Vệ sinh nhà ở & Nhà cũ');
        await page.locator('#user-area').fill('65 m2');
        await page.locator('#user-notes').fill('Kiểm tra giữ dữ liệu; không gửi thật');
        if (mode === 'honeypot') await page.locator('#company_website_url').evaluate(input => { input.value = 'https://example.invalid'; });
        if (mode === 'early-submit') {
          await page.locator('.form-submit-btn').click();
          await page.locator('.form-submit-btn').click();
          assert.equal(await page.locator('.contact-form').getAttribute('data-pending-submit'), 'true');
          assert.equal(new URL(page.url()).pathname, '/', 'Early submit must not reload/navigate');
        }
        release();
        if (mode !== 'early-submit') {
          await page.locator('.contact-form[data-contact-ready]').waitFor();
          assert.equal(await page.locator('#user-phone').inputValue(), '0900000000');
          await page.locator('.form-submit-btn').click();
        }
        await page.waitForFunction(() => document.querySelector('.reset-form-btn') || document.body.textContent.includes('Form tạm thời chưa sẵn sàng'), null, { timeout: 5000 });
        assert.equal(sent.length, 1, 'A queued submit must be sent once');
        assert.equal(sent[0].name, 'Kiểm tra nội bộ');
        assert.equal(sent[0].phone, '0900000000');
        assert.equal(sent[0].area, '65 m2');
        assert.equal(sent[0].service, 'Vệ sinh nhà ở & Nhà cũ');
        assert.equal(sent[0].notes, 'Kiểm tra giữ dữ liệu; không gửi thật');
        assert.equal(sent[0].honeypot, mode === 'honeypot' ? 'https://example.invalid' : '');
        if (mode === 'provider-error') {
          assert.equal(await page.locator('#user-phone').inputValue(), '0900000000');
          assert.equal(await page.locator('#user-notes').inputValue(), sent[0].notes);
        } else {
          await page.locator('.reset-form-btn').click();
          await page.locator('.contact-form[data-contact-ready]').waitFor();
          assert.equal(await page.locator('#user-phone').inputValue(), '');
          if (mode === 'draft') {
            await page.locator('#user-phone').fill('0900000001');
            await page.locator('.form-submit-btn').click();
            await page.locator('.reset-form-btn').waitFor();
            assert.equal(sent.length, 2);
            assert.equal(sent[1].phone, '0900000001');
          }
        }
        results.push({ mode, preserved: true, requests: sent.length });
      } finally { release(); await context.close(); }
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync('qa/form-loading-browser.json', JSON.stringify({ passed: true, results, errors }, null, 2));
    console.log(JSON.stringify({ passed: true, results, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
