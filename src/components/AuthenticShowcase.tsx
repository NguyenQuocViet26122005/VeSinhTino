'use client';

import React, { useState, useMemo, useEffect } from 'react';
import GlareHover from './react-bits/GlareHover';

export interface ProjectItem {
  id: string;
  category: 'home' | 'glass' | 'factory' | 'floor' | 'furnishing';
  categoryLabel: string;
  title: string;
  caption: string;
  tag: string;
  image: string;
  problem: string;
  solution: string;
  result: string;
}

const PROJECTS: ProjectItem[] = [
  {
    id: 'abce569d7fb37039',
    category: 'glass',
    categoryLabel: 'Kính cao ốc',
    title: 'Đu dây vệ sinh mặt kính cao ốc văn phòng',
    caption: 'Đội ngũ kỹ thuật viên có chứng chỉ an toàn đu dây thi công lau kính mặt ngoài tòa nhà.',
    tag: 'Thi công đu dây',
    image: '/images/abce569d7fb37039.webp',
    problem: 'Kính mặt ngoài bám cặn vảy cá, bụi mịn ô nhiễm và ố nước mưa lâu năm không tiếp cận được từ bên trong.',
    solution: 'Khảo sát điểm neo an toàn mái, đội 4 kỹ thuật viên đu dây gạt kính bằng hóa chất sinh học tẩy cặn vôi và lau khô khung nhôm.',
    result: 'Bề mặt kính trong suốt 100%, phản chiếu bầu trời sắc nét, bàn giao đúng tiến độ 2 ngày.'
  },
  {
    id: 'c949d223bc44f1ae',
    category: 'glass',
    categoryLabel: 'Kính cao ốc',
    title: 'Lau kính mặt tiền bằng xe nâng cơ giới',
    caption: 'Kỹ thuật viên thao tác trong lồng nâng cơ giới làm sạch kính dựng showroom và khối đế.',
    tag: 'Xe nâng cơ giới',
    image: '/images/c949d223bc44f1ae.webp',
    problem: 'Khối kính mặt dựng sảnh showroom cao 18m cần thi công nhanh trong đêm để sáng hôm sau khai trương.',
    solution: 'Điều xe nâng boom-lift cơ giới 22m, hai nhân sự thao tác đồng bộ từ trên xuống dưới, làm sạch cả kính và alu.',
    result: 'Bàn giao lúc 5h sáng, mặt kính sáng bóng không một vệt nước, an toàn tuyệt đối cho người và thiết bị.'
  },
  {
    id: '3b21a7ec444d0b39',
    category: 'home',
    categoryLabel: 'Nhà ở & Căn hộ',
    title: 'Phòng khách căn hộ chung cư sau tổng vệ sinh',
    caption: 'Sàn gạch bóng loáng, nội thất kính và sofa được làm sạch tinh tươm trước bàn giao dọn vào.',
    tag: 'Bàn giao căn hộ',
    image: '/images/3b21a7ec444d0b39.webp',
    problem: 'Căn hộ 85m² sau khi thi công hoàn thiện nội thất dính nhiều bụi bột trét, keo dán sàn và mùi sơn nồng.',
    solution: 'Hút bụi công nghiệp toàn diện trần - tường - sàn, sủi keo tỉ mỉ từng viên gạch, lau sạch kính ban công và khử mùi sinh học.',
    result: 'Chủ nhà trực tiếp nghiệm thu và nhận nhà ở ngay trong ngày, không còn chút mùi sơn hay bụi mịn.'
  },
  {
    id: 'e28b5ab0b1d848ea',
    category: 'home',
    categoryLabel: 'Nhà ở & Căn hộ',
    title: 'Nghiệm thu bàn giao nhà phố sau xây dựng',
    caption: 'Từng chi tiết len chân tường, khung cửa sổ và sàn gạch được chủ nhà kiểm tra hài lòng.',
    tag: 'Nghiệm thu thực tế',
    image: '/images/e28b5ab0b1d848ea.webp',
    problem: 'Nhà phố 1 trệt 2 lầu nhiều rác thô, vết xi măng chết bám trên gạch nhám và cửa kính các tầng.',
    solution: 'Phân tổ 5 nhân sự: tổ 1 dọn rác thô và hút bụi, tổ 2 tẩy xi măng bằng dung dịch an toàn ron gạch, tổ 3 chà sàn máy và lau kính.',
    result: 'Nghiệm thu từng tầng, chủ nhà ký biên bản bàn giao và đánh giá cao sự cẩn thận ở các góc khuất cầu thang.'
  },
  {
    id: '92a7f6090b410117',
    category: 'home',
    categoryLabel: 'Nhà ở & Căn hộ',
    title: 'Cải tạo & làm sạch sâu nhà ở cũ',
    caption: 'Tẩy ố mốc lâu năm, khử mùi ẩm mốc và phục hồi độ sáng tự nhiên cho toàn bộ không gian.',
    tag: 'Vệ sinh nhà cũ',
    image: '/images/92a7f6090b410117.webp',
    problem: 'Nhà để trống hơn 6 tháng, ẩm thấp, tường phòng tắm ố vàng, ron gạch đen và tủ bếp bám dầu mỡ kết tủa.',
    solution: 'Phun dung dịch sinh học phân hủy dầu mỡ khu bếp, chà tẩy ron gạch toilet bằng máy cầm tay chuyên dụng.',
    result: 'Không gian sáng bừng như mới, sạch khuẩn và thông thoáng sẵn sàng cho gia đình dọn vào sinh hoạt.'
  },
  {
    id: 'e6ecb611e10bc770',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Tổng vệ sinh nhà máy & kho xưởng quy mô lớn',
    caption: 'Quy mô diện tích lớn với trần thép tiền chế, đường ống kỹ thuật và sàn bê tông công nghiệp.',
    tag: 'Kho xưởng sản xuất',
    image: '/images/e6ecb611e10bc770.webp',
    problem: 'Xưởng cơ khí 1.200m² chuyển giao mặt bằng, trần bám nhiều mạng nhện và bụi xơ vải, sàn loang lổ vết dầu máy.',
    solution: 'Dùng giàn giáo và máy thổi áp lực quét mạng nhện trần xưởng, dùng máy chà sàn liên hợp tải nặng tẩy dầu sàn bê tông.',
    result: 'Bàn giao mặt bằng kho sạch sẽ đạt tiêu chuẩn tiếp nhận của đối tác FDI Nhật Bản.'
  },
  {
    id: '1dbcc214c91f18f3',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Xử lý dầu mỡ & lối đi nội bộ xưởng',
    caption: 'Tẩy rửa sàn chịu tải nặng, tẩy dầu mỡ công nghiệp bằng hóa chất sinh học chuyên dụng.',
    tag: 'Tẩy sàn công nghiệp',
    image: '/images/1dbcc214c91f18f3.webp',
    problem: 'Khu vực xe nâng di chuyển liên tục bị trơn trượt do dầu nhớt rò rỉ, gây mất an toàn lao động.',
    solution: 'Ủ hóa chất tẩy dầu sinh học không ăn mòn bê tông, dùng máy chà sàn mâm cước sắt đánh bật gốc dầu.',
    result: 'Sàn khô ráo, tăng độ ma sát bám bánh xe nâng, loại bỏ hoàn toàn nguy cơ trượt ngã cho công nhân.'
  },
  {
    id: '934c3c727f9a36a0',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Hút bụi công nghiệp máy công suất 3 motor',
    caption: 'Hệ thống hút bụi công suất lớn thu gom triệt để bụi mịn bê tông và bột bả sau thi công.',
    tag: 'Máy móc 3 motor',
    image: '/images/934c3c727f9a36a0.webp',
    problem: 'Bụi mịn sau khi cắt gạch và chà nhám bay lơ lửng khắp không gian, máy hút bụi gia đình lập tức bị nghẹt lọc.',
    solution: 'Trang bị 3 máy hút bụi công nghiệp 80L 3 motor công suất 3600W, hút khô và ướt đồng thời.',
    result: 'Thu gom hơn 150kg bụi mịn chỉ trong 3 giờ, làm sạch triệt để không để bụi tái phân tán vào không khí.'
  },
  {
    id: 'tino-danh-san-tho',
    category: 'floor',
    categoryLabel: 'Đánh bóng sàn',
    title: 'Kỹ thuật viên vận hành máy mài & đánh bóng sàn',
    caption: 'Kỹ thuật viên Tino điều khiển máy mài sàn mâm tạ công nghiệp, xử lý xước và tạo độ bóng.',
    tag: 'Mài sàn chuyên nghiệp',
    image: '/images/tino-danh-san-tho.webp',
    problem: 'Sàn đá mài terrazzo tại sảnh tòa nhà bị ố mờ mất bóng do lưu lượng người đi lại đông đúc.',
    solution: 'Mài phục hồi bằng 5 đầu số đĩa kim cương từ thô đến mịn, đánh bóng tăng cường bằng pad trắng hóa chất phủ bóng.',
    result: 'Độ bóng đạt trên 85 GU (bóng gương), tăng khả năng chống thấm nước và chống bám bẩn lâu dài.'
  },
  {
    id: 'c2f625c607452a14',
    category: 'floor',
    categoryLabel: 'Đánh bóng sàn',
    title: 'Bề mặt sàn đá sau khi hoàn thiện',
    caption: 'Độ bóng gương phản chiếu sắc nét, đường ron được làm sạch tinh tế và phủ bóng bảo vệ.',
    tag: 'Sạch bóng gương',
    image: '/images/c2f625c607452a14.webp',
    problem: 'Sàn gạch men bóng bị dính vệt sơn và lớp màng keo xây dựng làm mờ xỉn, lau nước thường không sạch.',
    solution: 'Dùng máy chà sàn đơn kết hợp pad đỏ và hóa chất bóc keo chuyên dụng, hút khô ngay bằng cần gạt cao su.',
    result: 'Sàn gạch sáng bóng như mới lát, phản chiếu ánh đèn trần hoàn hảo, không còn một vết xước dăm.'
  },
  {
    id: '122cac8e1bd2f9d6',
    category: 'furnishing',
    categoryLabel: 'Sofa & Thảm',
    title: 'Giặt phun hút chuyên sâu ghế sofa nỉ',
    caption: 'Đầu hút tam giác công nghệ cao hút kiệt chất bẩn, dung dịch diệt khuẩn nấm mốc 99.9%.',
    tag: 'Giặt sofa tại nhà',
    image: '/images/122cac8e1bd2f9d6.webp',
    problem: 'Bộ sofa nỉ màu be bị đổ nước trà và mồ hôi ố vàng, bốc mùi ẩm nhẹ khi thời tiết nồm ẩm.',
    solution: 'Phun dung dịch sinh học chiết xuất thực vật diệt khuẩn, dùng máy hút chân không lực hút 2200W hút kiệt nước đen.',
    result: 'Vết ố trà biến mất hoàn toàn, vải mềm mại thơm tho thoang thoảng mùi sả chanh, khô ráo sau 2 giờ.'
  },
  {
    id: 'tino-tham-may-giat',
    category: 'furnishing',
    categoryLabel: 'Sofa & Thảm',
    title: 'Máy mâm xoay giặt thảm văn phòng',
    caption: 'Đánh bật vết ố cà phê, bụi mịn sâu trong sợi thảm và sấy khô nhanh bằng quạt thổi công suất cao.',
    tag: 'Giặt thảm công nghiệp',
    image: '/images/tino-tham-may-giat.webp',
    problem: 'Thảm văn phòng công ty 200m² tích tụ bụi đất cả năm, nhiều vết đổ cà phê tại khu vực pantry.',
    solution: 'Giặt vào chiều thứ 7: dùng máy mâm cước mềm chà sạch từng mét vuông, kết hợp quạt sấy 3 cấp tốc độ.',
    result: 'Sáng thứ 2 nhân viên đi làm thấy thảm sạch tinh, thơm mát, khô ráo 100% không ảnh hưởng giờ làm việc.'
  }
];

