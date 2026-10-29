import { JWT } from 'google-auth-library';
import type { ReadTraffic, TrafficStats } from './traffic-report.js';

interface Report {
  metricHeaders?: { name: string }[];
  rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
  metadata?: { timeZone?: string };
}

export const readTraffic: ReadTraffic = async (periods, env) => {
  const client = new JWT({
    email: env.GA4_CLIENT_EMAIL!.trim(), key: env.GA4_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/analytics.readonly']
  });
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('no access token');
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
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${env.GA4_PROPERTY_ID}:batchRunReports`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }), signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error('report failed');
  const data = await response.json() as { reports?: Report[] };
  if (data.reports?.length !== requests.length) throw new Error('incomplete response');
  const metrics = (report: Report, names: string[]) => {
    if (!['Asia/Ho_Chi_Minh', 'Asia/Saigon'].includes(report.metadata?.timeZone || '') ||
      report.metricHeaders?.map(header => header.name).join(',') !== names.join(',')) throw new Error('unexpected schema or timezone');
    return names.map((_, index) => {
      const value = report.rows?.[0]?.metricValues?.[index]?.value;
      if (report.rows?.length && value === undefined) throw new Error('missing metric');
      return Number(value ?? 0);
    });
  };
  return periods.map((_, index): TrafficStats => {
    const summary = data.reports![index * 2], pages = data.reports![index * 2 + 1];
    const [users, sessions, views] = metrics(summary, ['totalUsers', 'sessions', 'screenPageViews']);
    metrics(pages, ['screenPageViews']);
    return { users, sessions, views, pages: (pages.rows || []).map(row => {
      if (!row.dimensionValues?.[0]?.value || row.metricValues?.[0]?.value === undefined) throw new Error('missing page');
      return { path: row.dimensionValues[0].value, views: Number(row.metricValues[0].value) };
    }) };
  });
};
