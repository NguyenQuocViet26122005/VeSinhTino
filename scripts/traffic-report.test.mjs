import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleTrafficReport, reportPeriods, AnalyticsReadError } from '../server/traffic-report.ts';
import { readTraffic, normalizeAnalyticsKey } from '../server/analytics-data.ts';
import { generateKeyPairSync } from 'node:crypto';
import { JWT } from 'google-auth-library';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { checkAnalyticsConnection } from './check-analytics-connection.mjs';

const fixtureKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' });
const env = {
  TELEGRAM_WEBHOOK_SECRET: 'test_only_webhook_secret_32_characters', GA4_PROPERTY_ID: '123456',
  GA4_CLIENT_EMAIL: 'test@example.invalid', GA4_PRIVATE_KEY: fixtureKey,
  TELEGRAM_BOT_TOKEN: 'dummy-token', TELEGRAM_CHAT_ID: '111', TELEGRAM_REPORT_CHAT_ID_2: '222'
};
const update = (text = '/baocao', id = 111) => ({ message: { text, chat: { id, type: 'private' }, from: { id } } });
const request = (body = update(), secret = env.TELEGRAM_WEBHOOK_SECRET) => new Request('https://tino.test/api/traffic-report', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': secret }, body: JSON.stringify(body)
});
const sample = { users: 12, sessions: 15, views: 34, pages: [{ path: '/gioi-thieu/', views: 10 }] };
const read = async periods => periods.map(() => sample);
const never = async () => assert.fail('must not contact provider');
const now = new Date('2026-10-29T01:00:00Z');

test('Vietnam date ranges handle midnight, month/year rollover and leap years', () => {
  assert.equal(reportPeriods(new Date('2027-01-01T01:00:00Z'), 'thangtruoc')[0].start, '2026-12-01');
  assert.equal(reportPeriods(new Date('2027-01-01T01:00:00Z'), 'thangtruoc')[0].end, '2026-12-31');
  assert.equal(reportPeriods(new Date('2028-03-01T01:00:00Z'), 'homqua')[0].start, '2028-02-29');
  assert.equal(reportPeriods(new Date('2026-10-28T18:00:00Z'), 'homnay')[0].start, '2026-10-29');
  assert.deepEqual(reportPeriods(now, 'thang')[0], { label: 'THÁNG NÀY (ĐẾN HIỆN TẠI)', start: '2026-10-01', end: '2026-10-29' });
});

test('webhook fails closed with absent, short or incorrect secret', async () => {
  for (const patch of [{}, { TELEGRAM_WEBHOOK_SECRET: undefined }, { TELEGRAM_WEBHOOK_SECRET: 'short' }]) {
    assert.equal((await handleTrafficReport(request(update(), 'wrong'), { ...env, ...patch }, never, never)).status, 401);
  }
  assert.equal((await handleTrafficReport(new Request('https://tino.test/api/traffic-report'), env, never, never)).status, 405);
});

test('ignores other users, group chats, edited messages, plain text, files and unknown commands', async () => {
  for (const body of [update('/baocao', 333), { message: { ...update().message, chat: { id: 111, type: 'group' } } },
    { edited_message: update().message }, update('xin chào'), update('/unknown'),
    { message: { ...update().message, text: undefined } },
    { message: { ...update().message, from: { id: 222 } } }]) {
    const response = await handleTrafficReport(request(body), env, never, never);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ignored, true);
  }
});

test('each of the two users receives only their own command reply', async () => {
  for (const id of [111, 222]) {
    const sent = [];
    const response = await handleTrafficReport(request(update('/baocao', id)), env, read, async (_url, options) => {
      sent.push(JSON.parse(options.body));
      return Response.json({ ok: true });
    }, now);
    assert.equal(response.status, 200);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].chat_id, String(id));
    assert.match(sent[0].text, /Người truy cập: 12/);
    assert.match(sent[0].text, /Lượt xem trang: 34/);
    assert.equal(sent[0].parse_mode, undefined);
  }
});

