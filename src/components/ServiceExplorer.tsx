'use client';

import React, { useState, useEffect } from 'react';
import type { ResponsiveImages } from '../types/responsive-image';

export interface ServiceDetail {
  slug: string;
  name: string;
  short: string;
  tag: string;
  photo: string;
  description: string;
  intro: string;
  tasks: string[];
  priceHighlight: string;
}

export const SERVICES_DATA: ServiceDetail[] = [
  {
    slug: 'dich-vu-ve-sinh-cong-nghiep',
    name: 'Tổng vệ sinh nhà sau xây dựng',
    short: 'Sau xây dựng',
    tag: 'Cho mọi công trình',
    photo: '/images/explorer/dich-vu-ve-sinh-cong-nghiep.webp',
    description: 'Làm sạch tổng thể sau thi công, hoàn thiện phần thô trước khi đưa công trình vào vận hành.',
    intro: 'Trao đổi các khu vực còn bụi, vết sơn hoặc xi măng sau thi công để lựa chọn thiết bị và phương án làm sạch phù hợp.',
    tasks: [
      'Thu gom rác thô và hút sạch bụi mịn sau xây dựng',
      'Sủi sạch vết sơn, xi măng, keo dán trên sàn và kính',
      'Làm sạch sàn gạch, sàn đá theo phạm vi đã thống nhất',
      'Nghiệm thu chi tiết từng phòng theo danh mục kiểm tra'
    ],
    priceHighlight: 'Từ 12.000 – 20.000 đ/m²'
  },
  {
    slug: 've-sinh-nha-o',
    name: 'Vệ sinh nhà ở & Nhà cũ',
    short: 'Nhà ở & Nhà cũ',
    tag: 'Chăm chút tổ ấm',
    photo: '/images/explorer/ve-sinh-nha-o.webp',
    description: 'Tổng vệ sinh nhà phố, biệt thự, nhà liền kề định kỳ hoặc dọn vào nhà cũ sạch sẽ.',
    intro: 'Một căn nhà sạch bắt đầu từ những chi tiết nhỏ. Dịch vụ vệ sinh nhà ở giúp bạn chăm sóc không gian sống toàn diện, đặc biệt sau cải tạo hoặc trước khi chuyển vào nhà mới.',
    tasks: [
      'Vệ sinh phòng khách, phòng ngủ và lối đi cầu thang',
      'Làm sạch cửa sổ kính, kệ tủ âm và đánh sàn gạch/đá',
      'Trao đổi hiện trạng vết bẩn tại khu vực bếp và nhà tắm',
      'Kiểm tra các hạng mục và nghiệm thu trước khi bàn giao'
    ],
    priceHighlight: 'Từ 10.000 – 20.000 đ/m²'
  },
  {
    slug: 've-sinh-chung-cu',
    name: 'Tổng vệ sinh chung cư trọn gói',
    short: 'Chung cư trọn gói',
    tag: 'Gọn gàng từng phòng',
    photo: '/images/explorer/ve-sinh-chung-cu.webp',
    description: 'Dịch vụ vệ sinh căn hộ chung cư theo số phòng, diện tích và hiện trạng thực tế.',
    intro: 'Tổng vệ sinh chung cư trọn gói 50m² từ 1tr6 (hình ảnh thực tế thi công tại Bình Chánh, TP.HCM). Tino làm sạch chi tiết từng phòng ngủ, phòng khách, bếp và nhà tắm trước khi dọn vào ở.',
    tasks: [
      'Hút bụi trần thạch cao, lau khe cửa kính và ban công',
      'Tẩy sạch dầu mỡ khu bếp, bồn rửa và tủ kệ âm tường',
      'Làm sạch tường gạch và thiết bị phòng tắm',
      'Lau sàn bằng dung dịch phù hợp với từng chất liệu'
    ],
    priceHighlight: 'Gói 50m² từ 1.600.000 đ'
  },
  {
    slug: 'dich-vu-giat-ghe-sofa',
    name: 'Giặt ghế sofa & Nệm tại nhà',
    short: 'Ghế sofa & Nệm',
    tag: 'Êm ái mỗi ngày',
    photo: '/images/explorer/dich-vu-giat-ghe-sofa.webp',
    description: 'Vệ sinh sofa và nệm tại nhà theo chất liệu, kích thước và mức độ bám bẩn.',
    intro: 'Gửi ảnh sofa hoặc nệm cùng thông tin chất liệu để trao đổi cách làm sạch và điều kiện sử dụng sau vệ sinh.',
    tasks: [
      'Hút bụi bề mặt, các khe sâu và kẽ tựa lưng sofa',
      'Chọn dung dịch phù hợp và thử ở vị trí nhỏ trước khi làm',
      'Phun hút bụi bẩn và nước theo phương án đã thống nhất',
      'Trao đổi cách làm khô và thời điểm sử dụng theo chất liệu'
    ],
    priceHighlight: 'Từ 250.000 – 500.000 đ/bộ'
  },
  {
    slug: 'dich-vu-giat-tham',
    name: 'Giặt thảm văn phòng & Trang trí',
    short: 'Giặt thảm văn phòng',
    tag: 'Sạch từ bề mặt',
    photo: '/images/explorer/dich-vu-giat-tham.webp',
    description: 'Vệ sinh thảm trải sàn văn phòng, thảm len trang trí bằng máy giặt mâm xoay chuyên dụng.',
    intro: 'Trao đổi chất liệu, diện tích và tình trạng vết bẩn để lựa chọn cách giặt cùng lịch làm khô phù hợp cho văn phòng.',
    tasks: [
      'Hút sạch bụi cát thô trước khi xử lý hóa chất',
      'Máy mâm xoay tạo bọt mịn đánh bật vết ố lâu ngày',
      'Phun hút và thu gom nước bẩn sau khi làm sạch',
      'Trao đổi điều kiện làm khô trước khi đưa thảm vào sử dụng'
    ],
    priceHighlight: 'Từ 15.000 – 20.000 đ/m²'
  },
  {
    slug: 've-sinh-nha-xuong',
    name: 'Vệ sinh kho & Nhà xưởng',
    short: 'Kho & Nhà xưởng',
    tag: 'Không gian sản xuất',
    photo: '/images/explorer/ve-sinh-nha-xuong.webp',
    description: 'Vệ sinh kho bãi, xưởng sản xuất theo diện tích và điều kiện vận hành thực tế.',
    intro: 'Không gian sản xuất cần phương án phù hợp. Thiết bị, hạng mục và lịch thi công được trao đổi theo hiện trạng và lịch vận hành của xưởng.',
    tasks: [
      'Quét bụi, thổi bụi xà gồ, vách panel và đường ống',
      'Tẩy rửa dầu mỡ công nghiệp trên sàn bê tông, sàn epoxy',
      'Vệ sinh khu văn phòng điều hành và lối đi nội bộ',
      'Bố trí thi công linh hoạt theo ca làm việc của xưởng'
    ],
    priceHighlight: 'Từ 6.000 – 15.000 đ/m²'
  },
  {
    slug: 've-sinh-kinh-toa-nha',
    name: 'Vệ sinh kính tòa nhà cao tầng',
    short: 'Kính tòa nhà',
    tag: 'Trong hơn, sáng hơn',
    photo: '/images/explorer/ve-sinh-kinh-toa-nha.webp',
    description: 'Làm sạch kính mặt ngoài và mặt trong tòa nhà theo điều kiện tiếp cận thực tế.',
    intro: 'Tino tiếp nhận thông tin về vị trí kính, chiều cao và hiện trạng để trao đổi phương án cùng phạm vi vệ sinh trước khi thực hiện.',
    tasks: [
      'Khảo sát vị trí kính và điều kiện tiếp cận',
      'Thống nhất phương án thi công kính mặt ngoài',
      'Tẩy ố vảy cá, cặn nước mưa và vết keo silicone',
      'Gạt sạch bóng kính mặt trong và lau khung nhôm'
    ],
    priceHighlight: 'Từ 12.000 – 30.000 đ/m²'
  }
];

