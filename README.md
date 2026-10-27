# Vệ Sinh Tino — bản thiết kế mới

Website Astro + React + TypeScript, dùng nội dung và ảnh từ đợt khảo sát vesinhtino.com ngày 26/10/2026. Đây là bản xem trước, chưa thay website đang hoạt động.

## Chạy dự án

Yêu cầu Node.js 24 LTS (script đối chiếu dữ liệu dùng hỗ trợ TypeScript của Node 24).

```sh
npm ci
npm run dev
```

Mở địa chỉ localhost được in trong terminal. Để kiểm tra bản production:

```sh
npm run check
npm run build
npm run verify
npm run preview
```

Thư mục dist chứa bản HTML tĩnh để đưa lên hosting sau khi duyệt. Cần cấu hình hosting phục vụ đường dẫn dạng /ten-trang/ và trang 404.html.

## Nội dung

- 6 dịch vụ, 7 bài cẩm nang được biên tập, các trang giới thiệu, bảng giá, liên hệ và tuyển dụng.
- Giữ 21 đường dẫn của bản khảo sát; bổ sung /bang-gia/ và 404.
- 11 dòng giá giữ đúng số tiền từ nguồn; định dạng dấu gạch và m² được chuẩn hóa.
- Ảnh WebP lấy từ website gốc, giữ watermark. Liên hệ và địa chỉ giữ theo dữ liệu nguồn.
- Cập nhật thông tin trong src/data/site.ts. Bản đối chiếu gốc nằm trong src/data/source/pages.json.

## Tương tác và hiệu năng

GSAP tạo chuyển động nhẹ khi cuộn; CSS xử lý hover/press có điều kiện con trỏ. Thiết lập giảm chuyển động của hệ điều hành được tôn trọng. Mô hình kính Three.js/R3F chỉ tải sau khi nhấn nút, dừng khi khuất màn hình hoặc tab ẩn, có hình thay thế nếu WebGL không dùng được. Bộ dựng 3D còn lớn (~250 KB gzip), nhưng không nằm trong tải ban đầu. Hairline Query minh họa khu vực hỏi đáp.

## Skill dự án

Các skill được cài trong .agents/skills cho Codex của dự án; không phải cài toàn bộ cho mọi workspace. Đợt bổ sung này có hairline-create, hairline-adopt và 4 skill của Emil: emil-design-eng, animation-performance, mobile-native, review-animations. Đã áp dụng phản hồi nút, hover theo khả năng thiết bị, vùng chạm, safe area, và loại bỏ React state cập nhật từng frame ở mô hình 3D.

Nguồn: https://hairline.lucasmarkes.com/ và https://emilkowal.ski/skill. Có thể cài lại bằng:

```sh
npx skills add lucasmarkes/hairline -a codex -y
npx skills add emilkowalski/skill -a codex --skill emil-design-eng animation-performance mobile-native review-animations -y
```

## Kiểm tra

Kết quả tự động trong qa/verification.json. Các thử nghiệm trình duyệt được ghi trong qa/browser-checks.md. Chưa kiểm tra trên điện thoại vật lý, Safari/iOS hoặc GPU điện thoại tầm trung. Cần kiểm tra các môi trường đó trước khi thay website chính. Chưa kết nối form/backend và không gửi dữ liệu khách hàng; các nút liên hệ dùng điện thoại, email và Zalo.

## Trang chủ v2 — 27/10/2026

Định hướng “Một đường lau mở ra không gian sạch”: chữ lớn, xanh rừng và xanh chanh, khung kính nhiều lớp, cây gạt theo cuộn hoặc thanh kéo, chọn dịch vụ đổi ảnh, ảnh công việc bất đối xứng và kết trang chữ lớn. Scroll Craft được áp dụng cho cấu trúc và nhịp; GSAP cho chuyển động; Emil cho phản hồi tương tác; Hairline cho hỏi đáp. SceneAI là nguồn tham khảo, không phải thư viện runtime được cài thêm.

Mã trang chủ: src/pages/index.astro, src/styles/wow.css, src/scripts/wow.ts. Hướng nghệ thuật: qa/scrollcraft/builds/tino/BRIEF.md.

## Design tooling and selected ThreeUI patterns

DESIGN.md records the homepage visual system using the Google Labs alpha format. @google/design.md 0.4.0 is installed as a development dependency; run npm run design:lint. AGENTS.md points Codex to this file. This is project guidance, not a globally installed Codex skill.

Two MIT ThreeUI Community button treatments are adapted into homepage links. See THIRD_PARTY_NOTICES.md and qa/threeui-selection.md. No complete ThreeUI runtime is added.

Dependency audit still reports upstream issues in the existing Astro/tooling dependency tree, including Zod used by the design linter. The preview is local and output is static. Dependency modernization and a fresh audit remain required before a production release; no forced major-version upgrade was made as part of the visual changes.
