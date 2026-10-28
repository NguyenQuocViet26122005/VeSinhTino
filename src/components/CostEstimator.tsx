'use client';

import React, { useState, useEffect } from 'react';

export interface EstimatorService {
  id: string;
  name: string;
  unit: string;
  defaultQty: number;
  minQty: number;
  maxQty: number;
  presets: number[];
  calculate: (qty: number) => { min: number; max: number; unitRate: string; note?: string };
}

const SERVICES: EstimatorService[] = [
  {
    id: 've-sinh-nha-o',
    name: 'Tổng vệ sinh nhà ở / sau xây dựng',
    unit: 'm²',
    defaultQty: 80,
    minQty: 30,
    maxQty: 300,
    presets: [50, 80, 100, 150, 200],
    calculate: (qty) => ({
      min: qty * 10000,
      max: qty * 20000,
      unitRate: '10.000 – 20.000 đ/m²',
      note: 'Áp dụng cho căn hộ, nhà phố sau xây dựng hoặc tổng vệ sinh định kỳ.'
    })
  },
  {
    id: 've-sinh-nha-xuong',
    name: 'Vệ sinh kho & Nhà xưởng',
    unit: 'm²',
    defaultQty: 500,
    minQty: 100,
    maxQty: 3000,
    presets: [300, 500, 800, 1200, 2000],
    calculate: (qty) => {
      if (qty < 500) {
        return {
          min: qty * 10000,
          max: qty * 15000,
          unitRate: '10.000 – 15.000 đ/m²',
          note: 'Mức đơn giá áp dụng cho nhà xưởng diện tích dưới 500m².'
        };
      } else if (qty <= 1000) {
        return {
          min: qty * 8000,
          max: qty * 12000,
          unitRate: '8.000 – 12.000 đ/m²',
          note: 'Mức đơn giá áp dụng cho nhà xưởng diện tích từ 500m² – 1.000m².'
        };
      } else {
        return {
          min: qty * 6000,
          max: qty * 10000,
          unitRate: '6.000 – 10.000 đ/m²',
          note: 'Mức đơn giá ưu đãi cho nhà xưởng quy mô lớn trên 1.000m².'
        };
      }
    }
  },
  {
    id: 've-sinh-kinh-toa-nha',
    name: 'Vệ sinh kính tòa nhà cao tầng',
    unit: 'm²',
    defaultQty: 100,
    minQty: 30,
    maxQty: 1000,
    presets: [50, 100, 200, 400, 800],
    calculate: (qty) => ({
      min: qty * 15000,
      max: qty * 25000,
      unitRate: '15.000 – 25.000 đ/m² (Dây đu)',
      note: 'Mức giá tham khảo theo phương án đu dây chuyên nghiệp. Có phương án giàn giáo (12k-20k) hoặc xe nâng (18k-30k).'
    })
  },
  {
    id: 'dich-vu-giat-ghe-sofa',
    name: 'Giặt ghế sofa tại nhà',
    unit: 'Bộ / Cái',
    defaultQty: 1,
    minQty: 1,
    maxQty: 10,
    presets: [1, 2, 3, 4, 5],
    calculate: (qty) => ({
      min: qty * 250000,
      max: qty * 500000,
      unitRate: '250.000 – 500.000 đ/bộ',
      note: 'Đơn giá tùy thuộc vào kích thước sofa (băng 2 chỗ, 3 chỗ hay góc L) và chất liệu vải nỉ hay da.'
    })
  },
  {
    id: 'dich-vu-giat-tham',
    name: 'Giặt thảm văn phòng',
    unit: 'm²',
    defaultQty: 100,
    minQty: 30,
    maxQty: 1000,
    presets: [50, 80, 120, 200, 500],
    calculate: (qty) => ({
      min: qty * 15000,
      max: qty * 20000,
      unitRate: '15.000 – 20.000 đ/m²',
      note: 'Áp dụng cho giặt thảm văn phòng bằng máy mâm xoay tạo bọt và hút nước dơ 3 motor.'
    })
  }
];

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

