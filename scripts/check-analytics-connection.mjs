import { pathToFileURL } from 'node:url';
import { analyticsHints, AnalyticsReadError } from '../server/analytics-errors.mjs';

// Read-only check inside Vercel production. Never sends a Telegram report or
// prints metrics, keys, OAuth responses or raw provider errors.
export async function checkAnalyticsConnection(env, reader) {
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'production') return { skipped: true };
  try {
    if (!/^\d+$/.test(env.GA4_PROPERTY_ID || '') || !env.GA4_CLIENT_EMAIL?.trim() || !env.GA4_PRIVATE_KEY?.trim()) {
      return { ok: false, code: 'GA4_CONFIGURATION' };
    }
    const read = reader || (await import('../server/analytics-data.ts')).readTraffic;
    const { reportPeriods } = await import('../server/traffic-report.ts');
    await read(reportPeriods(new Date(), 'homnay'), env);
    return { ok: true };
  } catch (error) {
    return { ok: false, code: error instanceof AnalyticsReadError ? error.code : 'GA4_RESPONSE' };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await checkAnalyticsConnection(process.env);
  if (result.skipped) console.log('GA4 read-only check skipped outside Vercel production.');
  else if (result.ok) console.log('GA4 read-only connection verified. No metrics or credentials logged; no Telegram message sent.');
  else console.warn(`GA4 connection needs attention: ${result.code}. ${analyticsHints[result.code] || 'Check server-only GA4 configuration.'}`);
  // Reporting configuration must not prevent an otherwise healthy site deploy.
}
