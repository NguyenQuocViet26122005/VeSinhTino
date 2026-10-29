import { pathToFileURL } from 'node:url';

// Keep the bot callback independent of custom-domain DNS propagation. Both
// addresses belong to this project; visitors continue using vesinhtino.com.
const webhookUrl = 'https://ve-sinh-tino.vercel.app/api/traffic-report';
const ownWebhookUrls = new Set([webhookUrl, 'https://vesinhtino.com/api/traffic-report']);

// Runs on the Vercel production build only. Credentials never enter Astro's
// public bundle or logs. No website probe or test message is sent.
export async function configureTelegramWebhook(env, send = fetch) {
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'production') return { skipped: true };
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const secret = env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const recipients = [env.TELEGRAM_CHAT_ID?.trim(), env.TELEGRAM_REPORT_CHAT_ID_2?.trim()];
  if (!token || !/^\d{6,20}:[A-Za-z0-9_-]{30,}$/.test(token) ||
    !secret || !/^[A-Za-z0-9_-]{32,256}$/.test(secret) ||
    recipients.some(id => !id || !/^[1-9]\d{0,19}$/.test(id)) || recipients[0] === recipients[1]) {
    throw new Error('Telegram production configuration is incomplete. Check the server-only bot token, webhook secret and two distinct private Chat IDs.');
  }
  async function telegram(method, body = {}) {
    let response;
    let data;
    try {
      response = await send(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(8000)
      });
      data = await response.json();
    } catch {
      // Provider errors may contain the token URL: replace, never log, their text.
      throw new Error(`Telegram ${method} was not confirmed. Credential values withheld.`);
    }
    if (!response.ok || data?.ok !== true) {
      // A bounded, redacted reason makes DNS/TLS/provider failures diagnosable.
      // Never print raw error objects, request URLs or credential values.
      const reason = (typeof data?.description === 'string' ? data.description : 'No provider description.')
        .replaceAll(token, '[redacted]').replaceAll(encodeURIComponent(token), '[redacted]')
        .replaceAll(secret, '[redacted]')
        .replace(/https?:\/\/\S+/gi, '[URL]')
        .replace(/\b\d{6,20}:[A-Za-z0-9_-]{30,}\b/g, '[redacted]')
        .replace(/[\x00-\x1f\x7f]/g, ' ').slice(0, 300);
      throw new Error(`Telegram ${method} was not confirmed (HTTP ${response.status}): ${reason}`);
    }
    return data.result;
  }
  const bot = await telegram('getMe');
  if (bot?.is_bot !== true || !/^[A-Za-z0-9_]{5,32}$/.test(bot?.username || '')) {
    throw new Error('Telegram bot identity was not confirmed.');
  }
  const current = await telegram('getWebhookInfo');
  if (!current || typeof current.url !== 'string') throw new Error('Telegram webhook status was not confirmed.');
  if (current.url && !ownWebhookUrls.has(current.url)) {
    throw new Error('A different Telegram webhook is active. It was not replaced. Check the existing bot integration before deployment.');
  }
  // Reapplying the same URL is intentional: Telegram does not return the saved
  // secret. Refresh it from production config without dropping pending updates.
  const registered = await telegram('setWebhook', {
    url: webhookUrl, secret_token: secret, allowed_updates: ['message'], drop_pending_updates: false
  });
  if (registered !== true) throw new Error('Telegram webhook registration was not acknowledged.');
  const verified = await telegram('getWebhookInfo');
  if (verified?.url !== webhookUrl || !verified.allowed_updates?.includes('message')) {
    throw new Error('Telegram webhook registration could not be verified.');
  }
  return { skipped: false, bot: bot.username, url: webhookUrl, registered: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await configureTelegramWebhook(process.env);
    console.log(result.skipped ? 'Telegram webhook setup skipped outside Vercel production.'
      : `Telegram webhook registered and verified for @${result.bot}. No test messages sent.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
