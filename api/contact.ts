import { handleContact, type ContactEnv } from '../server/contact.js';

// Only the two server variables used here; no Node runtime dependency in client types.
declare const process: { env: ContactEnv };

// Vercel Node.js Function. These variables are read only on the server.
export default {
  fetch(request: Request) {
    return handleContact(request, {
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID
    });
  }
};
