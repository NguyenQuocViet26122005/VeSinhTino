import { handleContact, type ContactEnv } from '../server/contact.js';

// Server-only bot credentials and the two recipient IDs.
declare const process: { env: ContactEnv & { VERCEL?: string } };
export const maxDuration = 20;

// Vercel Node.js Function. These variables are read only on the server.
export default {
  fetch(request: Request) {
    return handleContact(request, {
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
      TELEGRAM_REPORT_CHAT_ID_2: process.env.TELEGRAM_REPORT_CHAT_ID_2
    }, fetch, process.env.VERCEL === '1'
      ? (request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
      : undefined);
  }
};
