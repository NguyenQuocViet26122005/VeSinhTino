// Server-only. Reports are requested by allowed users through a Telegram webhook.
import { timingSafeEqual } from 'node:crypto';
import { analyticsHints, AnalyticsReadError } from './analytics-errors.mjs';
import { botCommands } from './telegram-commands.mjs';
export { AnalyticsReadError } from './analytics-errors.mjs';
export interface TrafficEnv {
  TELEGRAM_WEBHOOK_SECRET?: string;
  GA4_PROPERTY_ID?: string;
  GA4_STREAM_ID?: string;
  GA4_CLIENT_EMAIL?: string;
  GA4_PRIVATE_KEY?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TELEGRAM_REPORT_CHAT_ID_2?: string;
}
export interface ReportPeriod { label: string; start: string; end: string }
export interface TrafficStats { users: number; sessions: number; views: number; empty?: boolean; pages: { path: string; views: number }[] }
export type ReadTraffic = (periods: ReportPeriod[], env: TrafficEnv) => Promise<TrafficStats[]>;
export interface RealtimeStats { users: number; views: number; empty?: boolean }
export type ReadRealtime = (env: TrafficEnv) => Promise<RealtimeStats>;

export function reportPeriods(now: Date, command = 'baocao'): ReportPeriod[] {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find(part => part.type === type)!.value);
  const today = new Date(Date.UTC(value('year'), value('month') - 1, value('day')));
  const yesterday = new Date(today.getTime() - 86_400_000);
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const lastMonthEnd = new Date(monthStart.getTime() - 86_400_000);
  const lastMonthStart = new Date(Date.UTC(lastMonthEnd.getUTCFullYear(), lastMonthEnd.getUTCMonth(), 1));
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  const day = { label: 'HÔM NAY', start: iso(today), end: iso(today) };
  const month = { label: 'THÁNG NÀY (ĐẾN HIỆN TẠI)', start: iso(monthStart), end: iso(today) };
  if (command === 'homnay') return [day];
  if (command === 'homqua') return [{ label: 'HÔM QUA', start: iso(yesterday), end: iso(yesterday) }];
  if (command === 'thang') return [month];
  if (command === 'thangtruoc') return [{ label: 'THÁNG TRƯỚC', start: iso(lastMonthStart), end: iso(lastMonthEnd) }];
  return [day, month];
}

function reportMessage(periods: ReportPeriod[], stats: TrafficStats[]): string {
  if (stats.length !== periods.length) throw new Error('incomplete report');
  const number = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
  return ['BÁO CÁO TRUY CẬP — VỆ SINH TINO', 'vesinhtino.com', '', ...periods.flatMap((period, index) => {
    const result = stats[index];
    if (![result.users, result.sessions, result.views, ...result.pages.map(page => page.views)].every(n => Number.isFinite(n) && n >= 0)) {
      throw new Error('invalid metrics');
    }
    if (result.empty) return [period.label, `${period.start} → ${period.end}`,
      'GA4 chưa có dữ liệu cho khoảng thời gian này. Số liệu có thể đang được xử lý.', ''];
    return [period.label, `${period.start} → ${period.end}`,
      `Người truy cập: ${number(result.users)}`, `Phiên truy cập: ${number(result.sessions)}`,
      `Lượt xem trang: ${number(result.views)}`, 'Trang được xem nhiều:',
      ...(result.pages.length ? result.pages.slice(0, 5).map(page => `• ${page.path.slice(0, 150)}: ${number(page.views)}`) : ['• Chưa có lượt xem được ghi nhận.']), ''];
  }), 'Múi giờ: Việt Nam. Nguồn: Google Analytics 4.',
  'Số liệu chưa phải thời gian thực, có thể cập nhật lại trong 24–48 giờ và thiếu lượt dùng trình chặn theo dõi.'].join('\n');
}

function realtimeMessage(stats: RealtimeStats, now: Date): string {
  if (![stats.users, stats.views].every(value => Number.isSafeInteger(value) && value >= 0)) throw new AnalyticsReadError('GA4_RESPONSE');
  const number = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
  const requestedAt = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'medium'
  }).format(now);
  return ['BÁO CÁO THỜI GIAN THỰC — VỆ SINH TINO', 'vesinhtino.com', '', '30 PHÚT GẦN NHẤT',
    ...(stats.empty ? ['GA4 chưa ghi nhận hoạt động trong khoảng thời gian này.']
      : [`Người hoạt động (30 phút): ${number(stats.users)}`, `Lượt xem trang (30 phút): ${number(stats.views)}`]),
    '', `Lúc yêu cầu: ${requestedAt} (giờ Việt Nam)`,
    'Nguồn: Google Analytics 4 Realtime. Đếm người hoạt động trong 30 phút gần nhất; một người có thể tạo nhiều lượt xem.',
    'Số liệu có thể chậm vài phút và thiếu lượt dùng trình chặn theo dõi.'].join('\n');
}

