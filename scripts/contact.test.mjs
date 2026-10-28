import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../server/contact.ts';
import fs from 'node:fs';

// Dummy values only; no real Telegram traffic.
const env = { TELEGRAM_BOT_TOKEN: 'dummy-token', TELEGRAM_CHAT_ID: 'dummy-chat' };
const input = { name: '<b>Khách thử</b>', phone: '0900000000', notes: 'Nội dung thử' };
const request = (body = input, headers = {}) => new Request('https://tino.test/api/contact', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body)
});
test('only acknowledges a confirmed Telegram success', async () => {
  const response = await handleContact(request(), env, async (url, options) => {
    assert.equal(url, 'https://api.telegram.org/botdummy-token/sendMessage');
    const sent = JSON.parse(options.body);
    assert.equal(sent.chat_id, 'dummy-chat');
    assert.ok(sent.text.includes(input.name));
    assert.equal(sent.parse_mode, undefined); // User text is plain text, never Telegram markup.
    return Response.json({ ok: true });
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(response.headers.get('cache-control'), 'no-store');
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
