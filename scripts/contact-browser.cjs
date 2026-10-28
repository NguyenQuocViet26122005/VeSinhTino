const fs = require('fs'), path = require('path'), http = require('http');
const {chromium} = require(process.env.TINO_PLAYWRIGHT || 'playwright');
const root=path.resolve('dist');
const server=http.createServer((req,res)=>{let p=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!p.startsWith(root)||!fs.existsSync(p)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);});

const assert=require('node:assert/strict');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.TINO_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-proxy-server']});
let passed=0;
try {
for(const scenario of ['http500','http503','http429','missingEndpoint','okFalse','badJson','network','timeout','success']) {
 const context=await browser.newContext();const page=await context.newPage();let calls=0;let telegramCalls=0;
 page.on('request',r=>{if(r.url().includes('api.telegram.org'))telegramCalls++;});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/api/contact',async route=>{
  calls++;const body=route.request().postDataJSON();assert.equal(body.phone,'0900000000');
  if(scenario==='network')return route.abort('failed');
  if(scenario==='timeout')return; // Browser's AbortController must release the form.
  const status={http500:500,http503:503,http429:429,missingEndpoint:404}[scenario]||200;
  return route.fulfill({status,contentType:scenario==='badJson'?'text/html':'application/json',body:scenario==='badJson'?'<html>error</html>':JSON.stringify({ok:scenario==='success'})});
 });
 await page.setViewportSize({width:390,height:844});await page.goto(base);
 await page.locator('.contact-smart-section').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>!document.querySelector('.contact-smart-section').closest('astro-island').hasAttribute('ssr'));
 await page.locator('#user-name').fill('Khách thử');await page.locator('#user-phone').fill('0900000000');
 if(scenario==='timeout')await page.clock.install();
 await page.locator('.form-submit-btn').click();
 if(scenario==='timeout')await page.clock.runFor(16000);
 if(scenario==='success')await page.locator('.contact-success-state').waitFor();
 else {await page.getByRole('alert').waitFor();assert.equal(await page.locator('.contact-success-state').count(),0);assert.equal(await page.locator('#user-phone').inputValue(),'0900000000');assert.equal(await page.locator('.form-submit-btn').isEnabled(),true);}
 assert.equal(telegramCalls,0);assert.equal(calls,1);
 assert.equal(await page.evaluate(()=>localStorage.getItem('tino_leads')),null);
 console.log('PASS '+scenario);passed++;await context.close();
}
console.log(JSON.stringify({passed}));
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
