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
}

const PROJECTS: ProjectItem[] = [
  {
    id: 'abce569d7fb37039',
    category: 'glass',
    categoryLabel: 'Kính cao ốc',
    title: 'Đu dây vệ sinh mặt kính cao ốc',
    caption: 'Đội ngũ 4 kỹ thuật viên chuyên nghiệp thi công đu dây lau kính mặt ngoài tòa nhà.',
    tag: 'Thi công đu dây',
    image: '/images/abce569d7fb37039.webp'
  },
  {
    id: 'c949d223bc44f1ae',
    category: 'glass',
    categoryLabel: 'Kính cao ốc',
    title: 'Lau kính ngoài bằng xe nâng cơ giới',
    caption: 'Kỹ thuật viên thao tác trong lồng nâng an toàn, làm sạch kính dựng mặt tiền.',
    tag: 'Xe nâng cơ giới',
    image: '/images/c949d223bc44f1ae.webp'
  },
  {
    id: '3b21a7ec444d0b39',
    category: 'home',
    categoryLabel: 'Nhà ở & Căn hộ',
    title: 'Phòng khách căn hộ sau tổng vệ sinh',
    caption: 'Sàn gạch bóng loáng, nội thất kính và sofa được làm sạch tinh tươm trước bàn giao.',
    tag: 'Bàn giao căn hộ',
    image: '/images/3b21a7ec444d0b39.webp'
  },
  {
    id: 'e28b5ab0b1d848ea',
    category: 'home',
    categoryLabel: 'Nhà ở & Căn hộ',
    title: 'Nghiệm thu bàn giao nhà sau xây dựng',
    caption: 'Từng chi tiết len chân tường, khung cửa sổ và sàn gạch được khách hàng kiểm tra hài lòng.',
    tag: 'Nghiệm thu thực tế',
    image: '/images/e28b5ab0b1d848ea.webp'
  },
  {
    id: '92a7f6090b410117',
    category: 'home',
    categoryLabel: 'Nhà ở & Căn hộ',
    title: 'Cải tạo & làm sạch sâu nhà ở cũ',
    caption: 'Tẩy ố mốc lâu năm, khử mùi ẩm mốc và phục hồi độ sáng tự nhiên cho toàn bộ không gian.',
    tag: 'Vệ sinh nhà cũ',
    image: '/images/92a7f6090b410117.webp'
  },
  {
    id: 'e6ecb611e10bc770',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Tổng vệ sinh nhà máy - kho xưởng',
    caption: 'Quy mô diện tích lớn với trần thép tiền chế, đường ống kỹ thuật và sàn bê tông công nghiệp.',
    tag: 'Kho xưởng sản xuất',
    image: '/images/e6ecb611e10bc770.webp'
  },
  {
    id: '1dbcc214c91f18f3',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Xử lý dầu mỡ & lối đi nội bộ xưởng',
    caption: 'Tẩy rửa sàn chịu tải nặng, tẩy dầu mỡ công nghiệp bằng hóa chất sinh học chuyên dụng.',
    tag: 'Tẩy sàn công nghiệp',
    image: '/images/1dbcc214c91f18f3.webp'
  },
  {
    id: '934c3c727f9a36a0',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Vệ sinh công nghiệp máy hút 3 motor',
    caption: 'Hệ thống hút bụi công suất lớn thu gom triệt để bụi mịn bê tông và bột bả sau thi công.',
    tag: 'Máy móc 3 motor',
    image: '/images/934c3c727f9a36a0.webp'
  },
  {
    id: 'tino-danh-san-tho',
    category: 'floor',
    categoryLabel: 'Đánh bóng sàn',
    title: 'Nhân viên vận hành máy mài & đánh bóng sàn',
    caption: 'Kỹ thuật viên Tino điều khiển máy mài sàn mâm tạ công nghiệp, xử lý xước và tạo độ bóng.',
    tag: 'Mài sàn chuyên nghiệp',
    image: '/images/tino-danh-san-tho.webp'
  },
  {
    id: 'c2f625c607452a14',
    category: 'floor',
    categoryLabel: 'Đánh bóng sàn',
    title: 'Bề mặt sàn đá sau khi hoàn thiện',
    caption: 'Độ bóng gương phản chiếu sắc nét, đường ron được làm sạch tinh tế và phủ bóng bảo vệ.',
    tag: 'Sạch bóng gương',
    image: '/images/c2f625c607452a14.webp'
  },
  {
    id: '122cac8e1bd2f9d6',
    category: 'furnishing',
    categoryLabel: 'Sofa & Thảm',
    title: 'Giặt phun hút chuyên sâu ghế sofa nỉ',
    caption: 'Đầu hút tam giác công nghệ cao hút kiệt chất bẩn, dung dịch diệt khuẩn nấm mốc 99.9%.',
    tag: 'Giặt sofa tại nhà',
    image: '/images/122cac8e1bd2f9d6.webp'
  },
  {
    id: 'tino-tham-may-giat',
    category: 'furnishing',
    categoryLabel: 'Sofa & Thảm',
    title: 'Máy mâm xoay giặt thảm văn phòng',
    caption: 'Đánh bật vết ố cà phê, bụi mịn sâu trong sợi thảm và sấy khô nhanh bằng quạt thổi công suất cao.',
    tag: 'Giặt thảm công nghiệp',
    image: '/images/tino-tham-may-giat.webp'
  }
];

const TABS = [
  { key: 'all', label: 'Tất cả ảnh thật (12)' },
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
    <div className="authentic-showcase">
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

      {/* Grid of Projects */}
      <div className="showcase-grid">
        {filtered.map(item => (
          <article key={item.id} className="showcase-card">
            <div
              className="showcase-media"
              onClick={() => openModal(item)}
              role="button"
              tabIndex={0}
              aria-label={`Xem ảnh lớn: ${item.title}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal(item);
                }
              }}
            >
              <GlareHover
                glareColor="#ffffff"
                glareOpacity={0.35}
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
                aria-label="Phóng to ảnh"
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
              <p className="showcase-caption">{item.caption}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Lightbox Modal */}
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
              aria-label="Đóng ảnh"
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
              <span className="showcase-badge">{activePhoto.tag}</span>
              <h3>{activePhoto.title}</h3>
              <p>{activePhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticShowcase;
