// Isolated local reproduction of the mobile footer contrast warning.
const { chromium } = require(process.env.TINO_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const axe = path.resolve('.cache/mobile-tools/node_modules/axe-core/axe.min.js');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-proxy-server'] });
  const results = [];
  try {
    for (const [width, override] of [[1440, false], [390, false], [390, true], [320, false], [320, true]]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: width < 700 });
      await context.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:4394/') ? route.continue() : route.abort());
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:4394/');
      await page.evaluate(() => document.fonts.ready);
      if (override) await page.addStyleTag({ content: '.footer { content-visibility: visible; contain-intrinsic-size: none; }' });
      await page.addScriptTag({ path: axe });
      const result = await page.evaluate(async () => {
        const data = await window.axe.run('.footer-bottom', { runOnly: ['color-contrast'] });
        return { violations: data.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, checks: n.any.map(c => c.data) })) })), incomplete: data.incomplete.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) };
      });
      results.push({ width, override, ...result });
      if (process.argv.includes('--expect-pass')) {
        assert.deepEqual(result.violations, [], `Footer contrast at ${width}px`);
        assert.deepEqual(result.incomplete, [], `Unresolved footer contrast at ${width}px`);
      }
      await context.close();
    }
    fs.writeFileSync('qa/footer-audit.json', JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
