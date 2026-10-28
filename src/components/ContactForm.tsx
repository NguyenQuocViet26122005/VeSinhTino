'use client';

import React, { useState, useEffect } from 'react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Vệ sinh nhà ở & Căn hộ',
    notes: '',
    area: ''
  });

  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Listen for prefill events from CostEstimator or AuthenticShowcase
  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const customEvent = e as CustomEvent<{
        serviceName?: string;
        quantity?: string;
        estimateText?: string;
      }>;
      if (customEvent.detail) {
        setFormData(prev => ({
          ...prev,
          service: customEvent.detail.serviceName || prev.service,
          area: customEvent.detail.quantity || prev.area,
          notes: customEvent.detail.estimateText
            ? `Ước tính: ${customEvent.detail.estimateText}. Cần Tino khảo sát và báo giá trọn gói.`
            : prev.notes
        }));
      }
    };

    window.addEventListener('tino:prefill-contact', handlePrefill);
    return () => window.removeEventListener('tino:prefill-contact', handlePrefill);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Honeypot check: silent return for bots
    if (honeypot) {
      setSubmitted(true);
      return;
    }

    if (!formData.phone.trim()) {
      alert('Vui lòng nhập số điện thoại hoặc Zalo để Tino tiện liên hệ hỗ trợ bạn!');
      return;
    }

    // 2. Client-side rate-limit cooldown (prevents rapid-fire bot/spam clicks)
    const now = Date.now();
    const lastSubmit = Number(localStorage.getItem('tino_contact_timestamp') || '0');
    if (now - lastSubmit < 25000) {
      alert('Yêu cầu của bạn đã được ghi nhận. Vui lòng đợi trong giây lát trước khi gửi tiếp!');
      return;
    }

    setSubmitting(true);

    const escapeHtml = (s: string = '') =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // 3. First attempt: call secure serverless endpoint /api/contact (Cloudflare Pages Functions)
    let serverSent = false;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          service: formData.service,
          area: formData.area,
          notes: formData.notes,
          honeypot
        })
      });
      if (res.ok) {
        serverSent = true;
      }
    } catch {
      // In local dev without Cloudflare adapter, endpoint might not be active
    }

    // 4. Fallback for static dev environments
    if (!serverSent) {
      const telegramText = `🔔 <b>CÓ YÊU CẦU BÁO GIÁ MỚI - VỆ SINH TINO</b>

👤 <b>Khách hàng:</b> ${escapeHtml(formData.name) || 'Khách hàng ẩn danh'}
📞 <b>Số điện thoại / Zalo:</b> ${escapeHtml(formData.phone)}
🧹 <b>Dịch vụ quan tâm:</b> ${escapeHtml(formData.service)}
📐 <b>Diện tích / Khối lượng:</b> ${escapeHtml(formData.area) || 'Chưa cung cấp'}
📝 <b>Ghi chú hiện trạng:</b> ${escapeHtml(formData.notes) || 'Không có'}

⏰ <i>Thời gian gửi: ${new Date().toLocaleString('vi-VN')}</i>`;

      try {
        await fetch('https://api.telegram.org/bot9244077221:AAGzzv0mqr10Kq4prUqz4nSiln41twpJWb4/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: '5193894351',
            text: telegramText,
            parse_mode: 'HTML'
          })
        });
      } catch (err) {
        console.error('Lỗi gửi Telegram:', err);
      }
    }

    try {
      localStorage.setItem('tino_contact_timestamp', String(Date.now()));
    } catch {
      // Ignore storage errors in private browsing
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="contact-smart-section">
      <div className="contact-smart-card">
        <div className="contact-smart-left">
          <span className="contact-kicker">TIẾP NHẬN YÊU CẦU 24/7</span>
          <h3 className="contact-main-heading">Cùng Tino làm sạch không gian của bạn.</h3>
          <p className="contact-desc">
            Khảo sát thực tế tận nơi tại TP.HCM trong 2 giờ. Báo giá trọn gói minh bạch, không phát sinh chi phí sau khi thống nhất.
          </p>

          <div className="contact-channels">
            <a href="tel:0925649666" className="channel-box hotline-box">
              <div className="channel-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="channel-info">
                <small>Hotline tư vấn nhanh</small>
                <strong>0925 649 666</strong>
              </div>
              <span className="channel-badge">Gọi ngay</span>
            </a>

            <a
              href="https://zalo.me/0925649666"
              target="_blank"
              rel="noopener noreferrer"
              className="channel-box zalo-box"
            >
              <div className="channel-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="channel-info">
                <small>Chat Zalo nhận báo giá</small>
                <strong>Gửi ảnh / video công trình</strong>
              </div>
              <span className="channel-badge zalo-badge">Chat Zalo</span>
            </a>
          </div>

          <div className="contact-commitments">
            <div className="commitment-item">
              <span className="commit-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>Khảo sát & tư vấn miễn phí tận nơi</span>
            </div>
            <div className="commitment-item">
              <span className="commit-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>Hóa chất sinh học an toàn sức khỏe</span>
            </div>
            <div className="commitment-item">
              <span className="commit-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>Khách hài lòng nghiệm thu mới thanh toán</span>
            </div>
          </div>
        </div>

        <div className="contact-smart-right">
          {submitted ? (
            <div className="contact-success-state">
              <div className="success-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h4>Đã gửi yêu cầu thành công!</h4>
              <p>
                Thông tin của bạn đã được chuyển thẳng tới hệ thống kỹ thuật Vệ Sinh Tino. Chúng tôi sẽ gọi lại hoặc phản hồi qua Zalo trong vòng 5–10 phút!
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
                <a
                  href={`https://zalo.me/0925649666?text=${encodeURIComponent(
                    `Chào Tino, tôi là ${formData.name || 'khách hàng'} (${formData.phone}), vừa gửi yêu cầu khảo sát dịch vụ ${formData.service}. Nhờ Tino tư vấn và hỗ trợ sớm giúp tôi!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button"
                  style={{ minHeight: '46px', padding: '10px 22px', fontSize: '13.5px' }}
                >
                  Mở Zalo gửi ảnh hiện trạng <span aria-hidden="true">↗</span>
                </a>
                <button
                  type="button"
                  className="button light reset-form-btn"
                  onClick={() => setSubmitted(false)}
                >
                  Gửi thêm yêu cầu khác
                </button>
              </div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              {/* Anti-spam honeypot trap for automated bots */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor="company_website_url">Bỏ trống trường này</label>
                <input
                  id="company_website_url"
                  type="text"
                  name="company_website_url"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <h4 className="form-title">Để lại thông tin nhận tư vấn</h4>
              <p className="form-sub">Tino sẽ gọi lại hoặc phản hồi qua Zalo trong 5–10 phút.</p>

              <div className="form-field">
                <label htmlFor="user-name">Họ và tên của bạn:</label>
                <input
                  id="user-name"
                  type="text"
                  placeholder="Ví dụ: Anh Tuấn / Chị Lan"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="user-phone">Số điện thoại / Zalo (*):</label>
                <input
                  id="user-phone"
                  type="tel"
                  required
                  placeholder="Ví dụ: 0925 649 666"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="user-service">Dịch vụ bạn cần:</label>
                  <select
                    id="user-service"
                    value={formData.service}
                    onChange={e => setFormData({ ...formData, service: e.target.value })}
                    className="form-select"
                  >
                    <option value="Vệ sinh nhà ở & Căn hộ">Vệ sinh nhà ở & Căn hộ</option>
                    <option value="Vệ sinh công nghiệp sau xây dựng">Vệ sinh công nghiệp sau xây dựng</option>
                    <option value="Vệ sinh kho & Nhà xưởng">Vệ sinh kho & Nhà xưởng</option>
                    <option value="Vệ sinh kính tòa nhà cao tầng">Vệ sinh kính tòa nhà cao tầng</option>
                    <option value="Giặt ghế sofa & Nệm tại nhà">Giặt ghế sofa & Nệm tại nhà</option>
                    <option value="Giặt thảm văn phòng">Giặt thảm văn phòng</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="user-area">Diện tích dự kiến:</label>
                  <input
                    id="user-area"
                    type="text"
                    placeholder="VD: 85m² hoặc 1 bộ"
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="user-notes">Ghi chú hiện trạng hoặc địa chỉ:</label>
                <textarea
                  id="user-notes"
                  rows={2}
                  placeholder="VD: Nhà mới sửa xong nhiều bụi xi măng, cần làm vào sáng thứ 7..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <button type="submit" disabled={submitting} className="button form-submit-btn">
                {submitting ? 'Đang kết nối...' : 'Gửi yêu cầu khảo sát & báo giá'}
                <span aria-hidden="true">↗</span>
              </button>
              <p className="form-disclaimer">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ verticalAlign: '-1px', marginRight: '5px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Cam kết bảo mật thông tin liên hệ. Không làm phiền sau khi tư vấn.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
