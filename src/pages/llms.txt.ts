import type { APIRoute } from 'astro';
import { contact, services, articles, commonPrices, apartmentPrices, type PriceRow } from '../data/site';
import { SITE_URL } from '../lib/seo-schema';

// Plain-text summary for AI assistants and answer engines (llms.txt convention).
// Built from the same verified data as the pages, so prices and contacts stay in sync.
const priceLine = (row: PriceRow) =>
  `- ${row.name}: ${row.price === 'Liên hệ' ? 'liên hệ báo giá' : `${row.price} đ/${row.unit}`}`;

export const GET: APIRoute = () => {
  const body = [
    '# Vệ Sinh Tino',
    '',
    `> Tổng vệ sinh công nghiệp và nhà ở tại Thành phố Hồ Chí Minh: văn phòng, trường học, khách sạn, nhà xưởng, kính tòa nhà, nhà và công trình sau xây dựng, căn hộ chung cư, giặt thảm và giặt ghế sofa. Hotline/Zalo ${contact.display}, làm việc ${contact.hours}.`,
    '',
    'Tino khảo sát hoặc xem ảnh/video hiện trạng, thống nhất hạng mục và chi phí trước khi làm, khách nghiệm thu từng hạng mục trước khi thanh toán. Giá dưới đây là giá tham khảo; giá thực tế phụ thuộc diện tích và mức độ bám bẩn.',
    '',
    '## Dịch vụ',
    ...services.map((service) => `- [${service.name}](${SITE_URL}/${service.slug}/): ${service.description}`),
    '',
    '## Bảng giá tham khảo',
    ...commonPrices.map(priceLine),
    ...apartmentPrices.map(priceLine),
    `- Bảng giá đầy đủ: ${SITE_URL}/bang-gia/`,
    '',
    '## Liên hệ',
    `- Hotline/Zalo: ${contact.display} (${contact.zalo})`,
    `- Email: ${contact.email}`,
    `- Đặt lịch/báo giá: ${SITE_URL}/lien-he/`,
    ...contact.addresses.map((address) => `- Địa chỉ: ${address}`),
    '',
    '## Cẩm nang',
    ...articles.map((article) => `- [${article.title}](${SITE_URL}/${article.slug}/)`),
    ''
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
