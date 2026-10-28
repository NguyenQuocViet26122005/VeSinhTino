'use client';

import React, { useState, useEffect } from 'react';

const SERVICE_ID_TO_NAME: Record<string, string> = {
  'dich-vu-ve-sinh-cong-nghiep': 'Tổng vệ sinh nhà sau xây dựng',
  've-sinh-nha-sau-xay': 'Tổng vệ sinh nhà sau xây dựng',
  've-sinh-chung-cu': 'Tổng vệ sinh chung cư trọn gói',
  've-sinh-nha-o': 'Vệ sinh nhà ở & Nhà cũ',
  've-sinh-nha-cu': 'Vệ sinh nhà ở & Nhà cũ',
  've-sinh-nha-xuong': 'Vệ sinh kho & Nhà xưởng',
  've-sinh-kinh-toa-nha': 'Vệ sinh kính tòa nhà cao tầng',
  'dich-vu-giat-ghe-sofa': 'Giặt ghế sofa & Nệm tại nhà',
  'dich-vu-giat-tham': 'Giặt thảm văn phòng',
  apartment: 'Tổng vệ sinh chung cư trọn gói',
  home: 'Vệ sinh nhà ở & Nhà cũ',
  factory: 'Vệ sinh kho & Nhà xưởng',
  glass: 'Vệ sinh kính tòa nhà cao tầng',
  furnishing: 'Giặt ghế sofa & Nệm tại nhà',
  floor: 'Tổng vệ sinh nhà sau xây dựng'
};

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Tổng vệ sinh nhà sau xây dựng',
    notes: '',
    area: ''
  });

  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Listen for prefill events from CostEstimator or AuthenticShowcase
  useEffect(() => {
    const applyPrefill = (detail: {
      serviceName?: string;
      serviceId?: string;
      quantity?: string;
      estimateText?: string;
    }) => {
      const targetService =
        (detail.serviceId && SERVICE_ID_TO_NAME[detail.serviceId]) ||
        detail.serviceName;
      setFormData(prev => ({
        ...prev,
        service: targetService || prev.service,
        area: detail.quantity || prev.area,
        notes: detail.estimateText
          ? `Ghi chú: ${detail.estimateText}`
          : prev.notes
      }));
    };

    // Check if there was an earlier event before hydration
    if (typeof window !== 'undefined' && (window as unknown as { __tino_pending_prefill?: unknown }).__tino_pending_prefill) {
      applyPrefill((window as unknown as { __tino_pending_prefill: Parameters<typeof applyPrefill>[0] }).__tino_pending_prefill);
      delete (window as unknown as { __tino_pending_prefill?: unknown }).__tino_pending_prefill;
    }

    const handlePrefill = (e: Event) => {
      const customEvent = e as CustomEvent<{
        serviceName?: string;
        serviceId?: string;
        quantity?: string;
        estimateText?: string;
      }>;
      if (customEvent.detail) {
        applyPrefill(customEvent.detail);
      }
    };

    window.addEventListener('tino:prefill-contact', handlePrefill);
    return () => window.removeEventListener('tino:prefill-contact', handlePrefill);
  }, []);

  const buildZaloUrl = () => {
    const lines = [
      `Chào Tino, tôi cần tư vấn & báo giá dịch vụ vệ sinh:`,
      `• Khách hàng: ${formData.name.trim() || 'Khách hàng'}`,
      `• Số điện thoại / Zalo: ${formData.phone.trim()}`,
      `• Dịch vụ: ${formData.service}`,
      formData.area.trim() ? `• Khối lượng / Diện tích: ${formData.area.trim()}` : null,
      formData.notes.trim() ? `• Ghi chú / Địa chỉ: ${formData.notes.trim()}` : null,
      `Nhờ Tino tư vấn và hỗ trợ sớm giúp tôi nhé!`
    ].filter(Boolean);

    return `https://zalo.me/0925649666?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Honeypot check: silent return for bots
    if (honeypot) {
      setSubmitted(true);
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại hoặc Zalo để Tino tiện liên hệ hỗ trợ bạn!');
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s.-]/g, '');
    if (!/^(0|\+84)[0-9]{9,10}$/.test(cleanPhone)) {
      setErrorMessage('Số điện thoại chưa đúng định dạng (cần 10 chữ số). Vui lòng kiểm tra lại!');
      return;
    }

    setSubmitting(true);

    try {
      localStorage.setItem('tino_contact_timestamp', String(Date.now()));
    } catch {
      // Ignore local storage error
    }

    const zaloUrl = buildZaloUrl();

    // Direct open Zalo in a new tab / native app
    try {
      window.open(zaloUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // If browser blocks popup, user can tap the prominent Zalo button on the success screen
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
            <a href="tel:0925649666" className="channel-box phone-box">
              <div className="channel-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="channel-info">
                <small>Tư vấn & Khảo sát miễn phí</small>
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
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h4>Yêu cầu đã chuyển tới Zalo!</h4>
              <p>
                Tino đã tạo sẵn nội dung yêu cầu của bạn. Ứng dụng Zalo sẽ tự động mở để bạn gửi thông tin & hình ảnh hiện trạng thực tế.
              </p>

              {/* Summary of submitted details */}
              <div className="success-summary-box">
                <div className="summary-row">
                  <span className="summary-label">Khách hàng:</span>
                  <strong>{formData.name.trim() || 'Khách hàng'} ({formData.phone.trim()})</strong>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Dịch vụ:</span>
                  <span>{formData.service}</span>
                </div>
                {formData.area.trim() && (
                  <div className="summary-row">
                    <span className="summary-label">Diện tích / Khối lượng:</span>
                    <span>{formData.area.trim()}</span>
                  </div>
                )}
                {formData.notes.trim() && (
                  <div className="summary-row">
                    <span className="summary-label">Ghi chú / Địa chỉ:</span>
                    <span>{formData.notes.trim()}</span>
                  </div>
                )}
              </div>

              <div className="success-actions">
                <a
                  href={buildZaloUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button success-zalo-btn"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Mở Zalo gửi ảnh & nhận báo giá (0925 649 666) ↗
                </a>

                <div className="success-secondary-row">
                  <a href="tel:0925649666" className="button light success-call-btn">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Gọi Hotline 0925 649 666
                  </a>

                  <button
                    type="button"
                    className="button light reset-form-btn"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        service: 'Tổng vệ sinh nhà sau xây dựng',
                        notes: '',
                        area: ''
                      });
                    }}
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
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
              <p className="form-sub">Tự động kết nối Zalo Hotline 0925 649 666 để gửi ảnh hiện trạng & nhận báo giá.</p>

              {errorMessage && (
                <div
                  role="alert"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    color: '#b91c1c',
                    fontSize: '13.5px',
                    lineHeight: '1.5'
                  }}
                >
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Thông báo tiếp nhận:
                  </div>
                  <div>{errorMessage}</div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a href="tel:0925649666" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'underline' }}>
                      Gọi Hotline: 0925 649 666
                    </a>
                    <a href="https://zalo.me/0925649666" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'underline' }}>
                      Chat Zalo trực tiếp ↗
                    </a>
                  </div>
                </div>
              )}

              <div className="form-field">
                <label htmlFor="user-name">Họ và tên của bạn:</label>
                <input
                  id="user-name"
                  type="text"
                  autoComplete="name"
                  enterKeyHint="next"
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
                  autoComplete="tel"
                  enterKeyHint="next"
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
                    <option value="Tổng vệ sinh nhà sau xây dựng">Tổng vệ sinh nhà sau xây dựng</option>
                    <option value="Tổng vệ sinh chung cư trọn gói">Tổng vệ sinh chung cư trọn gói</option>
                    <option value="Vệ sinh nhà ở & Nhà cũ">Vệ sinh nhà ở & Nhà cũ</option>
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
                    enterKeyHint="next"
                    placeholder="VD: 50m² hoặc 1 bộ"
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
                  enterKeyHint="done"
                  placeholder="VD: Chung cư 2 phòng ngủ 65m², mới sửa xong cần dọn vào ở..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <button type="submit" disabled={submitting} className="button form-submit-btn">
                {submitting ? 'Đang kết nối Zalo...' : 'Gửi yêu cầu & Mở Zalo tư vấn'}
                <span aria-hidden="true">↗</span>
              </button>
              <p className="form-disclaimer">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ verticalAlign: '-1px', marginRight: '5px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Kết nối trực tiếp Zalo Hotline 0925 649 666 · Cam kết không phát sinh chi phí
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
