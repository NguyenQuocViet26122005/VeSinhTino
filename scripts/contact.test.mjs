import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleContact, createContactGate } from '../server/contact.ts';
import fs from 'node:fs';

// Dummy values only; no real Telegram traffic.
const env = { TELEGRAM_BOT_TOKEN: 'dummy-token', TELEGRAM_CHAT_ID: '111', TELEGRAM_REPORT_CHAT_ID_2: '222' };
const input = { name: '<b>Khách thử</b>', phone: '0900000000', notes: 'Nội dung thử' };
const request = (body = input, headers = {}) => new Request('https://tino.test/api/contact', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body)
});
test('only acknowledges a confirmed Telegram success', async () => {
  const deliveries = [];
  const response = await handleContact(request(), env, async (url, options) => {
    assert.equal(url, 'https://api.telegram.org/botdummy-token/sendMessage');
    const sent = JSON.parse(options.body);
    deliveries.push(sent);
    assert.ok(sent.text.includes(input.name));
    assert.equal(sent.parse_mode, undefined); // User text is plain text, never Telegram markup.
    return Response.json({ ok: true });
  });
  assert.equal(response.status, 200);
  assert.deepEqual(deliveries.map(delivery => delivery.chat_id).sort(), ['111', '222']);
  assert.equal(deliveries[0].text, deliveries[1].text);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('attempts the other recipient even when either account rejects or throws', async () => {
  for (const failedId of ['111', '222']) {
    for (const networkFailure of [false, true]) {
      const recipients = [];
      const response = await handleContact(request(), env, async (_url, options) => {
        const { chat_id } = JSON.parse(options.body);
        recipients.push(chat_id);
        if (chat_id === failedId) {
          if (networkFailure) throw new Error('dummy-token');
          return Response.json({ ok: false }, { status: 403 });
        }
        return Response.json({ ok: true });
      });
      assert.deepEqual(recipients.sort(), ['111', '222']);
      assert.equal(response.status, networkFailure ? 504 : 502);
      const body = await response.text();
      assert.equal(JSON.parse(body).ok, false);
      assert.equal(body.includes('dummy-token'), false);
    }
  }
});
test('both deliveries start before either completes', async () => {
  let firstStarted;
  const started = new Promise(resolve => { firstStarted = resolve; });
  let finish;
  let count = 0;
  const gate = new Promise(resolve => { finish = resolve; });
  const pending = handleContact(request(), env, async () => {
    count++;
    if (count === 2) firstStarted();
    await gate;
    return Response.json({ ok: true });
  });
  await started;
  finish();
  assert.equal((await pending).status, 200);
});
for (const [name, status, body] of [
  ['HTTP failure', 500, { ok: true }],
  ['Telegram refusal', 200, { ok: false }],
  ['missing confirmation', 200, {}],
  ['invalid JSON', 200, null]
]) test(name + ' never acknowledges success', async () => {
  const response = await handleContact(request(), env, async () => body === null
    ? new Response('not json', { status }) : Response.json(body, { status }));
  assert.equal(response.status, 502);
  assert.equal((await response.json()).ok, false);
});
test('network errors never leak the credential or acknowledge success', async () => {
  const response = await handleContact(request(), env, async () => { throw new Error('https://api.telegram.org/botdummy-token/sendMessage'); });
  assert.equal(response.status, 504);
  const body = await response.text();
  assert.equal(body.includes('dummy-token'), false);
  assert.equal(JSON.parse(body).ok, false);
});
test('upstream timeout aborts sending and never acknowledges success', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let pending;
  const started = new Promise(resolve => { pending = resolve; });
  const responsePromise = handleContact(request(), env, async (_url, options) => {
    pending();
    return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true }));
  });
  await started;
  t.mock.timers.tick(8000);
  const response = await responsePromise;
  assert.equal(response.status, 504);
  assert.equal((await response.json()).ok, false);
});
test('missing configuration makes no outgoing request', async () => {
  const response = await handleContact(request(), {}, async () => { assert.fail('must not send'); });
  assert.equal(response.status, 503);
});
test('requires two distinct positive private Chat IDs before sending', async () => {
  for (const patch of [
    { TELEGRAM_REPORT_CHAT_ID_2: undefined }, { TELEGRAM_REPORT_CHAT_ID_2: '' },
    { TELEGRAM_REPORT_CHAT_ID_2: '111' }, { TELEGRAM_REPORT_CHAT_ID_2: '-222' },
    { TELEGRAM_REPORT_CHAT_ID_2: '0' }, { TELEGRAM_REPORT_CHAT_ID_2: 'abc' },
    { TELEGRAM_CHAT_ID: '-111' }, { TELEGRAM_CHAT_ID: '0' }
  ]) {
    const response = await handleContact(request(), { ...env, ...patch }, async () => assert.fail('must not send'));
    assert.equal(response.status, 503);
  }
});
for (const body of [null, [], { phone: {} }, { phone: '01234567890' }, { ...input, notes: 'a'.repeat(1501) }, { ...input, honeypot: 'spam' }]) {
  test('rejects malformed input: ' + JSON.stringify(body).slice(0, 55), async () => {
    const response = await handleContact(request(body), env, async () => { assert.fail('must not send'); });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).ok, false);
  });
}
test('rejects an oversized actual body', async () => {
  const response = await handleContact(request({ ...input, notes: 'a'.repeat(9000) }), env);
  assert.equal(response.status, 413);
});
test('rejects cross-origin submissions', async () => {
  assert.equal((await handleContact(request(input, { origin: 'https://other.test' }), env)).status, 403);
});
test('browser source never calls Telegram or treats local storage as delivery', () => {
  const source = fs.readFileSync('src/components/ContactForm.tsx', 'utf8');
  assert.ok(source.includes("fetch('/api/contact'"));
  assert.equal(/api\.telegram\.org|botToken|no-cors|tino_leads/.test(source), false);
});

test('requires the exact JSON media type and rejects cross-site browser requests', async () => {
  assert.equal((await handleContact(request(input, { 'content-type': 'application/json-malformed' }), env)).status, 415);
  assert.equal((await handleContact(request(input, { 'sec-fetch-site': 'cross-site' }), env)).status, 403);
  assert.equal((await handleContact(request(input, { 'content-length': '9000' }), env)).status, 413);
});

test('local protection caps a sender at five per minute and expires the window', () => {
  let now = 0;
  const acquire = createContactGate(() => now);
  for (let i = 0; i < 5; i++) { const release = acquire('dummy-client'); assert.ok(release); release(); }
  assert.equal(acquire('dummy-client'), null);
  now = 60_001;
  const release = acquire('dummy-client'); assert.ok(release); release();
});

test('local protection bounds concurrent work and release is idempotent', () => {
  const acquire = createContactGate();
  const releases = Array.from({ length: 4 }, () => acquire());
  assert.equal(acquire(), null);
  releases[0](); releases[0]();
  const release = acquire(); assert.ok(release);
  assert.equal(acquire(), null);
  release(); releases.slice(1).forEach(finish => finish());
});

test('a slow body is cancelled rather than keeping the function open', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let cancelled = false;
  const stream = new ReadableStream({ cancel() { cancelled = true; } });
  const incoming = new Request('https://tino.test/api/contact', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: stream, duplex: 'half'
  });
  const pending = handleContact(incoming, env, async () => assert.fail('must not send'));
  t.mock.timers.tick(5000);
  assert.equal((await pending).status, 408);
  assert.equal(cancelled, true);
});
