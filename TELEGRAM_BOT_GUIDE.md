# Telegram: cấu hình sau khi sửa lỗi lộ token

## Trạng thái

Form gửi POST /api/contact cùng tên miền. Máy chủ gọi Telegram và chỉ trả ok: true khi Telegram trả HTTP thành công cùng ok: true. Khi thiếu cấu hình, mất mạng hoặc Telegram báo lỗi, form giữ thông tin và hiển thị hướng liên hệ trực tiếp. Không có token trong src/ hoặc bản build tĩnh.

## Việc chủ bot cần làm ngay

1. Mở đúng @BotFather trên Telegram, dùng /revoke và chọn bot cũ để thu hồi token đã lộ. Làm theo hướng dẫn BotFather để lấy token mới.
2. Trong dashboard hosting, thêm hai biến môi trường **phía máy chủ**: TELEGRAM_BOT_TOKEN (token mới) và TELEGRAM_CHAT_ID (ID người/nhóm nhận hiện có). Không dùng tiền tố PUBLIC_, không đưa token vào Git hoặc tin nhắn chat.
3. Với Vercel: entry point api/contact.ts. Đặt biến cho đúng môi trường Production/Preview và redeploy. Với Cloudflare Pages: entry point functions/api/contact.ts; đặt secrets trong Pages Settings và redeploy.
4. Bot phải được người nhận Start hoặc được thêm vào nhóm có quyền gửi tin.
5. Sau triển khai, chủ bot gửi một yêu cầu thử và đối chiếu tin nhận trong Telegram. Chưa có bước này thì chưa xác nhận kết nối production.

## Lưu ý triển khai

- astro dev / astro preview chỉ chạy website tĩnh, không chạy hai entry point hosting này. Dùng môi trường dev của Vercel hoặc Cloudflare để kiểm tra đầu cuối.
- Thiếu endpoint/biến môi trường sẽ hiện lỗi thay vì báo thành công giả.
- Có thể sao chép .env.example thành file môi trường cục bộ. File chứa secrets đã được Git ignore; tuyệt đối không commit token mới.
- Token cũ vẫn có thể nằm trong lịch sử Git và các deployment cũ. Xóa khỏi code không thay thế việc thu hồi. Sau khi cập nhật hosting cần bỏ các deployment cũ có bundle chứa token nếu nền tảng cho phép.
- Thay đổi này xử lý việc giữ bí mật token và xác nhận giao nhận. Giới hạn tần suất/WAF chống spam là công việc tiếp theo.
- Không tự gửi lại khi timeout: trạng thái có thể chưa xác nhận, hãy kiểm tra Telegram để tránh tin trùng.

Tài liệu: https://core.telegram.org/bots/tutorial#obtain-your-bot-token và https://vercel.com/docs/functions/runtimes/node-js

## Kiểm tra cục bộ

- npm run test:contact: các trường hợp gửi Telegram được giả lập, không gửi tin thật. Cần Node.js 24 (hoặc phiên bản hỗ trợ chạy TypeScript trực tiếp).
- npm run build: tạo web và tự kiểm tra mẫu token trong src/ + dist/.
- scripts/contact-browser.cjs: đặt TINO_PLAYWRIGHT trỏ tới module Playwright và tùy chọn TINO_CHROME trỏ tới trình duyệt Chrome. Kiểm thử endpoint giả lập, bao gồm timeout và lỗi mạng.
