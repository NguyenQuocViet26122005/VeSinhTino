// Run with TINO_PLAYWRIGHT pointing to an installed Playwright module.
const { chromium } = require(process.env.TINO_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const base = 'http://127.0.0.1:4387';
const routes = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== '_astro') walk(file);
    else if (entry.name.endsWith('.html')) routes.push('/' + path.relative('dist', file).replaceAll('\\', '/').replace(/index\.html$/, ''));
  }
}
walk('dist');
(async () => {
  const http = require('node:http');
  const server = http.createServer((req,res)=>{const url=new URL(req.url,base);let file=path.join(process.cwd(),'dist',decodeURIComponent(url.pathname));if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!file.startsWith(path.join(process.cwd(),'dist'))||!fs.existsSync(file)){res.writeHead(404);res.end('Not found');return;}const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
  await new Promise(resolve=>server.listen(4387,'127.0.0.1',resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args:['--no-proxy-server'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const results = [];
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      for (const route of routes) {
        await page.goto(base + route);
        await page.evaluate(() => document.fonts.ready);
        const state = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth > innerWidth }));
        assert.equal(state.h1, 1, route);
        assert.equal(state.overflow, false, `${width}: ${route}`);
        results.push({ width, route, ...state });
      }
      await page.goto(base);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `C:/workspace/Tino-final-${width}.png` });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
      await page.locator('#mobile-nav').getByRole('link', { name: 'Bảng giá', exact: true }).click();
      await page.waitForURL('**/bang-gia/');
      await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
      await page.locator('#mobile-nav').getByRole('link', { name: 'Trang chủ', exact: true }).click();
      await page.waitForURL(base + '/');
      await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
      await page.getByRole('button', { name: 'Đóng menu', exact: true }).press('Escape');
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    }
    const glass = page.locator('.glass-touch');
    await glass.press('End');
    assert.equal(await glass.getAttribute('aria-valuenow'), '100');
    await page.locator('#wipe-reset').click();
    assert.equal(await glass.getAttribute('aria-valuenow'), '0');
    await glass.scrollIntoViewIfNeeded();
    const rect = await glass.boundingBox();
    await page.mouse.move(rect.x + rect.width * .25, rect.y + rect.height * .5);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width * .7, rect.y + rect.height * .5, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    const progress = Number(await glass.getAttribute('aria-valuenow'));
    assert.ok(progress > 30 && progress <= 100, String(progress));
    await glass.press('Home');
    assert.equal(await glass.getAttribute('aria-valuenow'), '0');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await glass.press('End');
    assert.equal(await glass.getAttribute('aria-valuenow'), '100');
    assert.equal(await page.locator('.wow-detail').count(), 0);
    assert.deepEqual(errors, []);
    fs.writeFileSync('qa/final-browser-results.json', JSON.stringify({ passed: true, checks: results, navigationCycles: 3, dragProgress: progress, errors }, null, 2));
    console.log(JSON.stringify({ passed: true, routeChecks: results.length, navigationCycles: 3, dragProgress: progress }));
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
