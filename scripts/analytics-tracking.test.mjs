import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute application source. The harness supplies browser/React boundaries;
// it does not contain a second implementation of analytics or form submission.
const analyticsSource = fs.readFileSync(new URL('../src/components/Analytics.astro', import.meta.url), 'utf8');
const scriptBlocks = [...analyticsSource.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scriptBlocks.length, 1, 'Test the actual processed Astro client script');
const analyticsJs = ts.transpileModule(scriptBlocks[0][1], {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None }
}).outputText;

function eventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(fn);
    },
    dispatchEvent(event) {
      for (const fn of listeners.get(event.type) || []) fn(event);
      return true;
    }
  };
}

function analyticsHarness({
  href = 'https://vesinhtino.com/?utm_source=google&utm_medium=cpc&gclid=MOCK_CLICK&phone=0900000000#private',
  referrer = 'https://www.google.com/search?q=private-query',
  measurementId = 'G-MOCKONLY'
} = {}) {
  const location = new URL(href);
  const window = eventTarget();
  const injectedScripts = [];
  const document = Object.assign(eventTarget(), {
    title: 'Tino test page',
    referrer,
    querySelector(selector) {
      if (selector === 'meta[name="tino-ga-id"]') return measurementId ? { content: measurementId } : null;
      if (selector.startsWith('script[')) return injectedScripts[0] || null;
      throw new Error('Unexpected DOM lookup: ' + selector);
    },
    createElement(tag) {
      assert.equal(tag, 'script');
      return {};
    },
    head: { append(script) { injectedScripts.push(script); } }
  });
  // No fetch, real browser or credential access is supplied to this context.
  vm.runInNewContext(analyticsJs, { window, document, location, URL, URLSearchParams, Date });
  const commands = () => (window.dataLayer || []).map(args => Array.from(args));
  const events = name => commands().filter(args => args[0] === 'event' && (!name || args[1] === name));
  const pageLoad = () => document.dispatchEvent({ type: 'astro:page-load' });
  const navigate = path => {
    location.href = new URL(path, location.href).href;
    pageLoad();
  };
  const click = href => document.dispatchEvent({
    type: 'click', target: { closest: () => new URL(href, location.href) }
  });
  return { window, document, location, commands, events, injectedScripts, pageLoad, navigate, click };
}

test('real Astro script strips private query/fragments and does not put Ads parameters on Google referrer', () => {
  const a = analyticsHarness();
  a.pageLoad();
  const config = a.commands().find(c => c[0] === 'config');
  assert.equal(config[1], 'G-MOCKONLY');
  assert.equal(config[2].page_referrer, 'https://www.google.com/search');
  assert.equal(config[2].send_page_view, false);
  const pv = a.events('page_view')[0][2];
  const url = new URL(pv.page_location);
  assert.equal(url.searchParams.get('gclid'), 'MOCK_CLICK');
  assert.equal(url.searchParams.get('utm_source'), 'google');
  assert.equal(url.searchParams.has('phone'), false);
  assert.equal(url.hash, '');
  assert.equal(a.injectedScripts.length, 1);
});

test('real Astro script records one virtual view and the correct previous page through a round trip', () => {
  const a = analyticsHarness();
  a.pageLoad();
  let previousPath = '/';
  for (const path of ['/lien-he/', '/dich-vu-ve-sinh-cong-nghiep/', '/']) {
    a.navigate(path);
    const pv = a.events('page_view').at(-1)[2];
    assert.equal(new URL(pv.page_location).pathname, path);
    assert.equal(pv.page_referrer, 'https://vesinhtino.com' + previousPath);
    assert.equal(new URL(pv.page_location).searchParams.get('gclid'), 'MOCK_CLICK');
    previousPath = path;
  }
  assert.equal(a.events('page_view').length, 4);
  assert.equal(a.commands().filter(c => c[0] === 'config').map(c => c[1]).join(), 'G-MOCKONLY,AW-16551966773');
  assert.equal(a.injectedScripts.length, 1);
  assert.equal(a.document.listeners.get('click').length, 1);
  assert.equal(a.window.listeners.get('tino:lead-success').length, 1);
});

test('real conversion listeners use current location/referrer and only count actual telephone/Zalo destinations', () => {
  const a = analyticsHarness();
  a.pageLoad();
  a.navigate('/lien-he/');
  a.click('tel:0925649666');
  a.click('https://zalo.me/0925649666');
  a.click('/?next=https://zalo.me/0925649666');
  a.click('https://zalo.me.example.test/');
  a.document.dispatchEvent({ type: 'click', target: {} });
  for (const name of ['click_hotline', 'click_zalo']) {
    assert.equal(a.events(name).length, 1);
    const event = a.events(name)[0][2];
    assert.equal(event.send_to, 'G-MOCKONLY');
    assert.equal(new URL(event.page_location).pathname, '/lien-he/');
    assert.equal(event.page_referrer, 'https://vesinhtino.com/');
  }
});