test('single-period commands request only the selected period', async () => {
  for (const command of ['homnay', 'homqua', 'thang', 'thangtruoc']) {
    const response = await handleTrafficReport(request(update('/' + command)), env, async periods => {
      assert.deepEqual(periods, reportPeriods(now, command));
      assert.equal(periods.length, 1);
      return [sample];
    }, async () => Response.json({ ok: true }), now);
    assert.equal(response.status, 200);
  }
});

test('help/start never query Google and recognize Telegram command suffix', async () => {
  let calls = 0;
  assert.equal((await handleTrafficReport(request(update('/start@tino_bot')), env, never, async (_url, options) => {
    assert.match(JSON.parse(options.body).text, /\/homnay/);
    calls++;
    return Response.json({ ok: true });
  })).status, 200);
  assert.equal(calls, 1);
});

test('requires two distinct private account IDs', async () => {
  for (const id of [undefined, '111', '-123']) {
    assert.equal((await handleTrafficReport(request(), { ...env, TELEGRAM_REPORT_CHAT_ID_2: id }, never, never)).status, 503);
  }
});

test('missing Google config or upstream failure returns an honest reply without false zero counts', async () => {
  for (const [config, provider] of [[{ ...env, GA4_PRIVATE_KEY: '' }, never], [env, async () => { throw new Error('test-only secret'); }]]) {
    const response = await handleTrafficReport(request(), config, provider, async (_url, options) => {
      const { text } = JSON.parse(options.body);
      assert.doesNotMatch(text, /Người truy cập:|test-only secret/);
      assert.match(text, /Google Analytics/);
      return Response.json({ ok: true });
    }, now);
    assert.equal(response.status, 200);
  }
});

test('Telegram HTTP failure, rejection and thrown errors never report successful delivery', async () => {
  for (const send of [async () => Response.json({ ok: true }, { status: 500 }), async () => Response.json({ ok: false }),
    async () => { throw new Error('dummy-token'); }]) {
    const response = await handleTrafficReport(request(), env, read, send, now);
    assert.equal(response.status, 502);
    assert.equal((await response.text()).includes('dummy-token'), false);
  }
});

test('rejects invalid or oversized webhook JSON before querying Google', async () => {
  for (const body of [null, [], 'x'.repeat(33000)]) {
    assert.equal((await handleTrafficReport(request(body), env, never, never)).status, 400);
  }
});

test('rejects a non-JSON media type and cancels a stalled authenticated body', async t => {
  const wrongType = new Request('https://tino.test/api/traffic-report', {
    method: 'POST', headers: {
      'content-type': 'application/json-malformed',
      'x-telegram-bot-api-secret-token': env.TELEGRAM_WEBHOOK_SECRET
    }, body: '{}'
  });
  assert.equal((await handleTrafficReport(wrongType, env, never, never)).status, 415);
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let cancelled = false;
  const incoming = new Request('https://tino.test/api/traffic-report', {
    method: 'POST', headers: {
      'content-type': 'application/json',
      'x-telegram-bot-api-secret-token': env.TELEGRAM_WEBHOOK_SECRET
    }, body: new ReadableStream({ cancel() { cancelled = true; } }), duplex: 'half'
  });
  const pending = handleTrafficReport(incoming, env, never, never);
  t.mock.timers.tick(5000);
  assert.equal((await pending).status, 400);
  assert.equal(cancelled, true);
});

