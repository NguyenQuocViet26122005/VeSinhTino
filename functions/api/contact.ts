interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const data = await context.request.json() as {
      name?: string;
      phone?: string;
      service?: string;
      area?: string;
      notes?: string;
      honeypot?: string;
    };

    const { name, phone, service, area, notes, honeypot } = data;

    // Honeypot anti-spam check: if bot filled this hidden field, return success silently
    if (honeypot) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return new Response(JSON.stringify({ ok: false, error: 'Thiếu số điện thoại' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = context.env.TELEGRAM_BOT_TOKEN || '9244077221:AAGzzv0mqr10Kq4prUqz4nSiln41twpJWb4';
    const chatId = context.env.TELEGRAM_CHAT_ID || '5193894351';

    const escapeHtml = (s: string = '') =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const telegramText = `🔔 <b>CÓ YÊU CẦU BÁO GIÁ MỚI - VỆ SINH TINO</b>\n\n👤 <b>Khách hàng:</b> ${escapeHtml(name) || 'Khách hàng ẩn danh'}\n📞 <b>Số điện thoại / Zalo:</b> ${escapeHtml(phone)}\n🧹 <b>Dịch vụ quan tâm:</b> ${escapeHtml(service || 'Chưa chọn')}\n📐 <b>Diện tích / Khối lượng:</b> ${escapeHtml(area) || 'Chưa cung cấp'}\n📝 <b>Ghi chú hiện trạng:</b> ${escapeHtml(notes) || 'Không có'}\n\n⏰ <i>Thời gian gửi: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</i>`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: 'HTML'
      })
    });

    const result = await res.json();
    return new Response(JSON.stringify({ ok: res.ok, result }), {
      status: res.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