test('real click listener sends one Ads conversion per actual call or Zalo tap, with the matching label', () => {
  const a = analyticsHarness();
  a.pageLoad();
  const sent = () => a.events('conversion').map(args => args[2].send_to).join();
  a.click('/lien-he/');
  a.click('https://zalo.me.example.test/');
  assert.equal(sent(), '');
  a.click('tel:0925649666');
  assert.equal(sent(), 'AW-16551966773/aNzJCNaJqqwZELXwy9Q9');
  a.click('https://zalo.me/0925649666');
  assert.equal(sent(), 'AW-16551966773/aNzJCNaJqqwZELXwy9Q9,AW-16551966773/E9l-CMiSrqwZELXwy9Q9');
});

test('real lead listener only sends known service labels, not arbitrary customer fields', () => {
  const a = analyticsHarness();
  a.pageLoad();
  a.navigate('/lien-he/');
  a.window.dispatchEvent({
    type: 'tino:lead-success',
    detail: { service: 'Giặt thảm văn phòng', phone: '0900000000', notes: 'PRIVATE_NOTE' }
  });
  a.window.dispatchEvent({ type: 'tino:lead-success', detail: { service: 'PRIVATE_NOTE' } });
  const leads = a.events('generate_lead');
  assert.equal(leads[0][2].service_category, 'Giặt thảm văn phòng');
  assert.equal(leads[1][2].service_category, 'general');
  assert.equal(JSON.stringify(leads).includes('PRIVATE_NOTE'), false);
  assert.equal(JSON.stringify(leads).includes('0900000000'), false);
  assert.equal(leads[0][2].page_referrer, 'https://vesinhtino.com/');
});

test('real funnel listener only sends allow-listed steps and no visitor input', () => {
  const a = analyticsHarness();
  a.pageLoad();
  for (const step of ['estimator_use', 'estimator_to_form', 'form_start']) {
    a.window.dispatchEvent({ type: 'tino:funnel', detail: { step, phone: '0900000000' } });
    assert.equal(a.events(step).length, 1);
    assert.equal(a.events(step)[0][2].event_category, 'funnel');
  }
  a.window.dispatchEvent({ type: 'tino:funnel', detail: { step: 'PRIVATE_NOTE' } });
  a.window.dispatchEvent({ type: 'tino:funnel' });
  assert.equal(a.events('PRIVATE_NOTE').length, 0);
  assert.equal(JSON.stringify(a.commands()).includes('0900000000'), false);
});

for (const href of ['http://localhost:4321/', 'http://127.0.0.1:4321/', 'https://preview.example.test/']) {
  test('cold local/preview page does not configure tracking: ' + href, () => {
    const a = analyticsHarness({ href });
    a.pageLoad();
    a.click('tel:0925649666');
    a.window.dispatchEvent({ type: 'tino:lead-success', detail: {} });
    assert.equal(a.commands().length, 0);
    assert.equal(a.injectedScripts.length, 0);
  });
}

test('missing measurement ID, invalid/non-web referrers do not fabricate tracking context', () => {
  const disabled = analyticsHarness({ measurementId: '' });
  disabled.pageLoad();
  assert.equal(disabled.commands().length, 0);
  for (const referrer of ['', 'not a URL', 'javascript:alert(1)']) {
    const a = analyticsHarness({ referrer });
    a.pageLoad();
    assert.equal(a.events('page_view')[0][2].page_referrer, '');
  }
});