test('uses read-only Google scope, real monthly aggregates and both live hostnames', async t => {
  t.mock.method(JWT.prototype, 'getAccessToken', async function () {
    assert.deepEqual(this.scopes, ['https://www.googleapis.com/auth/analytics.readonly']);
    return { token: 'test-access-token' };
  });
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://analyticsdata.googleapis.com/v1beta/properties/123456:batchRunReports');
    assert.equal(options.headers.Authorization, 'Bearer test-access-token');
    const { requests } = JSON.parse(options.body);
    assert.equal(requests.length, 4);
    assert.deepEqual(requests[2].dateRanges, [{ startDate: '2026-10-01', endDate: '2026-10-29' }]);
    assert.equal(requests[2].dimensions, undefined);
    assert.deepEqual(requests[0].dimensionFilter.filter.inListFilter.values, ['vesinhtino.com', 'www.vesinhtino.com']);
    return Response.json({ reports: requests.map((request, index) => ({
      metadata: { timeZone: 'Asia/Ho_Chi_Minh' }, metricHeaders: request.metrics,
      rows: index % 2 === 0 ? [{ metricValues: [{ value: '12' }, { value: '15' }, { value: '34' }] }]
        : [{ dimensionValues: [{ value: '/' }], metricValues: [{ value: '34' }] }]
    })) });
  });
  const result = await readTraffic(reportPeriods(now), env);
  assert.equal(result[1].users, 12);
  assert.deepEqual(result[0].pages, [{ path: '/', views: 34 }]);
});

test('rejects GA timezone mismatch', async t => {
  t.mock.method(JWT.prototype, 'getAccessToken', async () => ({ token: 'test-access-token' }));
  t.mock.method(globalThis, 'fetch', async () => Response.json({ reports: Array.from({ length: 4 }, () => ({
    metadata: { timeZone: 'America/Los_Angeles' }, metricHeaders: [], rows: []
  })) }));
  await assert.rejects(readTraffic(reportPeriods(now), env), error => error.code === 'GA4_TIMEZONE');
});

test('accepts Google empty dimensionless reports without presenting invented zero counts', async t => {
  t.mock.method(JWT.prototype, 'getAccessToken', async () => ({ token: 'test-access-token' }));
  const emptySummary = { kind: 'analyticsData#runReport', metadata: { currencyCode: 'VND', timeZone: 'Asia/Ho_Chi_Minh' } };
  const emptyPages = { ...emptySummary, dimensionHeaders: [{ name: 'pagePath' }], metricHeaders: [{ name: 'screenPageViews' }] };
  const provider = t.mock.method(globalThis, 'fetch', async () => Response.json({ reports: [emptySummary, emptyPages] }));
  const stats = await readTraffic(reportPeriods(now, 'homnay'), env);
  assert.equal(stats[0].empty, true);
  await handleTrafficReport(request(update('/homnay')), env, async () => stats, async (_url, options) => {
    const text = JSON.parse(options.body).text;
    assert.match(text, /GA4 chưa có dữ liệu/);
    assert.doesNotMatch(text, /Người truy cập:|Phiên truy cập:|Lượt xem trang:|GA4_RESPONSE/);
    return Response.json({ ok: true });
  });
  for (const malformed of [{ ...emptySummary, kind: 'unknown' }, { ...emptySummary, rowCount: 1 },
    { ...emptySummary, rows: [{ metricValues: [{ value: '1' }] }] }, { ...emptySummary, totals: [{}] }]) {
    provider.mock.mockImplementation(async () => Response.json({ reports: [malformed, emptyPages] }));
    await assert.rejects(readTraffic(reportPeriods(now, 'homnay'), env), error => error.code === 'GA4_RESPONSE');
  }
  provider.mock.mockImplementation(async () => Response.json({ reports: [emptySummary, {
    ...emptyPages, rows: [{ dimensionValues: [{ value: '/' }], metricValues: [{ value: '5' }] }]
  }] }));
  await assert.rejects(readTraffic(reportPeriods(now, 'homnay'), env), error => error.code === 'GA4_RESPONSE');
});

test('accepts PEM, escaped newlines, JSON strings and matching downloaded key JSON', () => {
  for (const value of [fixtureKey, fixtureKey.replaceAll('\n', '\\n'), JSON.stringify(fixtureKey),
    '"private_key": ' + JSON.stringify(fixtureKey) + ',',
    JSON.stringify({ private_key: fixtureKey, client_email: env.GA4_CLIENT_EMAIL })]) {
    assert.equal(normalizeAnalyticsKey(value, env.GA4_CLIENT_EMAIL), fixtureKey.trim());
  }
  for (const value of ['key-id-only', '"unfinished', JSON.stringify({ private_key: fixtureKey, client_email: 'other@example.invalid' })]) {
    assert.throws(() => normalizeAnalyticsKey(value, env.GA4_CLIENT_EMAIL), error => error.code === 'GA4_KEY');
  }
});

