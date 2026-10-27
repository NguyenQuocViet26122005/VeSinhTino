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
    title: 'Máy Móc Hiện Đại 3 Motor',
    desc: 'Hệ thống máy hút bụi công suất lớn, máy chà sàn tạ công nghiệp và công nghệ phun hút tam giác diệt khuẩn 99.9%.'
  },
  {
    icon: '🌿',
    num: '02',
    title: 'Hóa Chất Sinh Học An Toàn',
    desc: 'Dung dịch làm sạch nhập khẩu có xuất xứ rõ ràng, an toàn tuyệt đối cho bề mặt da, nỉ, gỗ và sức khỏe gia đình.'
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
    title: 'Hài Lòng Mới Thanh Toán',
    desc: 'Khảo sát tận nơi, báo giá minh bạch ngay từ đầu. Khách hàng trực tiếp nghiệm thu từng hạng mục trước khi bàn giao.'
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
              <span className="trust-icon" aria-hidden="true">{item.icon}</span>
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
