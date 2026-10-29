import { handleContact, type ContactEnv } from '../../server/contact';

// Cloudflare Pages Functions entry point.
export const onRequest = (context: { request: Request; env: ContactEnv }) =>
  handleContact(context.request, context.env, fetch, context.request.headers.get('cf-connecting-ip') || 'unknown');
