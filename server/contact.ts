// Server-only. Never import this module into src/ or use PUBLIC_* for secrets.
export interface ContactEnv {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}
const json = (status: number, body: { ok: boolean; error?: string }) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    ...(status === 429 ? { 'Retry-After': '60' } : {}), ...(status === 405 ? { Allow: 'POST' } : {}) } });

// Bounded, per-warm-instance protection; an edge/WAF rule is still needed across instances.
export function createContactGate(now: () => number = Date.now) {
  const entries = new Map<string, { count: number; expires: number }>();
  let active = 0;
  return (key?: string): (() => void) | null => {
    if (active >= 4) return null;
    if (key) {
      const time = now();
      const existing = entries.get(key);
      if (existing && existing.expires > time) {
        if (existing.count >= 5) return null;
        existing.count++;
      } else {
        if (entries.size >= 2048) {
          for (const [id, entry] of entries) if (entry.expires <= time) entries.delete(id);
          if (entries.size >= 2048) return null;
        }
        entries.set(key, { count: 1, expires: time + 60_000 });
      }
    }
    active++;
    let released = false;
    return () => { if (!released) { active--; released = true; } };
  };
}
const acquireContact = createContactGate();

export async function handleContact(request: Request, env: ContactEnv, send: typeof fetch = fetch, clientKey?: string): Promise<Response> {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'Phương thức không được hỗ trợ.' });
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json(403, { ok: false, error: 'Yêu cầu không hợp lệ.' });
  if (request.headers.get('sec-fetch-site') === 'cross-site') return json(403, { ok: false, error: 'Yêu cầu không hợp lệ.' });
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json(415, { ok: false, error: 'Dữ liệu gửi không hợp lệ.' });
  }
  const declaredSize = request.headers.get('content-length');
  if (declaredSize && (!/^\d+$/.test(declaredSize) || Number(declaredSize) > 8192)) {
    return json(413, { ok: false, error: 'Nội dung quá dài. Vui lòng rút gọn ghi chú.' });
  }
  const reader = request.body?.getReader();
  if (!reader) return json(400, { ok: false, error: 'Vui lòng nhập thông tin yêu cầu.' });
  const chunks: Uint8Array[] = [];
  let size = 0;
  let data: Record<string, unknown>;
  let bodyTimedOut = false;
  const bodyTimeout = setTimeout(() => { bodyTimedOut = true; void reader.cancel().catch(() => {}); }, 5000);
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return json(413, { ok: false, error: 'Nội dung quá dài. Vui lòng rút gọn ghi chú.' });
      }
      chunks.push(part.value);
    }
    if (bodyTimedOut) return json(408, { ok: false, error: 'Gửi dữ liệu quá lâu. Vui lòng thử lại.' });
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid body');
    data = parsed as Record<string, unknown>;
  } catch {
    if (bodyTimedOut) return json(408, { ok: false, error: 'Gửi dữ liệu quá lâu. Vui lòng thử lại.' });
    return json(400, { ok: false, error: 'Dữ liệu không hợp lệ. Vui lòng thử lại.' });
  } finally { clearTimeout(bodyTimeout); }
  const limits = { name: 100, phone: 30, service: 150, area: 100, notes: 1500, honeypot: 200 };
  for (const [key, limit] of Object.entries(limits)) {
    if (data[key] !== undefined && (typeof data[key] !== 'string' || (data[key] as string).length > limit)) {
      return json(400, { ok: false, error: 'Thông tin không hợp lệ hoặc quá dài. Vui lòng kiểm tra lại.' });
    }
  }
  if (data.honeypot) return json(400, { ok: false, error: 'Không thể gửi yêu cầu này. Vui lòng liên hệ trực tiếp.' });
  const text = (key: string) => ((data[key] as string | undefined) || '').trim();
  const phone = text('phone').replace(/[\s.-]/g, '');
  if (!/^(?:0|\+84)[0-9]{9}$/.test(phone)) {
    return json(400, { ok: false, error: 'Vui lòng kiểm tra số điện thoại (10 chữ số hoặc dạng +84).' });
  }
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    return json(503, { ok: false, error: 'Form tạm thời chưa sẵn sàng. Vui lòng gọi Hotline hoặc nhắn Zalo bên dưới.' });
  }
  const release = acquireContact(clientKey?.slice(0, 64));
  if (!release) return json(429, { ok: false, error: 'Bạn đang gửi quá nhanh. Vui lòng đợi một lát hoặc liên hệ Hotline / Zalo.' });
  const message = [
    'CÓ YÊU CẦU BÁO GIÁ MỚI - VỆ SINH TINO',
    `Khách hàng: ${text('name') || 'Khách hàng'}`,
    `Số điện thoại / Zalo: ${phone}`,
    `Dịch vụ: ${text('service') || 'Chưa chọn'}`,
    `Diện tích / Khối lượng: ${text('area') || 'Chưa cung cấp'}`,
    `Ghi chú / Địa chỉ: ${text('notes') || 'Không có'}`,
    `Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`
  ].join('\n');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await send(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }), signal: controller.signal
    });
    const result = await response.json().catch(() => null) as { ok?: boolean } | null;
    if (!response.ok || result?.ok !== true) {
      return json(502, { ok: false, error: 'Chưa gửi được yêu cầu đến Tino. Vui lòng thử lại hoặc liên hệ Hotline / Zalo.' });
    }
    return json(200, { ok: true });
  } catch {
    // Provider error URLs can contain the token: do not log or return them.
    return json(504, { ok: false, error: 'Chưa xác nhận được việc gửi yêu cầu. Vui lòng liên hệ Hotline / Zalo để kiểm tra.' });
  } finally { clearTimeout(timeout); release(); }
}
