import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configureTelegramWebhook } from './configure-telegram-webhook.mjs';

const env = {
  VERCEL: '1', VERCEL_ENV: 'production', TELEGRAM_BOT_TOKEN: '123456' + ':' + 'x'.repeat(35),
  TELEGRAM_WEBHOOK_SECRET: 'fixture_only_webhook_secret_32_characters',
  TELEGRAM_CHAT_ID: '111', TELEGRAM_REPORT_CHAT_ID_2: '222'
};
const url = 'https://ve-sinh-tino.vercel.app/api/traffic-report';
const never = async () => assert.fail('No request should be made.');

test('never connects from local, preview or other hosting environments', async () => {
  for (const patch of [{ VERCEL: undefined }, { VERCEL_ENV: 'preview' }, { VERCEL_ENV: undefined }]) {
    assert.deepEqual(await configureTelegramWebhook({ ...env, ...patch }, never), { skipped: true });
  }
});

test('requires valid secrets and both distinct private recipients', async () => {
  for (const patch of [
    { TELEGRAM_BOT_TOKEN: '' }, { TELEGRAM_WEBHOOK_SECRET: 'short' },
    { TELEGRAM_CHAT_ID: '-111' }, { TELEGRAM_REPORT_CHAT_ID_2: undefined },
    { TELEGRAM_REPORT_CHAT_ID_2: '111' }
  ]) await assert.rejects(configureTelegramWebhook({ ...env, ...patch }, never), /configuration is incomplete/);
});

test('registers only with Telegram, preserves pending updates and verifies the result', async () => {
  for (const existing of ['', url, 'https://vesinhtino.com/api/traffic-report']) {
    const calls = [];
    let set = false;
    const result = await configureTelegramWebhook(env, async (target, options) => {
      assert.equal(new URL(target).hostname, 'api.telegram.org');
      assert.equal(options.redirect, 'error');
      assert.equal(options.method, 'POST');
      const method = target.split('/').at(-1);
      calls.push(method);
      if (method === 'getMe') return Response.json({ ok: true, result: { is_bot: true, username: 'tino_fixture_bot' } });
      if (method === 'getWebhookInfo') return Response.json({ ok: true, result: {
        url: set ? url : existing, allowed_updates: ['message']
      } });
      assert.equal(method, 'setWebhook');
      assert.deepEqual(JSON.parse(options.body), {
        url, secret_token: env.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ['message'], drop_pending_updates: false
      });
      set = true;
      return Response.json({ ok: true, result: true });
    });
    assert.equal(result.registered, true);
    assert.deepEqual(calls, ['getMe', 'getWebhookInfo', 'setWebhook', 'getWebhookInfo']);
  }
});

test('refuses to replace another webhook', async () => {
  const calls = [];
  await assert.rejects(configureTelegramWebhook(env, async target => {
    const method = target.split('/').at(-1);
    calls.push(method);
    if (method === 'getMe') return Response.json({ ok: true, result: { is_bot: true, username: 'tino_fixture_bot' } });
    assert.equal(method, 'getWebhookInfo');
    return Response.json({ ok: true, result: { url: 'https://example.invalid/existing' } });
  }), /different Telegram webhook is active/);
  assert.deepEqual(calls, ['getMe', 'getWebhookInfo']);
});

test('provider failures never reveal token or webhook secret', async () => {
  for (const send of [
    async () => { throw new Error(env.TELEGRAM_BOT_TOKEN + env.TELEGRAM_WEBHOOK_SECRET); },
    async () => Response.json({ ok: false, description: env.TELEGRAM_BOT_TOKEN + ' ' + env.TELEGRAM_WEBHOOK_SECRET + ' https://example.invalid/' + encodeURIComponent(env.TELEGRAM_BOT_TOKEN) }, { status: 401 }),
    async () => new Response('invalid JSON')
  ]) {
    await assert.rejects(configureTelegramWebhook(env, send), error => {
      assert.equal(error.message.includes(env.TELEGRAM_BOT_TOKEN), false);
      assert.equal(error.message.includes(env.TELEGRAM_WEBHOOK_SECRET), false);
      return /not confirmed/.test(error.message);
    });
  }
});

test('exposes a bounded safe provider reason without logging request URLs', async () => {
  await assert.rejects(configureTelegramWebhook(env, async () => Response.json({
    ok: false, description: 'Bad Request: bad webhook: failed to resolve host\n' + 'x'.repeat(500)
  }, { status: 400 })), error => {
    assert.match(error.message, /HTTP 400.*failed to resolve host/);
    assert.doesNotMatch(error.message, /[\r\n]/);
    assert.ok(error.message.length < 400);
    return true;
  });
});

test('does not claim success when Telegram fails to retain the URL', async () => {
  await assert.rejects(configureTelegramWebhook(env, async target => {
    const method = target.split('/').at(-1);
    if (method === 'getMe') return Response.json({ ok: true, result: { is_bot: true, username: 'tino_fixture_bot' } });
    if (method === 'setWebhook') return Response.json({ ok: true, result: true });
    return Response.json({ ok: true, result: { url: '', allowed_updates: ['message'] } });
  }), /could not be verified/);
});

test('requires an explicit positive setWebhook acknowledgement', async () => {
  await assert.rejects(configureTelegramWebhook(env, async target => {
    const method = target.split('/').at(-1);
    if (method === 'getMe') return Response.json({ ok: true, result: { is_bot: true, username: 'tino_fixture_bot' } });
    if (method === 'getWebhookInfo') return Response.json({ ok: true, result: { url, allowed_updates: ['message'] } });
    return Response.json({ ok: true, result: false });
  }), /not acknowledged/);
});
