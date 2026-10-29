import { JWT } from 'google-auth-library';
import { createPrivateKey } from 'node:crypto';
import type { ReadTraffic, ReadRealtime, TrafficEnv, TrafficStats } from './traffic-report.js';
import { AnalyticsReadError } from './analytics-errors.mjs';

interface Report {
  metricHeaders?: { name: string }[];
  rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
  metadata?: { timeZone?: string };
  kind?: string;
  rowCount?: number;
  totals?: unknown[];
  maximums?: unknown[];
  minimums?: unknown[];
}

export function normalizeAnalyticsKey(value: string, expectedEmail: string): string {
  try {
    let key = value.trim();
    if (key.startsWith('{')) {
      const file = JSON.parse(key) as { private_key?: unknown; client_email?: unknown };
      if (typeof file.private_key !== 'string' || (file.client_email && file.client_email !== expectedEmail)) throw new Error();
      key = file.private_key;
    } else {
      if (key.startsWith('"private_key"')) key = key.replace(/^"private_key"\s*:\s*/, '').replace(/,\s*$/, '');
      if (key.startsWith('"')) key = JSON.parse(key) as string;
    }
    key = key.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
    if (createPrivateKey(key).asymmetricKeyType !== 'rsa') throw new Error();
    return key;
  } catch { throw new AnalyticsReadError('GA4_KEY'); }
}

