'use client';

import React, { useState } from 'react';

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

const SERVICES_DATA: ServiceDetail[] = [
  {
    slug: 've-sinh-nha-o',
    name: 'Vệ sinh nhà ở & Căn hộ',
    short: 'Nhà ở & Căn hộ',
    tag: 'Chăm chút tổ ấm',
    photo: '3b21a7ec444d0b39',
    description: 'Tổng vệ sinh nhà ở, căn hộ và không gian sinh hoạt, từ sàn nhà đến những góc nhỏ nhất.',
    intro: 'Một căn nhà sạch bắt đầu từ những chi tiết nhỏ. Tino chăm sóc không gian sống kỹ lưỡng sau sửa chữa hoặc trước khi dọn vào nhà mới.',
    tasks: [
      'Hút bụi trần, quét mạng nhện, lau cửa sổ & khung kính',
      'Vệ sinh phòng khách, phòng ngủ, ban công và lan can',
      'Tẩy sạch dầu mỡ khu bếp, bồn rửa và tủ kệ bếp',
      'Khử khuẩn, chà sạch tường gạch và thiết bị phòng tắm'
    ],
    priceHighlight: 'Từ 10.000 – 20.000 đ/m²'
  },
  {
    slug: 'dich-vu-ve-sinh-cong-nghiep',
    name: 'Vệ sinh công nghiệp sau xây dựng',
    short: 'Sau xây dựng',
    tag: 'Cho mọi công trình',
    photo: '934c3c727f9a36a0',
    description: 'Làm sạch tổng thể sau thi công, hoàn thiện phần thô trước khi đưa công trình vào vận hành.',
    intro: 'Từ bụi bê tông, sơn dính đến bột trét tường, Tino kết hợp máy hút bụi 3 motor cùng máy chà sàn công nghiệp để làm sạch toàn diện.',
    tasks: [
      'Thu gom triệt để rác thô và bụi mịn sau xây dựng',
      'Sủi sạch vết sơn, xi măng, keo dán trên sàn và kính',
      'Đánh bóng sàn gạch, sàn đá bằng máy mâm xoay',
      'Nghiệm thu chi tiết từng phòng theo danh mục kiểm tra'
    ],
    priceHighlight: 'Từ 10.000 – 20.000 đ/m²'
  },
  {
    slug: 've-sinh-nha-xuong',
    name: 'Vệ sinh kho & Nhà xưởng',
    short: 'Kho & Nhà xưởng',
    tag: 'Không gian sản xuất',
    photo: 'e6ecb611e10bc770',
    description: 'Vệ sinh kho bãi, xưởng sản xuất theo diện tích và điều kiện vận hành thực tế.',
    intro: 'Không gian sản xuất cần phương án phù hợp. Tino khảo sát trực tiếp để xác định trang thiết bị, thời gian thi công không gián đoạn sản xuất.',
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
    photo: 'c949d223bc44f1ae',
    description: 'Làm sạch kính mặt ngoài và mặt trong cao ốc bằng phương án thi công an toàn chuẩn kỹ thuật.',
    intro: 'Bề mặt kính sạch giúp không gian đón trọn ánh sáng tự nhiên. Đội ngũ có chứng chỉ đu dây an toàn, kết hợp giàn giáo hoặc xe nâng.',
    tasks: [
      'Khảo sát kết cấu mái và điểm neo an toàn chịu tải',
      'Đu dây hoặc vận hành xe nâng tiếp cận mặt ngoài kính',
      'Tẩy ố vảy cá, cặn nước mưa và vết keo silicone',
      'Gạt sạch bóng kính mặt trong và lau khung nhôm'
    ],
    priceHighlight: 'Từ 12.000 – 30.000 đ/m²'
  },
  {
    slug: 'dich-vu-giat-ghe-sofa',
    name: 'Giặt ghế sofa & Nệm tại nhà',
    short: 'Ghế sofa & Nệm',
    tag: 'Êm ái mỗi ngày',
    photo: '122cac8e1bd2f9d6',
    description: 'Chăm sóc sofa vải nỉ, da và nệm ngủ tại nhà bằng công nghệ phun hút sinh học an toàn.',
    intro: 'Chiếc sofa là nơi gia đình quây quần mỗi ngày. Tino dùng máy phun hút áp lực kết hợp dung dịch khử khuẩn, khử mùi ẩm mốc sâu.',
    tasks: [
      'Hút bụi bề mặt, các khe sâu và kẽ tựa lưng sofa',
      'Phun dung dịch sinh học hòa tan vết bẩn và mồ hôi',
      'Đầu hút chân không hút kiệt nước bẩn và vi khuẩn',
      'Khử khuẩn nấm mốc và sấy khô nhanh trong 60–90 phút'
    ],
    priceHighlight: 'Từ 250.000 – 500.000 đ/bộ'
  },
  {
    slug: 'dich-vu-giat-tham',
    name: 'Giặt thảm văn phòng & Trang trí',
    short: 'Giặt thảm văn phòng',
    tag: 'Sạch từ bề mặt',
    photo: 'e20602f023e8669e',
    description: 'Vệ sinh thảm trải sàn văn phòng, thảm len trang trí bằng máy giặt mâm xoay chuyên dụng.',
    intro: 'Bụi bẩn và vết cà phê lâu ngày trong thảm được đánh bật hoàn toàn, giúp không khí văn phòng trong lành và bảo vệ tuổi thọ sợi thảm.',
    tasks: [
      'Hút sạch bụi cát thô trước khi xử lý hóa chất',
      'Máy mâm xoay tạo bọt mịn đánh bật vết ố lâu ngày',
      'Máy hút công nghiệp 3 motor hút sạch nước dơ',
      'Quạt thổi công nghiệp làm khô nhanh, không để mùi ẩm'
    ],
    priceHighlight: 'Từ 15.000 – 20.000 đ/m²'
  }
];

export const ServiceExplorer: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = SERVICES_DATA[selectedIndex];

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleScrollToEstimator = (slug: string) => {
    const el = document.getElementById('uoc-tinh-chi-phi');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Dispatch custom event to sync CostEstimator
      window.dispatchEvent(new CustomEvent('tino:select-service', { detail: { slug } }));
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
            src={`/images/${current.photo}.webp`}
            alt={current.name}
            width={768}
            height={560}
            loading="lazy"
            decoding="async"
            className="explorer-img"
          />
          <span className="explorer-badge">{current.tag}</span>
          <div className="explorer-price-tag">
            <small>Đơn giá tham khảo</small>
            <strong>{current.priceHighlight}</strong>
          </div>
        </div>

        <div className="explorer-body">
          <div className="explorer-header">
            <span className="explorer-kicker">DỊCH VỤ #{selectedIndex + 1} CỦA TINO</span>
            <h3 className="explorer-title">{current.name}</h3>
            <p className="explorer-desc">{current.intro}</p>
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
            <a href={`/${current.slug}/`} className="button explorer-btn-primary">
              <span>Xem chi tiết dịch vụ</span>
              <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className="button light explorer-btn-secondary"
              onClick={() => handleScrollToEstimator(current.slug)}
            >
              <span>Ước tính chi phí dịch vụ này</span>
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceExplorer;
