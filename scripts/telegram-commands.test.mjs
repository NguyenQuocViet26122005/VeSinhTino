import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configureTelegramCommands } from './configure-telegram-commands.mjs';
import { botCommands } from '../server/telegram-commands.mjs';
const env = { VERCEL: '1', VERCEL_ENV: 'production', TELEGRAM_BOT_TOKEN: '123456:' + 'x'.repeat(35),
  TELEGRAM_CHAT_ID: '111', TELEGRAM_REPORT_CHAT_ID_2: '5193894351' };
const never = async () => assert.fail('No external request expected');

test('command menus skip local/preview and require both distinct safe private IDs', async () => {
  for (const patch of [{ VERCEL: undefined }, { VERCEL_ENV: 'preview' }]) {
    assert.deepEqual(await configureTelegramCommands({ ...env, ...patch }, never), { skipped: true });
  }
  for (const patch of [{ TELEGRAM_BOT_TOKEN: '' }, { TELEGRAM_REPORT_CHAT_ID_2: '111' },
    { TELEGRAM_CHAT_ID: '-111' }, { TELEGRAM_REPORT_CHAT_ID_2: '99999999999999999999' }]) {
    await assert.rejects(configureTelegramCommands({ ...env, ...patch }, never), /incomplete/);
  }
});

test('registers and reads back all supported commands only in the two private chat scopes', async () => {
  const calls = [];
  const result = await configureTelegramCommands(env, async (url, options) => {
    assert.equal(new URL(url).hostname, 'api.telegram.org');
    assert.equal(options.redirect, 'error');
    const method = url.split('/').at(-1), body = JSON.parse(options.body);
    assert.deepEqual(body.scope.type, 'chat');
    assert.ok([111, 5193894351].includes(body.scope.chat_id));
    calls.push([method, body.scope.chat_id]);
    if (method === 'setMyCommands') {
      assert.deepEqual(body.commands, botCommands);
      assert.equal(body.commands.filter(item => item.command === 'tructiep').length, 1);
      return Response.json({ ok: true, result: true });
    }
    assert.equal(method, 'getMyCommands');
    return Response.json({ ok: true, result: botCommands });
  });
  assert.equal(result.configured, true);
  assert.deepEqual(calls, [['setMyCommands', 111], ['getMyCommands', 111], ['setMyCommands', 5193894351], ['getMyCommands', 5193894351]]);
});

test('menu failures are bounded and never reveal the token or claim success', async () => {
  let calls = 0;
  await assert.rejects(configureTelegramCommands(env, async () => { calls++; throw new Error(env.TELEGRAM_BOT_TOKEN); }, async () => {}), error => {
    assert.equal(error.message.includes(env.TELEGRAM_BOT_TOKEN), false);
    return /not confirmed/.test(error.message);
  });
  assert.equal(calls, 3);
  await assert.rejects(configureTelegramCommands(env, async () => Response.json({ ok: true, result: false })), /not acknowledged/);
  await assert.rejects(configureTelegramCommands(env, async url => Response.json({ ok: true,
    result: url.endsWith('/setMyCommands') ? true : [] })), /could not be verified/);
});
