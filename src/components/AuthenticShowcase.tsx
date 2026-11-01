'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import GlareHover from './react-bits/GlareHover';
import type { ResponsiveImages } from '../types/responsive-image';

export interface ProjectItem {
  id: string;
  category: 'apartment' | 'home' | 'glass' | 'factory' | 'floor' | 'furnishing';
  categoryLabel: string;
  title: string;
  caption: string;
  tag: string;
  image: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    "id": "f3e9578413dffb6cd7a69149858785c1",
    "category": "home",
    "categoryLabel": "Nhà ở & Nhà phố",
    "title": "Vệ sinh nhà phố sau xây dựng",
    "caption": "Hình ảnh vệ sinh không gian nhà ở, sàn và các khu vực nội thất.",
    "tag": "Nhà phố sau xây dựng",
    "image": "/images/f3e9578413dffb6cd7a69149858785c1.webp"
  },
  {
    "id": "b486da45979bde972f03edd7f9a890e5",
    "category": "apartment",
    "categoryLabel": "Căn hộ chung cư",
    "title": "Vệ sinh nội thất căn hộ",
    "caption": "Hình ảnh vệ sinh các khu vực kính, sàn và nội thất căn hộ.",
    "tag": "Vệ sinh căn hộ",
    "image": "/images/b486da45979bde972f03edd7f9a890e5.webp"
  },
  {
    "id": "e28b5ab0b1d848ea",
    "category": "home",
    "categoryLabel": "Nhà ở & Nhà phố",
    "title": "Vệ sinh nhà phố sau thi công",
    "caption": "Hình ảnh hạng mục vệ sinh trong không gian nhà phố.",
    "tag": "Vệ sinh nhà phố",
    "image": "/images/e28b5ab0b1d848ea.webp"
  },
  {
    "id": "tino-chung-cu-binh-chanh",
    "category": "apartment",
    "categoryLabel": "Căn hộ chung cư",
    "title": "Tổng vệ sinh căn hộ chung cư",
    "caption": "Hình ảnh không gian phòng khách và các khu vực trong căn hộ.",
    "tag": "Căn hộ chung cư",
    "image": "/images/tino-chung-cu-binh-chanh.webp"
  },
  {
    "id": "0dffb2a53aec534128d29cd9bf60aea5",
    "category": "home",
    "categoryLabel": "Nhà ở & Nhà phố",
    "title": "Vệ sinh khu vực bếp",
    "caption": "Hình ảnh hạng mục vệ sinh bếp và các bề mặt xung quanh.",
    "tag": "Khu vực bếp",
    "image": "/images/0dffb2a53aec534128d29cd9bf60aea5.webp"
  },
  {
    "id": "tino-chung-cu-binh-chanh-phong-ngu",
    "category": "apartment",
    "categoryLabel": "Căn hộ chung cư",
    "title": "Vệ sinh phòng ngủ và sàn gỗ",
    "caption": "Hình ảnh không gian phòng ngủ và hạng mục sàn gỗ.",
    "tag": "Sàn gỗ phòng ngủ",
    "image": "/images/tino-chung-cu-binh-chanh-phong-ngu.webp"
  },
  {
    "id": "92a7f6090b410117",
    "category": "home",
    "categoryLabel": "Nhà ở & Nhà cũ",
    "title": "Vệ sinh nhà ở",
    "caption": "Hình ảnh các hạng mục vệ sinh trong không gian nhà ở.",
    "tag": "Nhà ở",
    "image": "/images/92a7f6090b410117.webp"
  },
  {
    "id": "122cac8e1bd2f9d6",
    "category": "furnishing",
    "categoryLabel": "Sofa & Thảm",
    "title": "Giặt ghế sofa tại nhà",
    "caption": "Hình ảnh thiết bị phun hút trong hạng mục giặt ghế sofa.",
    "tag": "Giặt sofa tại nhà",
    "image": "/images/122cac8e1bd2f9d6.webp"
  },
  {
    "id": "tino-tham-may-giat",
    "category": "furnishing",
    "categoryLabel": "Sofa & Thảm",
    "title": "Giặt thảm văn phòng",
    "caption": "Hình ảnh hạng mục vệ sinh thảm tại văn phòng.",
    "tag": "Thảm văn phòng",
    "image": "/images/tino-tham-may-giat.webp"
  },
  {
    "id": "606d1140fe49df7060f5a8997d8261c2",
    "category": "home",
    "categoryLabel": "Trường học & Trẻ em",
    "title": "Vệ sinh không gian trường học",
    "caption": "Hình ảnh khu vực lớp học và không gian sinh hoạt.",
    "tag": "Không gian trường học",
    "image": "/images/606d1140fe49df7060f5a8997d8261c2.webp"
  },
  {
    "id": "tino-danh-san-tho",
    "category": "floor",
    "categoryLabel": "Đánh bóng sàn",
    "title": "Thiết bị vệ sinh và chăm sóc sàn",
    "caption": "Hình ảnh kỹ thuật viên và thiết bị làm sạch sàn.",
    "tag": "Thiết bị vệ sinh sàn",
    "image": "/images/tino-danh-san-tho.webp"
  },
  {
    "id": "c2f625c607452a14",
    "category": "floor",
    "categoryLabel": "Đánh bóng sàn",
    "title": "Hình ảnh bề mặt sàn",
    "caption": "Bề mặt sàn trong thư viện ảnh công trình của Tino.",
    "tag": "Bề mặt sàn",
    "image": "/images/c2f625c607452a14.webp"
  },
  {
    "id": "0822a0e36fddb2a9dd9a1b6424f8ff49",
    "category": "factory",
    "categoryLabel": "Kho xưởng",
    "title": "Vệ sinh sàn khu vực nhà xưởng",
    "caption": "Hình ảnh bề mặt sàn và không gian làm việc trong nhà xưởng.",
    "tag": "Sàn nhà xưởng",
    "image": "/images/0822a0e36fddb2a9dd9a1b6424f8ff49.webp"
  },
  {
    "id": "e6ecb611e10bc770",
    "category": "factory",
    "categoryLabel": "Kho xưởng",
    "title": "Vệ sinh không gian kho xưởng",
    "caption": "Hình ảnh khu vực sản xuất và sàn kho xưởng.",
    "tag": "Kho xưởng",
    "image": "/images/e6ecb611e10bc770.webp"
  },
  {
    "id": "f911a44071a765251aab844dfd730298",
    "category": "factory",
    "categoryLabel": "Kho xưởng",
    "title": "Vệ sinh sàn và gầm kệ kho hàng",
    "caption": "Hình ảnh thao tác vệ sinh quanh kệ và lối đi trong kho.",
    "tag": "Kệ và lối đi kho",
    "image": "/images/f911a44071a765251aab844dfd730298.webp"
  },
  {
    "id": "1dbcc214c91f18f3",
    "category": "factory",
    "categoryLabel": "Kho xưởng",
    "title": "Vệ sinh lối đi nhà xưởng",
    "caption": "Lối đi và bề mặt sàn trong khu vực nhà xưởng.",
    "tag": "Sàn nhà xưởng",
    "image": "/images/1dbcc214c91f18f3.webp"
  },
  {
    "id": "934c3c727f9a36a0",
    "category": "factory",
    "categoryLabel": "Kho xưởng",
    "title": "Thiết bị hút bụi tại công trình",
    "caption": "Hình ảnh thiết bị vệ sinh sử dụng tại công trình.",
    "tag": "Thiết bị hút bụi",
    "image": "/images/934c3c727f9a36a0.webp"
  },
  {
    "id": "abce569d7fb37039",
    "category": "glass",
    "categoryLabel": "Kính cao ốc",
    "title": "Vệ sinh kính mặt ngoài bằng xe nâng",
    "caption": "Hình ảnh thao tác vệ sinh kính mặt ngoài tòa nhà bằng xe nâng.",
    "tag": "Xe nâng người",
    "image": "/images/abce569d7fb37039.webp"
  },
  {
    "id": "c949d223bc44f1ae",
    "category": "glass",
    "categoryLabel": "Kính cao ốc",
    "title": "Vệ sinh kính mặt ngoài tòa nhà",
    "caption": "Hình ảnh tiếp cận và vệ sinh các khu vực kính mặt ngoài.",
    "tag": "Kính mặt dựng",
    "image": "/images/c949d223bc44f1ae.webp"
  }
];