test('authorized owners get only predefined safe diagnostics, without false counts', async () => {
  for (const code of ['GA4_KEY', 'GA4_AUTH', 'GA4_ACCESS', 'GA4_API_DISABLED', 'GA4_TIMEZONE', 'GA4_NETWORK']) {
    const response = await handleTrafficReport(request(), env, async () => { throw new AnalyticsReadError(code); }, async (_url, options) => {
      const text = JSON.parse(options.body).text;
      assert.ok(text.includes(code));
      assert.doesNotMatch(text, /Người truy cập:|test-access-token/);
      assert.equal(text.includes(fixtureKey), false);
      return Response.json({ ok: true });
    });
    assert.equal(response.status, 200);
  }
});

test('distinguishes Google auth, access, disabled API and network failures safely', async t => {
  const auth = t.mock.method(JWT.prototype, 'getAccessToken', async () => ({ token: 'test-access-token' }));
  const provider = t.mock.method(globalThis, 'fetch', async () => Response.json({ error: {} }, { status: 403 }));
  await assert.rejects(readTraffic(reportPeriods(now), env), error => error.code === 'GA4_ACCESS');
  provider.mock.mockImplementation(async () => Response.json({ error: { details: [{ reason: 'SERVICE_DISABLED' }] } }, { status: 403 }));
  await assert.rejects(readTraffic(reportPeriods(now), env), error => error.code === 'GA4_API_DISABLED');
  provider.mock.mockImplementation(async () => { throw new Error('test-access-token'); });
  await assert.rejects(readTraffic(reportPeriods(now), env), error => error.code === 'GA4_NETWORK');
  auth.mock.mockImplementation(async () => { throw { response: { status: 400, data: { error: 'invalid_grant' } }, message: fixtureKey }; });
  await assert.rejects(readTraffic(reportPeriods(now), env), error => error.code === 'GA4_AUTH' && !error.message.includes(fixtureKey));
});

test('production GA4 diagnostic is read-only, skips previews and returns no secret or metrics', async () => {
  assert.deepEqual(await checkAnalyticsConnection({ ...env, VERCEL: '1', VERCEL_ENV: 'preview' }, never), { skipped: true });
  const production = { ...env, VERCEL: '1', VERCEL_ENV: 'production' };
  assert.deepEqual(await checkAnalyticsConnection(production, async periods => {
    assert.equal(periods.length, 1);
    assert.match(periods[0].start, /^\d{4}-\d{2}-\d{2}$/);
    return [sample];
  }), { ok: true });
  assert.deepEqual(await checkAnalyticsConnection(production, async () => { throw new AnalyticsReadError('GA4_TIMEZONE'); }), { ok: false, code: 'GA4_TIMEZONE' });
  const unknown = await checkAnalyticsConnection(production, async () => { throw new Error(fixtureKey); });
  assert.deepEqual(unknown, { ok: false, code: 'GA4_RESPONSE' });
  assert.equal(JSON.stringify(unknown).includes(fixtureKey), false);
});

test('emitted Vercel entry loads with explicit ESM extensions', async () => {
  const root = path.resolve('qa', `traffic-runtime-${Date.now()}`);
  fs.mkdirSync(path.join(root, 'api'), { recursive: true });
  fs.mkdirSync(path.join(root, 'server'), { recursive: true });
  fs.copyFileSync('server/analytics-errors.mjs', path.join(root, 'server/analytics-errors.mjs'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ type: 'module' }));
  for (const name of ['api/traffic-report', 'server/traffic-report', 'server/analytics-data']) {
    const { outputText } = ts.transpileModule(fs.readFileSync(`${name}.ts`, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
    });
    fs.writeFileSync(path.join(root, `${name}.js`), outputText);
  }
  const { default: entry } = await import(pathToFileURL(path.join(root, 'api/traffic-report.js')).href);
  assert.equal((await entry.fetch(new Request('https://tino.test/api/traffic-report'))).status, 405);
});
