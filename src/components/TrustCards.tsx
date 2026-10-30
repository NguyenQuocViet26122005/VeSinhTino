'use client';

import React from 'react';
import SpotlightCard from './react-bits/SpotlightCard';

interface TrustItem {
  icon: string;
  num: string;
  title: string;
  desc: string;
}

const TRUST_ITEMS: TrustItem[] = [
  {
    icon: '⚡',
    num: '01',
    title: 'Thiết Bị Vệ Sinh Chuyên Dụng',
    desc: 'Trang bị máy hút bụi công nghiệp công suất lớn, máy chà sàn mâm xoay và máy phun hút chuyên dụng.'
  },
  {
    icon: '🌿',
    num: '02',
    title: 'Làm Sạch Theo Từng Bề Mặt',
    desc: 'Trao đổi chất liệu và hiện trạng để lựa chọn dung dịch, dụng cụ và cách làm sạch phù hợp.'
  },
  {
    icon: '🛡️',
    num: '03',
    title: 'Đội Ngũ Tận Tâm & Kỷ Luật',
    desc: 'Kỹ thuật viên lành nghề, trách nhiệm cao với tài sản gia chủ, tối ưu quy trình để thi công nhanh gọn, ngăn nắp.'
  },
  {
    icon: '✨',
    num: '04',
    title: 'Nghiệm Thu Trước Thanh Toán',
    desc: 'Trao đổi hiện trạng, báo giá rõ ràng trước khi làm. Khách hàng trực tiếp nghiệm thu từng hạng mục trước khi bàn giao.'
  }
];

export const TrustCards: React.FC = () => {
  return (
    <div className="trust-grid">
      {TRUST_ITEMS.map((item) => (
        <SpotlightCard
          key={item.num}
          theme="light"
          spotlightColor="rgba(8, 114, 175, 0.22)"
          spotlightSize={320}
          borderGlow={0.7}
          intensity={0.4}
          className="trust-card"
        >
          <div className="trust-card-inner">
            <div className="trust-card-top">
              <span className="trust-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d={item.num === '01' ? 'M4 17V7h16v10H4ZM8 17v3m8-3v3M8 11h8' : item.num === '02' ? 'M12 3c5 6 7 9 7 12a7 7 0 0 1-14 0c0-3 2-6 7-12Zm-3 12 2 2 4-4' : item.num === '03' ? 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m10-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0m5 7a4 4 0 0 1 5 4v2M16 4a4 4 0 0 1 0 8' : 'M9 12l2 2 4-4M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z'}/></svg></span>
              <span className="trust-num">{item.num}</span>
            </div>
            <h3 className="trust-title">{item.title}</h3>
            <p className="trust-desc">{item.desc}</p>
          </div>
        </SpotlightCard>
      ))}
    </div>
  );
};

export default TrustCards;