export const ServiceExplorer: React.FC<{ images?: ResponsiveImages }> = ({ images = {} }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = SERVICES_DATA[selectedIndex] || SERVICES_DATA[0];

  // Sync with external events if triggered
  useEffect(() => {
    const handleServiceSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string }>;
      const targetSlug = customEvent.detail?.slug;
      if (targetSlug) {
        const foundIdx = SERVICES_DATA.findIndex(s => s.slug === targetSlug);
        if (foundIdx !== -1) {
          setSelectedIndex(foundIdx);
        }
      }
    };
    window.addEventListener('tino:select-service', handleServiceSelect);
    return () => window.removeEventListener('tino:select-service', handleServiceSelect);
  }, []);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleScrollToEstimator = (slug: string) => {
    const targetSlug = slug;
    if (typeof window !== 'undefined') {
      (window as unknown as { __tino_pending_service?: string }).__tino_pending_service = targetSlug;
    }
    const el = document.getElementById('uoc-tinh-chi-phi');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('tino:select-service', { detail: { slug: targetSlug } }));
    }
  };

  return (
    <div className="service-explorer">
      {/* Category Navigation Pills */}
      <div className="explorer-tabs" role="tablist" aria-label="Danh mục dịch vụ">
        {SERVICES_DATA.map((item, idx) => (
          <button
            key={item.slug}
            type="button"
            role="tab"
            aria-selected={selectedIndex === idx}
            className={`explorer-tab ${selectedIndex === idx ? 'is-active' : ''}`}
            onClick={() => handleSelect(idx)}
          >
            <span className="tab-number">{'0' + (idx + 1)}</span>
            <span className="tab-name">{item.short}</span>
          </button>
        ))}
      </div>

      {/* Selected Service Card Content */}
      <div className="explorer-card">
        <div className="explorer-media">
          <img
            key={current.slug}
            src={images[current.photo]?.src ?? current.photo}
            srcSet={images[current.photo]?.srcSet}
            sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1432px) 45vw, 600px"
            alt={current.name}
            width={800}
            height={640}
            loading="lazy"
            decoding="async"
            className="explorer-img"
          />
          <span className="explorer-badge">{current.tag}</span>
        </div>

        <div className="explorer-body">
          <div className="explorer-header">
            <span className="explorer-kicker">DỊCH VỤ #{selectedIndex + 1} CỦA TINO</span>
            <h3 className="explorer-title">{current.name}</h3>
            <p className="explorer-desc">{current.intro}</p>
            <div className="explorer-price-pill">
              <span className="price-pill-lbl">Đơn giá tham khảo:</span>
              <strong className="price-pill-val">{current.priceHighlight}</strong>
            </div>
          </div>

          <div className="explorer-tasks">
            <h4 className="tasks-heading">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Phạm vi các hạng mục Tino thực hiện:
            </h4>
            <ul className="tasks-list">
              {current.tasks.map((task, tIdx) => (
                <li key={tIdx} className="task-item">
                  <span className="task-check" aria-hidden="true">✓</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="explorer-actions">
            <a
              href={current.slug === 've-sinh-chung-cu' ? '/bang-gia/#gia-chung-cu' : `/${current.slug}/`}
              className="button"
            >
              {current.slug === 've-sinh-chung-cu' ? 'Xem bảng giá gói chung cư' : 'Xem chi tiết dịch vụ'}
              <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className="button light"
              onClick={() => handleScrollToEstimator(current.slug)}
            >
              Ước tính chi phí dịch vụ này
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceExplorer;