async function requestReport(method: 'batchRunReports' | 'runRealtimeReport', body: unknown, env: TrafficEnv): Promise<unknown> {
  const client = new JWT({
    email: env.GA4_CLIENT_EMAIL!.trim(), key: normalizeAnalyticsKey(env.GA4_PRIVATE_KEY!, env.GA4_CLIENT_EMAIL!.trim()),
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    transporterOptions: { timeout: 10000, retryConfig: { retry: 0 } }
  });
  let token: string | null | undefined;
  try { ({ token } = await client.getAccessToken()); }
  catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    throw new AnalyticsReadError(status === 400 || status === 401 || status === 403 ? 'GA4_AUTH' : 'GA4_NETWORK');
  }
  if (!token) throw new AnalyticsReadError('GA4_AUTH');
  let response: Response;
  try {
    response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${env.GA4_PROPERTY_ID}:${method}`, {
      method: 'POST', redirect: 'error', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000)
    });
  } catch { throw new AnalyticsReadError('GA4_NETWORK'); }
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { error?: { details?: { reason?: string }[] } } | null;
    if (error?.error?.details?.some(detail => detail.reason === 'SERVICE_DISABLED')) throw new AnalyticsReadError('GA4_API_DISABLED');
    throw new AnalyticsReadError(response.status === 401 ? 'GA4_AUTH' : response.status === 403 || response.status === 404 ? 'GA4_ACCESS' : 'GA4_NETWORK');
  }
  try { return await response.json(); } catch { throw new AnalyticsReadError('GA4_RESPONSE'); }
}

export const readTraffic: ReadTraffic = async (periods, env) => {
  const requests = periods.flatMap(period => {
    const common = {
      dateRanges: [{ startDate: period.start, endDate: period.end }],
      dimensionFilter: { filter: { fieldName: 'hostName', inListFilter: { values: ['vesinhtino.com', 'www.vesinhtino.com'] } } }
    };
    return [
      { ...common, metrics: [{ name: 'totalUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }] },
      { ...common, dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: '5' }
    ];
  });
  const data = await requestReport('batchRunReports', { requests }, env) as { reports?: Report[] } | null;
  if (!Array.isArray(data?.reports) || data.reports.length !== requests.length) throw new AnalyticsReadError('GA4_RESPONSE');
  const metrics = (report: Report, names: string[]) => {
    if (!['Asia/Ho_Chi_Minh', 'Asia/Saigon'].includes(report.metadata?.timeZone || '')) throw new AnalyticsReadError('GA4_TIMEZONE');
    if (report.rowCount !== undefined && (!Number.isSafeInteger(report.rowCount) || report.rowCount < 0
      || (report.rowCount > 0 && !report.rows?.length))) throw new AnalyticsReadError('GA4_RESPONSE');
    // Google omits metricHeaders for an empty dimensionless report. Only
    // accept the documented report kind with no rows, count or aggregates.
    const omittedOrEmpty = (value: unknown) => value === undefined || (Array.isArray(value) && value.length === 0);
    if (report.kind === 'analyticsData#runReport' && omittedOrEmpty(report.metricHeaders) && omittedOrEmpty(report.rows)
      && (report.rowCount === undefined || report.rowCount === 0)
      && [report.totals, report.maximums, report.minimums].every(omittedOrEmpty)) return names.map(() => 0);
    if (report.metricHeaders?.map(header => header.name).join(',') !== names.join(',')) throw new AnalyticsReadError('GA4_RESPONSE');
    return names.map((_, index) => {
      const value = report.rows?.[0]?.metricValues?.[index]?.value;
      if (report.rows?.length && value === undefined) throw new AnalyticsReadError('GA4_RESPONSE');
      const number = Number(value ?? 0);
      if (!Number.isSafeInteger(number) || number < 0) throw new AnalyticsReadError('GA4_RESPONSE');
      return number;
    });
  };
  return periods.map((_, index): TrafficStats => {
    const summary = data.reports![index * 2], pages = data.reports![index * 2 + 1];
    const [users, sessions, views] = metrics(summary, ['totalUsers', 'sessions', 'screenPageViews']);
    metrics(pages, ['screenPageViews']);
    const empty = !summary.rows?.length;
    if (empty && pages.rows?.length) throw new AnalyticsReadError('GA4_RESPONSE');
    return { users, sessions, views, empty, pages: (pages.rows || []).map(row => {
      if (!row.dimensionValues?.[0]?.value || row.metricValues?.[0]?.value === undefined) throw new AnalyticsReadError('GA4_RESPONSE');
      const views = Number(row.metricValues[0].value);
      if (!Number.isSafeInteger(views) || views < 0) throw new AnalyticsReadError('GA4_RESPONSE');
      return { path: row.dimensionValues[0].value, views };
    }) };
  });
};

export const readRealtime: ReadRealtime = async env => {
  // Use the verified website stream; Realtime does not support hostName filters.
  const stream = env.GA4_STREAM_ID?.trim() || (env.GA4_PROPERTY_ID === '394527770' ? '5764157990' : '');
  if (!/^[1-9]\d{0,19}$/.test(stream)) throw new AnalyticsReadError('GA4_STREAM');
  const report = await requestReport('runRealtimeReport', {
    metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
    dimensionFilter: { filter: { fieldName: 'streamId', stringFilter: { matchType: 'EXACT', value: stream } } },
    minuteRanges: [{ startMinutesAgo: 29, endMinutesAgo: 0 }]
  }, env) as Report | null;
  if (!report || Array.isArray(report) || typeof report !== 'object') throw new AnalyticsReadError('GA4_RESPONSE');
  const omittedOrEmpty = (value: unknown) => value === undefined || (Array.isArray(value) && value.length === 0);
  if (report.kind === 'analyticsData#runRealtimeReport' && omittedOrEmpty(report.metricHeaders) && omittedOrEmpty(report.rows)
    && (report.rowCount === undefined || report.rowCount === 0)
    && [report.totals, report.maximums, report.minimums].every(omittedOrEmpty)) return { users: 0, views: 0, empty: true };
  if (!Array.isArray(report.metricHeaders)) throw new AnalyticsReadError('GA4_RESPONSE');
  if (report.metricHeaders?.map(header => header.name).join(',') !== 'activeUsers,screenPageViews') throw new AnalyticsReadError('GA4_RESPONSE');
  if (report.rows !== undefined && !Array.isArray(report.rows)) throw new AnalyticsReadError('GA4_RESPONSE');
  if ((report.rows?.length || 0) > 1 || (report.rowCount !== undefined && report.rowCount !== (report.rows?.length || 0))) throw new AnalyticsReadError('GA4_RESPONSE');
  if (!report.rows?.length) return { users: 0, views: 0, empty: true };
  const values = report.rows[0].metricValues;
  if (values?.length !== 2 || values.some(value => typeof value?.value !== 'string' || !/^\d+$/.test(value.value))) throw new AnalyticsReadError('GA4_RESPONSE');
  const [users, views] = values.map(value => Number(value.value));
  if (![users, views].every(value => Number.isSafeInteger(value) && value >= 0)) throw new AnalyticsReadError('GA4_RESPONSE');
  return { users, views, empty: false };
};
