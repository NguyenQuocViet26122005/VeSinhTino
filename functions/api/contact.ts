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
      return new Response(JSON.stringify({ ok: false, error: 'Vui lòng cung cấp số điện thoại' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic phone validation (Vietnamese standard)
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    if (!/^(0|\+84)[0-9]{9,10}$/.test(cleanPhone)) {
      return new Response(JSON.stringify({ ok: false, error: 'Số điện thoại không hợp lệ (cần 10 chữ số)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = context.env.TELEGRAM_BOT_TOKEN;
    const chatId = context.env.TELEGRAM_CHAT_ID;

    // If serverless environment variables are not configured, do not expose any secrets
    if (!token || !chatId) {
      console.warn('Telegram environment variables TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured.');
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Hệ thống gửi tự động chưa được cấu hình biến môi trường trên máy chủ. Quý khách vui lòng gọi Hotline 0925 649 666 hoặc liên hệ Zalo.'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

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

    const result = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
    if (!res.ok || !result.ok) {
      console.error('Telegram API error:', result);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Không thể chuyển tiếp yêu cầu đến hệ thống trực ban. Quý khách vui lòng liên hệ trực tiếp qua Hotline 0925 649 666 hoặc Zalo.'
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return new Response(JSON.stringify({ ok: false, error: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
