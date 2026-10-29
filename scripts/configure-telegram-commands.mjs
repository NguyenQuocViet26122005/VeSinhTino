import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { botCommands } from '../server/telegram-commands.mjs';

export async function configureTelegramCommands(env, send = fetch, wait = delay) {
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'production') return { skipped: true };
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const recipients = [env.TELEGRAM_CHAT_ID?.trim(), env.TELEGRAM_REPORT_CHAT_ID_2?.trim()];
  if (!token || !/^\d{6,20}:[A-Za-z0-9_-]{30,}$/.test(token) || recipients[0] === recipients[1]
    || recipients.some(id => !id || !/^[1-9]\d{0,19}$/.test(id) || !Number.isSafeInteger(Number(id)))) {
    throw new Error('Telegram command menu configuration is incomplete. Credential values withheld.');
  }
  async function telegram(method, body) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt) await wait(500 * attempt);
      let response, data;
      try {
        response = await send(`https://api.telegram.org/bot${token}/${method}`, {
          method: 'POST', redirect: 'error', signal: AbortSignal.timeout(8000),
          headers: { 'Content-Type': 'application/json', Connection: 'close' }, body: JSON.stringify(body)
        });
        data = await response.json();
      } catch { continue; }
      if (response.ok && data?.ok === true) return data.result;
      if (response.status < 500) break;
    }
    throw new Error(`Telegram ${method} was not confirmed. Credential values withheld.`);
  }
  for (const id of recipients) {
    const scope = { type: 'chat', chat_id: Number(id) };
    if (await telegram('setMyCommands', { commands: botCommands, scope }) !== true) {
      throw new Error('Telegram command menu was not acknowledged.');
    }
    const saved = await telegram('getMyCommands', { scope });
    if (!Array.isArray(saved) || saved.length !== botCommands.length || botCommands.some((item, index) =>
      saved[index]?.command !== item.command || saved[index]?.description !== item.description)) {
      throw new Error('Telegram command menu could not be verified.');
    }
  }
  return { skipped: false, configured: true, accounts: 2 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await configureTelegramCommands(process.env);
    console.log(result.skipped ? 'Telegram command menu skipped outside Vercel production.'
      : 'Telegram command menus registered and verified for both private accounts. No messages sent.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