export const CostEstimator: React.FC = () => {
  const [selectedServiceId, setSelectedServiceId] = useState('ve-sinh-nha-o');
  const service = SERVICES.find(s => s.id === selectedServiceId) || SERVICES[0];
  const [quantity, setQuantity] = useState(service.defaultQty);

  // Listen for external sync from ServiceExplorer
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string }>;
      const found = SERVICES.find(s => s.id === customEvent.detail?.slug);
      if (found) {
        setSelectedServiceId(found.id);
        setQuantity(found.defaultQty);
      }
    };
    window.addEventListener('tino:select-service', handleSync);
    return () => window.removeEventListener('tino:select-service', handleSync);
  }, []);

  // Update quantity default when switching service
  const handleServiceChange = (id: string) => {
    setSelectedServiceId(id);
    const target = SERVICES.find(s => s.id === id);
    if (target) setQuantity(target.defaultQty);
  };

  const { min, max, unitRate, note } = service.calculate(quantity);

  const handleTransferToContact = () => {
    const contactSection = document.getElementById('lien-he-tu-van');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    // Dispatch event to pre-populate contact form
    window.dispatchEvent(
      new CustomEvent('tino:prefill-contact', {
        detail: {
          serviceName: service.name,
          serviceId: service.id,
          quantity: `${quantity} ${service.unit}`,
          estimateText: `${formatVND(min)} – ${formatVND(max)}`
        }
      })
    );
  };

  return (
    <div id="uoc-tinh-chi-phi" className="cost-estimator">
      <div className="estimator-header">
        <div className="estimator-pill">CÔNG CỤ MINH BẠCH</div>
        <h3 className="estimator-title">Ước tính chi phí dự kiến</h3>
        <p className="estimator-subtitle">
          Dựa trên bảng giá công bố chính thức của Vệ Sinh Tino. Không phát sinh chi phí ẩn.
        </p>
      </div>

      <div className="estimator-grid">
        {/* Controls Column */}
        <div className="estimator-controls">
          <div className="control-group">
            <label className="control-label" htmlFor="estimator-service-select">
              1. Chọn dịch vụ bạn cần:
            </label>
            <div className="service-chip-group">
              {SERVICES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`service-chip ${selectedServiceId === s.id ? 'is-selected' : ''}`}
                  onClick={() => handleServiceChange(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="qty-input">
                2. Nhập khối lượng / diện tích ({service.unit}):
              </label>
              <div className="qty-value-display">
                <input
                  id="qty-input"
                  type="number"
                  min={service.minQty}
                  max={service.maxQty}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="qty-number-input"
                />
                <span className="qty-unit-label">{service.unit}</span>
              </div>
            </div>

            <input
              type="range"
              min={service.minQty}
              max={service.maxQty}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="qty-slider"
              aria-label={`Chọn số ${service.unit}`}
            />

            <div className="preset-buttons">
              <span className="preset-label">Gợi ý nhanh:</span>
              {service.presets.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`preset-btn ${quantity === p ? 'is-active' : ''}`}
                  onClick={() => setQuantity(p)}
                >
                  {p} {service.unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Card Column */}
        <div className="estimator-result-card">
          <div className="result-card-inner">
            <span className="result-kicker">KHOẢNG GIÁ DỰ KIẾN</span>
            <div className="result-range">
              <span className="result-amount">{formatVND(min)}</span>
              <span className="result-dash">–</span>
              <span className="result-amount">{formatVND(max)}</span>
            </div>

            <div className="result-breakdown">
              <div className="breakdown-row">
                <span>Dịch vụ:</span>
                <strong>{service.name}</strong>
              </div>
              <div className="breakdown-row">
                <span>Khối lượng tính:</span>
                <strong>{quantity} {service.unit}</strong>
              </div>
              <div className="breakdown-row">
                <span>Đơn giá áp dụng:</span>
                <span className="unit-badge">{unitRate}</span>
              </div>
            </div>

            {note && <p className="result-note">{note}</p>}

            <div className="result-cta-wrap">
              <button
                type="button"
                className="button result-cta-btn"
                onClick={handleTransferToContact}
              >
                Nhận báo giá chi tiết cho mức này
                <span aria-hidden="true">↗</span>
              </button>
              <a
                href={`https://zalo.me/0925649666?text=${encodeURIComponent(
                  `Chào Tino, tôi cần tư vấn dịch vụ ${service.name} với diện tích khoảng ${quantity} ${service.unit} (khoảng giá ${formatVND(min)} - ${formatVND(max)}). Nhờ Tino hỗ trợ tư vấn và khảo sát!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="zalo-quick-link"
              >
                Gửi ảnh qua Zalo để có giá chuẩn ngay <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostEstimator;