const TABS = [
  { key: 'all', label: 'Tất cả công trình (12)' },
  { key: 'home', label: 'Nhà ở & Căn hộ' },
  { key: 'glass', label: 'Kính cao ốc' },
  { key: 'factory', label: 'Kho xưởng' },
  { key: 'floor', label: 'Đánh bóng sàn' },
  { key: 'furnishing', label: 'Sofa & Thảm' }
] as const;

type TabKey = typeof TABS[number]['key'];

export const AuthenticShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [activePhoto, setActivePhoto] = useState<ProjectItem | null>(null);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return PROJECTS;
    return PROJECTS.filter(p => p.category === activeTab);
  }, [activeTab]);

  const openModal = (item: ProjectItem) => {
    setActivePhoto(item);
  };

  const closeModal = () => {
    setActivePhoto(null);
  };

  const handleRequestSimilar = (item: ProjectItem) => {
    closeModal();
    const contactSection = document.getElementById('lien-he-tu-van');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    window.dispatchEvent(
      new CustomEvent('tino:prefill-contact', {
        detail: {
          serviceName: item.categoryLabel,
          serviceId: item.category,
          quantity: '1 công trình',
          estimateText: `Tôi cần vệ sinh tương tự công trình: ${item.title}`
        }
      })
    );
  };

  useEffect(() => {
    if (!activePhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [activePhoto]);

  return (
    <div id="cong-trinh" className="authentic-showcase">
      {/* Category Filter Tabs */}
      <div className="showcase-tabs" role="tablist" aria-label="Bộ lọc ảnh thực tế">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`showcase-tab ${activeTab === tab.key ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Projects with Storytelling Layout */}
      <div className="showcase-grid">
        {filtered.map(item => (
          <article key={item.id} className="showcase-card">
            <div
              className="showcase-media"
              onClick={() => openModal(item)}
              role="button"
              tabIndex={0}
              aria-label={`Xem chi tiết công trình: ${item.title}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal(item);
                }
              }}
            >
              <GlareHover
                glareColor="#ffffff"
                glareOpacity={0.3}
                variant="sheen"
                borderRadius="14px"
                className="showcase-glare-wrap"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  width={600}
                  height={450}
                  loading="lazy"
                  decoding="async"
                  className="showcase-img"
                />
              </GlareHover>
              <span className="showcase-badge">{item.tag}</span>
              <button
                type="button"
                className="showcase-zoom-btn"
                aria-label="Phóng to ảnh và xem câu chuyện"
                onClick={e => {
                  e.stopPropagation();
                  openModal(item);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </div>

            <div className="showcase-content">
              <span className="showcase-cat">{item.categoryLabel}</span>
              <h3 className="showcase-title">{item.title}</h3>

              {/* Story Mini-Summary */}
              <div className="story-preview">
                <div className="story-step-item">
                  <span className="story-label">Hiện trạng:</span>
                  <span className="story-val">{item.problem}</span>
                </div>
                <div className="story-step-item">
                  <span className="story-label">Kết quả:</span>
                  <span className="story-val highlight">{item.result}</span>
                </div>
              </div>

              {/* Contextual CTA */}
              <div className="showcase-card-footer">
                <button
                  type="button"
                  className="showcase-action-btn"
                  onClick={() => handleRequestSimilar(item)}
                >
                  <span>Tôi cần vệ sinh như công trình này</span>
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Story Lightbox Modal */}
      {activePhoto && (
        <div
          className="showcase-modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
        >
          <div className="showcase-modal-box" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="showcase-modal-close"
              onClick={closeModal}
              aria-label="Đóng hộp thoại"
            >
              ✕
            </button>
            <div className="showcase-modal-image-wrap">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                className="showcase-modal-img"
              />
            </div>
            <div className="showcase-modal-info">
              <div className="modal-header-line">
                <span className="showcase-badge">{activePhoto.tag}</span>
                <span className="modal-cat-text">{activePhoto.categoryLabel}</span>
              </div>
              <h3 className="modal-work-title">{activePhoto.title}</h3>

              {/* 3-Step Full Story Breakdown */}
              <div className="story-full-breakdown">
                <div className="story-full-item problem">
                  <div className="story-full-badge">01. Hiện trạng ban đầu</div>
                  <p>{activePhoto.problem}</p>
                </div>
                <div className="story-full-item solution">
                  <div className="story-full-badge">02. Hạng mục Tino xử lý</div>
                  <p>{activePhoto.solution}</p>
                </div>
                <div className="story-full-item result">
                  <div className="story-full-badge">03. Kết quả bàn giao</div>
                  <p>{activePhoto.result}</p>
                </div>
              </div>

              <div className="modal-cta-row">
                <button
                  type="button"
                  className="button modal-contact-btn"
                  onClick={() => handleRequestSimilar(activePhoto)}
                >
                  <span>Tôi cần vệ sinh như công trình này</span>
                  <span aria-hidden="true">↗</span>
                </button>
                <a
                  href={`https://zalo.me/0925649666?text=${encodeURIComponent(
                    `Chào Tino, tôi xem công trình "${activePhoto.title}" và muốn được khảo sát, báo giá tương tự cho công trình của tôi!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button light modal-zalo-btn"
                >
                  <span>Nhắn Zalo kèm ảnh</span>
                  <span aria-hidden="true">💬</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticShowcase;