const TABS = [
  { key: 'all', label: `Tất cả ảnh (${PROJECTS.length})` },
  { key: 'home', label: 'Nhà ở & Nhà phố' },
  { key: 'apartment', label: 'Căn hộ chung cư' },
  { key: 'furnishing', label: 'Sofa & Thảm' },
  { key: 'floor', label: 'Đánh bóng sàn' },
  { key: 'factory', label: 'Kho xưởng' },
  { key: 'glass', label: 'Kính cao ốc' }
] as const;

type TabKey = typeof TABS[number]['key'];

const INITIAL_COUNT = 6;

export const AuthenticShowcase: React.FC<{ images?: ResponsiveImages }> = ({ images = {} }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [activePhoto, setActivePhoto] = useState<ProjectItem | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setIsExpanded(false);
  };

  const filtered = useMemo(() => {
    if (activeTab === 'all') return PROJECTS;
    return PROJECTS.filter(p => p.category === activeTab);
  }, [activeTab]);

  // Phones show every photo in the swipe row. The extra cards are created only after
  // hydration (when the section nears the viewport), so the first page load stays light.
  const [isSwipeLayout, setIsSwipeLayout] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsSwipeLayout(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  const displayed = isExpanded || isSwipeLayout ? filtered : filtered.slice(0, INITIAL_COUNT);


  const lastActiveElement = useRef<HTMLElement | null>(null);
  const modalBoxRef = useRef<HTMLDivElement | null>(null);

  const openModal = (item: ProjectItem) => {
    if (typeof document !== 'undefined') {
      lastActiveElement.current = document.activeElement as HTMLElement;
    }
    setActivePhoto(item);
  };

  const closeModal = () => {
    setActivePhoto(null);
    if (lastActiveElement.current) {
      lastActiveElement.current.focus();
    }
  };

  const handleRequestSimilar = (item: ProjectItem) => {
    closeModal();
    const contactSection = document.getElementById('lien-he-tu-van');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    const detail = {
      serviceName: item.categoryLabel,
      serviceId: item.category,
      quantity: '1 công trình',
      estimateText: `Tôi cần vệ sinh hạng mục tương tự ảnh: ${item.title}`
    };
    if (typeof window !== 'undefined') {
      (window as unknown as { __tino_pending_prefill?: typeof detail }).__tino_pending_prefill = detail;
    }
    window.dispatchEvent(
      new CustomEvent('tino:prefill-contact', {
        detail
      })
    );
  };

  useEffect(() => {
    if (!activePhoto) return;

    const timer = setTimeout(() => {
      if (modalBoxRef.current) {
        const focusable = modalBoxRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'Tab' && modalBoxRef.current) {
        const focusable = modalBoxRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
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
            onClick={() => handleTabChange(tab.key)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Swipe Hint */}
      <div className="showcase-swipe-hint">
        <span>Vuốt ngang xem ảnh thực tế</span>
        <span className="swipe-badge">{filtered.length} ảnh →</span>
      </div>

      {/* Grid of Projects with Storytelling Layout. Desktop shows INITIAL_COUNT until expanded;
          on phones it is a horizontal swipe row with every photo and no load-more button (CSS). */}
      <div className="showcase-grid">
        {displayed.map(item => (
          <article key={item.id} className="showcase-card">
            <div
              className="showcase-media"
              onClick={() => openModal(item)}
              role="button"
              tabIndex={0}
              aria-label={`${item.tag} - Xem chi tiết ảnh: ${item.title}`}
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
                  src={images[item.image]?.src ?? item.image}
                  srcSet={images[item.image]?.srcSet}
                  sizes="(max-width: 768px) min(82vw, 315px), (max-width: 1000px) calc((100vw - 60px) / 2), (max-width: 1432px) calc((100vw - 160px) / 3), 424px"
                  alt={item.title}
                  width={600}
                  height={450}
                  loading="lazy"
                  decoding="async"
                  className="showcase-img"
                />
              </GlareHover>
              <span className="showcase-badge" aria-hidden="true">{item.tag}</span>
              <button
                type="button"
                className="showcase-zoom-btn"
                aria-label={`Phóng to ảnh: ${item.title}`}
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

              {/* Contextual CTA */}
              <div className="showcase-card-footer">
                <button
                  type="button"
                  className="showcase-action-btn"
                  onClick={() => handleRequestSimilar(item)}
                >
                  Tư vấn hạng mục tương tự
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Expand / Collapse Load More Controls */}
      {filtered.length > INITIAL_COUNT && (
        <div className="showcase-expand-wrap">
          <button
            type="button"
            className="showcase-expand-btn"
            onClick={() => {
              if (isExpanded) {
                setIsExpanded(false);
                const section = document.getElementById('cong-trinh');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              } else {
                setIsExpanded(true);
              }
            }}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <span>Thu gọn danh sách</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </>
            ) : (
              <>
                <span>Xem thêm {filtered.length - INITIAL_COUNT} ảnh</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Story Lightbox Modal */}
      {activePhoto && (
        <div
          className="showcase-modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
        >
          <div ref={modalBoxRef} className="showcase-modal-box" onClick={e => e.stopPropagation()}>
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

              <div className="story-full-breakdown">
                <p>{activePhoto.caption}</p>
                <p>Gửi ảnh hiện trạng và hạng mục bạn cần để trao đổi phương án, phạm vi và báo giá.</p>
              </div>

              <div className="modal-cta-row">
                <button
                  type="button"
                  className="button modal-contact-btn"
                  onClick={() => handleRequestSimilar(activePhoto)}
                >
                  Tôi cần tư vấn hạng mục này
                  <span aria-hidden="true">↗</span>
                </button>
                <a
                  href="https://zalo.me/0925649666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button light modal-zalo-btn"
                  onClick={async () => {
                    const msg = `Chào Tino, tôi xem ảnh "${activePhoto.title}" và muốn được khảo sát, báo giá tương tự cho công trình của tôi!`;
                    try {
                      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(msg);
                      }
                    } catch {
                      // Ignore
                    }
                  }}
                >
                  Nhắn Zalo kèm ảnh
                  <span aria-hidden="true">↗</span>
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