// Minimal React boundary adapter: render the real TSX, drive its real input
// callbacks, and call the real form's onSubmit. Effects/DOM hydration are not
// simulated; those require browser verification separately.
function formHarness(window, fetchImpl) {
  const slots = [];
  let cursor = 0;
  const React = {
    createElement(type, props, ...children) { return { type, props: { ...props, children } }; },
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect() {}
  };
  const timers = new Map();
  const requests = [];
  const exports = {};
  const compile = (source, filename) => ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
    fileName: filename
  }).outputText;
  const siteExports = {};
  vm.runInNewContext(compile(fs.readFileSync(new URL('../src/data/site.ts', import.meta.url), 'utf8'), 'site.ts'), { exports: siteExports });
  const sandbox = {
    exports, module: { exports }, window, AbortController, Date,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    setTimeout(fn) { const id = Symbol(); timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); },
    fetch(url, options) { requests.push({ url, options }); return fetchImpl(url, options); },
    require(name) {
      if (name === 'react') return { __esModule: true, default: React, ...React };
      if (name === '../data/site') return siteExports;
      throw new Error('Unexpected application dependency: ' + name);
    }
  };
  vm.runInNewContext(compile(fs.readFileSync(new URL('../src/components/ContactForm.tsx', import.meta.url), 'utf8'), 'ContactForm.tsx'), sandbox);
  const render = () => { cursor = 0; return exports.ContactForm(); };
  const find = (node, predicate) => {
    if (!node || typeof node !== 'object') return undefined;
    if (Array.isArray(node)) return node.map(child => find(child, predicate)).find(Boolean);
    if (predicate(node)) return node;
    return find(node.props?.children, predicate);
  };
  let tree = render();
  const fill = (id, value) => {
    const field = find(tree, node => node.props?.id === id);
    assert(field, 'Actual form field must exist: ' + id);
    field.props.onChange({ target: { value } });
    tree = render();
  };
  const submit = () => {
    const form = find(tree, node => node.type === 'form');
    assert(form, 'Actual contact form must be rendered');
    return form.props.onSubmit({ preventDefault() {} });
  };
  fill('user-phone', '0900000000');
  fill('user-notes', 'PRIVATE_NOTE');
  return {
    requests, timers, fill, submit,
    view: () => { tree = render(); return tree; },
    fieldValue: id => find(render(), node => node.props?.id === id)?.props.value
  };
}

const response = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test('real ContactForm emits one real Analytics lead only after API confirmation, including double submit', async () => {
  const a = analyticsHarness();
  a.pageLoad();
  a.navigate('/lien-he/');
  let resolveFetch;
  const f = formHarness(a.window, () => new Promise(resolve => { resolveFetch = resolve; }));
  const first = f.submit();
  const duplicate = f.submit();
  assert.equal(f.requests.length, 1);
  assert.equal(a.events('generate_lead').length, 0, 'No lead while API is pending');
  assert.equal(f.requests[0].url, '/api/contact');
  resolveFetch(response(200, { ok: true }));
  await Promise.all([first, duplicate]);
  assert.equal(a.events('generate_lead').length, 1);
  assert.equal(new URL(a.events('generate_lead')[0][2].page_location).pathname, '/lien-he/');
  assert.equal(JSON.stringify(a.events('generate_lead')).includes('PRIVATE_NOTE'), false);
  assert.equal(f.timers.size, 0);
});

const failures = [
  ['429', () => response(429, { ok: false })],
  ['503', () => response(503, { ok: false })],
  ['HTTP error even with ok body', () => response(500, { ok: true })],
  ['backend rejection', () => response(200, { ok: false })],
  ['unconfirmed truthy value', () => response(200, { ok: 'true' })],
  ['missing confirmation', () => response(200, {})],
  ['invalid JSON', () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError(); } })],
  ['network failure', () => { throw new Error('offline'); }]
];
for (const [name, result] of failures) {
  test('real ContactForm retains inputs and emits no lead on ' + name, async () => {
    const a = analyticsHarness();
    a.pageLoad();
    const f = formHarness(a.window, async () => result());
    await f.submit();
    assert.equal(a.events('generate_lead').length, 0);
    assert.equal(f.fieldValue('user-phone'), '0900000000');
    assert.equal(f.fieldValue('user-notes'), 'PRIVATE_NOTE');
    assert.equal(f.timers.size, 0);
  });
}

test('real ContactForm aborts timeout without a lead and permits retry after failure', async () => {
  const a = analyticsHarness();
  a.pageLoad();
  let attempt = 0;
  const f = formHarness(a.window, async (_url, { signal }) => {
    if (attempt++ > 0) return response(200, { ok: true });
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('timeout'))));
  });
  const pending = f.submit();
  for (const fn of f.timers.values()) fn();
  await pending;
  assert.equal(a.events('generate_lead').length, 0);
  assert.equal(f.timers.size, 0);
  f.view();
  await f.submit();
  assert.equal(a.events('generate_lead').length, 1);
});

test('real ContactForm rejects an invalid phone before any API request or lead', async () => {
  const a = analyticsHarness();
  a.pageLoad();
  const f = formHarness(a.window, async () => { throw new Error('must not send'); });
  f.fill('user-phone', 'invalid');
  await f.submit();
  assert.equal(f.requests.length, 0);
  assert.equal(a.events('generate_lead').length, 0);
});
