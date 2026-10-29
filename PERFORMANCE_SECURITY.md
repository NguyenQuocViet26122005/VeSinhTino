# Hiệu năng và vận hành an toàn

## Giữ hiệu ứng

Không thêm chế độ tự bỏ hiệu ứng trên máy yếu. Giữ hiệu ứng lau kính, nghiêng ảnh,
ánh sáng theo con trỏ, nút hút và chuyển động khi cuộn. Vẫn tôn trọng lựa chọn
`prefers-reduced-motion` theo DESIGN.md.

- Gộp sự kiện con trỏ theo từng khung hình; lưu kích thước phần tử và đo lại khi
  cuộn/đổi kích thước thay vì đo trong mỗi khung hình của lò xo.
- Tạm dừng vòng lặp ngoài vùng nhìn hoặc khi tab ẩn; tiếp tục khi nhìn thấy.
- Hiệu ứng lau kính chỉ cập nhật giá trị thay đổi, không cập nhật biến CSS kế thừa
  trên cả cây DOM trong mỗi khung hình.
- Ảnh chính vẫn dùng cùng ảnh và watermark; Astro tạo các kích thước WebP phù hợp.

## Kiểm tra trước triển khai

Yêu cầu Node 24.x. Chạy `npm run check`, `npm run build`, `npm run verify`,
`npm run test:contact`, `npm run design:lint`.

`scripts/performance-browser.cjs` dùng Playwright (biến `TINO_PLAYWRIGHT` là đường
dẫn module khi không cài trong dự án) và Chrome trên Windows. Nó phục vụ `dist`
trên localhost, chặn mạng ngoài, kiểm tra kích thước 1440/390/320 px với CPU
throttle 4 lần, thao tác lau kính bằng chuột/bàn phím, spotlight, magnet,
chuyển trang, reduced motion và lỗi JavaScript. Ảnh và kết quả nằm trong `qa/`.
CPU throttle không mô phỏng GPU, RAM hoặc mạng của mọi điện thoại yếu; cần kiểm
tra thêm trên thiết bị thật trước khi khẳng định tốc độ khung hình.

Đợt tối ưu mobile tiếp theo gửi CSS cùng HTML để tránh hai lượt tải CSS chặn
hiển thị. Đổi lại, HTML của mỗi route lớn hơn và CSS không còn được cache riêng
giữa các trang. Kiểm tra cả tải đầu và chuyển route khi thay đổi cấu hình này.
PostCSS ưu tiên subset tiếng Việt trên các dải Unicode bị trùng với latin-ext;
giữ nguyên file font, các độ đậm và subset latin-ext cho nội dung cần chúng.
Chân trang không dùng `content-visibility: auto`: chiều cao tạm 500 px làm sai
nền của các dòng cuối trên mobile khi đánh giá tương phản ngoài màn hình.

Các script `local-audit-server.cjs`, `footer-audit.cjs`, `mobile-interactions.cjs`
chỉ kiểm tra localhost. Công cụ Lighthouse 13.5.0 và axe-core 4.13.0 được cài
riêng trong `.cache/mobile-tools`, không phải dependency ứng dụng. Dùng
`footer-audit.cjs --expect-pass` sau build để kiểm tra lỗi chân trang; kết quả
và trace thao tác chạm nằm trong `qa/`. Không so điểm Lighthouse local trực tiếp
với PageSpeed chạy trên hạ tầng Google.

Đợt giảm tải JavaScript đầu trang giữ Zalo/hotline dưới dạng HTML và dùng chung
controller lò xo trong `src/lib/magnet.ts`; React vẫn được hydrate khi các phần
tương tác đi vào vùng nhìn. Các controller được dọn trước khi Astro thay trang.
CSS nội trang chuyển về các route nội trang, không tải vào trang chủ. Ảnh hero
có AVIF quality 60 (65 ở độ phân giải gốc) và WebP quality 82 dự phòng, giữ cùng ảnh/crop/kích thước;
không thay đổi nhịp mở đầu GSAP để chạy theo điểm số. Kiểm tra bằng
`scripts/loading-browser.cjs`: không tải React ở màn hình đầu, chỉ tải một định
dạng hero, WebP fallback, liên kết khi tắt JS, reduced motion và chuyển route.
Máy chủ audit nhận thêm đường dẫn build và cổng tùy chọn để đo xen kẽ hai bản.
Service Explorer, bảng tính giá và form bắt đầu hydrate trước vùng nhìn 600 px
để chuẩn bị tương tác khi khách cuộn đến. Form giữ lại dữ liệu/autofill nhập
trước hydration (kể cả honeypot), đồng thời gộp lần nhấn gửi sớm thành một yêu
cầu sau khi sẵn sàng. `scripts/form-loading-browser.cjs` cố tình chặn React,
kiểm tra nhập/gửi sớm, gửi lại và lỗi provider bằng API giả lập; không gọi bot.

## Giới hạn và cấu hình khi đưa lên Vercel

- `vercel.json` khai báo các header chống nhúng iframe, MIME sniffing, hạn chế
  quyền trình duyệt, CSP cơ bản và cache ảnh. CSP này chưa phải danh sách cho phép
  script nghiêm ngặt. Vercel áp dụng cấu hình khi có deployment mới.
- Form giới hạn body 8 KB, thời gian đọc 5 giây, gọi Telegram tối đa 8 giây;
  chỉ nhận JSON, kiểm tra origin/Fetch Metadata và dữ liệu đầu vào. Không ghi token
  hoặc dữ liệu khách hàng vào log kiểm tra.
- Bộ giới hạn trong bộ nhớ chỉ áp dụng trong từng instance đang chạy: tối đa 5
  lần gửi hợp lệ/IP/phút và 4 lần gọi Telegram đồng thời/instance. Giới hạn này
  không thay thế bộ giới hạn phân tán hay Firewall.
- Trong Vercel Firewall, cấu hình thêm quy tắc cho POST `/api/contact`, nhóm theo
  IP và giới hạn gửi ở biên mạng. Kiểm tra gói/tính phí và cách phản hồi của rule
  trước khi bật; xác nhận khách thật gửi form bình thường. Không bật rule rộng
  chặn cả website hoặc ảnh/JS. Chỉ chặn theo IP có thể ảnh hưởng người cùng mạng.
- Không thử tải lớn hoặc gửi Telegram thật bằng bộ kiểm tra tự động. Kiểm thử
  form hiện dùng provider giả lập. Chưa xác nhận cấu hình WAF của tài khoản.
- `npm audit --omit=dev` kiểm tra advisory đã biết cho dependency production;
  kết quả sạch không chứng minh website không còn lỗ hổng. Công cụ lint tài liệu
  trong devDependencies cần được theo dõi riêng khi upstream cập nhật.

Không có cấu hình nào bảo đảm website không thể bị đánh sập. Cần kết hợp
giới hạn tại Firewall, theo dõi sử dụng/chi phí, cập nhật dependency và bảo vệ
tài khoản quản trị. Bản code này không thay đổi DNS hoặc xóa website cũ.