const help = ['LỆNH XEM TRUY CẬP TINO', ...botCommands.filter(item => !['start', 'help'].includes(item.command))
  .map(item => `/${item.command} — ${item.description}`),
  'Bot chỉ trả báo cáo khi bạn gõ lệnh.'].join('\n');
const json = (status: number, body: Record<string, unknown>) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});

function sameSecret(received: string, expected: string): boolean {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function readUpdate(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('empty body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; void reader.cancel().catch(() => {}); }, 5000);
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 32768) { await reader.cancel(); throw new Error('oversized update'); }
      chunks.push(part.value);
    }
    if (timedOut) throw new Error('slow update');
  } finally {
    clearTimeout(timeout);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

interface TelegramUpdate {
  message?: { text?: unknown; chat?: { id?: unknown; type?: unknown }; from?: { id?: unknown; is_bot?: unknown } };
}

export async function handleTrafficReport(request: Request, env: TrafficEnv, readTraffic: ReadTraffic,
  send: typeof fetch = fetch, now = new Date(), readRealtime?: ReadRealtime): Promise<Response> {
  if (request.method !== 'POST') return json(405, { ok: false });
  const secret = env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!secret || !/^[A-Za-z0-9_-]{32,256}$/.test(secret) || !sameSecret(request.headers.get('x-telegram-bot-api-secret-token') ?? '', secret)) {
    return json(401, { ok: false });
  }
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json(415, { ok: false });
  let update: TelegramUpdate;
  try {
    const data = await readUpdate(request);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid update');
    update = data as TelegramUpdate;
  } catch { return json(400, { ok: false }); }

  const message = update.message;
  const chatId = String(message?.chat?.id ?? '');
  const allowed = [env.TELEGRAM_CHAT_ID?.trim(), env.TELEGRAM_REPORT_CHAT_ID_2?.trim()];
  // Ignore groups, other accounts, edited messages, files and ordinary conversation.
  if (message?.chat?.type !== 'private' || message.from?.is_bot === true ||
    String(message.from?.id ?? '') !== chatId || !/^[1-9]\d{0,19}$/.test(chatId) || !allowed.includes(chatId)) {
    return json(200, { ok: true, ignored: true });
  }
  const command = typeof message.text === 'string'
    ? /^\/(baocao|homnay|homqua|thang|thangtruoc|tructiep|start|help)(?:@[A-Za-z0-9_]+)?\s*$/i.exec(message.text)?.[1].toLowerCase() : undefined;
  if (!command) return json(200, { ok: true, ignored: true });
  if (!env.TELEGRAM_BOT_TOKEN?.trim() || allowed.some(id => !id || !/^[1-9]\d{0,19}$/.test(id)) || allowed[0] === allowed[1]) {
    return json(503, { ok: false, error: 'Reporting configuration incomplete.' });
  }
  let text = help;
  if (!['start', 'help'].includes(command)) {
    if (!/^\d+$/.test(env.GA4_PROPERTY_ID || '') || !env.GA4_CLIENT_EMAIL?.trim() || !env.GA4_PRIVATE_KEY?.trim()) {
      text = 'Báo cáo truy cập chưa kết nối Google Analytics. Vui lòng hoàn tất cấu hình GA4.';
    } else {
      try {
        if (command === 'tructiep') {
          if (!readRealtime) throw new AnalyticsReadError('GA4_RESPONSE');
          text = realtimeMessage(await readRealtime(env), now);
        } else {
          const periods = reportPeriods(now, command);
          text = reportMessage(periods, await readTraffic(periods, env));
        }
      } catch (error) {
        // Provider errors can contain credentials. Never log or return their raw messages.
        text = command === 'tructiep'
          ? 'Chưa lấy được báo cáo thời gian thực của Google Analytics. Vui lòng thử lại sau; chưa thể xác nhận số lượt truy cập.'
          : 'Chưa lấy được số liệu Google Analytics. Vui lòng thử lại sau; chưa thể xác nhận số lượt truy cập.';
        if (error instanceof AnalyticsReadError) {
          text += `\nMã kiểm tra: ${error.code}\n${analyticsHints[error.code]}`;
        }
      }
    }
  }
  try {
    const response = await send(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN!.trim()}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }), signal: AbortSignal.timeout(8000)
    });
    const data = await response.json() as { ok?: boolean };
    if (!response.ok || data.ok !== true) throw new Error('delivery failed');
    return json(200, { ok: true });
  } catch { return json(502, { ok: false, error: 'Telegram reply unavailable.' }); }
}
