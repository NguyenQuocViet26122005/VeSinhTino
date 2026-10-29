# Thống kê theo lệnh Telegram cho hai tài khoản riêng

Dùng chung `TELEGRAM_BOT_TOKEN` của form. Mỗi form khách hàng hợp lệ được gửi cùng nội dung tới **cả hai tài khoản riêng** (`TELEGRAM_CHAT_ID` và `TELEGRAM_REPORT_CHAT_ID_2`). Phần thống kê chỉ trả lời khi người quản lý gõ lệnh. Không có cron hay lịch gửi tự động. Người nào gõ lệnh nhận riêng câu trả lời báo cáo, không gửi sang người còn lại.

Form chỉ xác nhận thành công khi Telegram xác nhận gửi thành công đến cả hai người. Hai lần gửi chạy song song trong cùng thời hạn 8 giây. Một tài khoản bị chặn hoặc lỗi vẫn không ngăn lần gửi tới tài khoản kia. Nếu chỉ một người nhận được, form không báo thành công đầy đủ; khách gửi lại có thể tạo tin trùng ở người đã nhận. Chưa có kho hàng đợi bền vững/chống trùng giữa các lần gửi lại. Cả hai người cần bấm Start và không chặn bot.

## Lệnh

- `/homnay`: người dùng, phiên, lượt xem và top 5 trang của hôm nay.
- `/homqua`: cùng số liệu cho hôm qua.
- `/thang`: từ ngày 1 tháng này đến hiện tại.
- `/thangtruoc`: trọn tháng trước.
- `/baocao`: hôm nay và tháng này trong một tin.
- `/start`, `/help`: hướng dẫn các lệnh.

Số liệu theo Google Analytics 4, múi giờ Việt Nam; không phải số trực tuyến tức thời. GA4 có thể xử lý/cập nhật trong 24–48 giờ, trình chặn theo dõi có thể làm thiếu lượt. Chỉ có dữ liệu từ lúc gắn GA4. Người dùng theo tháng được truy vấn cho cả khoảng thời gian, không cộng số người từng ngày.

Chỉ hai Chat ID cấu hình được truy cập, chỉ chat riêng. Webhook yêu cầu secret token từ Telegram, giới hạn body 32 KiB; bỏ qua nhóm, tài khoản khác, tin nhắn sửa, file và nội dung không phải lệnh hỗ trợ. Không có dữ liệu Analytics sẽ báo chưa kết nối/lỗi lấy dữ liệu, không dựng số 0. Telegram có thể gửi lại update khi lỗi; hiện chưa dùng kho chống trùng nên một lệnh có thể được trả lời lại khi Telegram retry.

## 1. Google Analytics

1. Mở https://analytics.google.com bằng tài khoản Google quản lý Tino. Nếu có thuộc tính vesinhtino.com, dùng lại; nếu chưa có chọn **Start measuring / Bắt đầu đo lường**, tạo tài khoản Tino và thuộc tính **Vệ Sinh Tino**.
2. Múi giờ thuộc tính: **Việt Nam / Ho Chi Minh (GMT+07:00)**, tiền tệ VND. Server từ chối timezone khác để tránh báo sai ngày.
3. Đã xác nhận luồng **Web** cho `https://vesinhtino.com`: **Measurement ID `G-824Z7LYPZ5`**. Dùng lại luồng này; đặt mã vào `PUBLIC_GA_MEASUREMENT_ID` trên Vercel Production. Không gộp/ghi đè thẻ Google Ads hiện có trong màn hình thiết lập thẻ.
4. Trong luồng → **Enhanced measurement / Đo lường nâng cao**, tắt tính năng này cho luồng GA4 này. Code gửi `page_view` khi `astro:page-load`, đã hỗ trợ chuyển trang bằng ClientRouter; tránh tự đếm theo history vì sẽ trùng. Không gửi nội dung form; URL chỉ giữ các tham số chiến dịch chuẩn UTM/Google Ads, bỏ các tham số khác và fragment. Referrer bỏ toàn bộ query/fragment. Không đưa tên, email hoặc điện thoại vào tham số chiến dịch. Event được gửi riêng đến mã GA4 này, không gửi lan sang các mã Ads khác.
5. **Admin → Property details**: đã xác nhận **Property ID `394527770`**, đặt vào `GA4_PROPERTY_ID`; đây không phải mã `G-...` và không phải ID luồng `5764157990`.

## 2. Quyền đọc Analytics

1. Mở https://console.cloud.google.com, tạo hoặc chọn project Tino.
2. **APIs & Services → Library → Google Analytics Data API → Enable**.
3. **IAM & Admin → Service Accounts → Create service account**, tên `tino-analytics-reporter`. Không cần role project hay domain-wide delegation.
4. Service account → **Keys → Add key → Create new key → JSON**. Giữ file riêng tư, không gửi vào chat/Git.
5. Đã xác nhận email `tino-analytics-reporter@tino-analytics.iam.gserviceaccount.com` → biến `GA4_CLIENT_EMAIL`; `private_key` trong JSON → biến Secret `GA4_PRIVATE_KEY` ở Vercel Production. Khóa nhiều dòng hoặc dạng có `\n` đều được.
6. Google Analytics → **Admin → Property access management → Add users**: thêm `client_email`, chỉ cấp **Viewer**.

## 3. Hai tài khoản Telegram

1. Cả hai người mở bot đang nhận form và bấm **Start**.
2. Giữ nguyên `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` đã có trên Vercel. Thêm Chat ID dạng số dương của người thứ hai vào `TELEGRAM_REPORT_CHAT_ID_2`.
3. Có thể đọc `getUpdates` sau `/start` trong công cụ local bảo mật để lấy `message.chat.id` trước khi bật webhook. Với PowerShell 7 (`pwsh`), chạy `pwsh -NoProfile -File .\scripts\telegram-chat-ids.ps1` tại thư mục dự án, nhập token bot vào lời nhắc ẩn; công cụ chỉ hiển thị username bot và ID chat riêng, không ghi token ra file, không gửi tin, không xác nhận update bằng offset. Nếu đã có webhook, công cụ dừng và không thay đổi webhook. Không dán token vào URL trình duyệt/chat/ảnh chụp. Nếu PowerShell chặn script, báo lỗi chính sách để xử lý; không tự đổi ExecutionPolicy toàn máy.
4. Hai ID phải khác nhau. Người ngoài không được xem hay nhận thông báo về số liệu.

## 4. Bật webhook sau khi triển khai

Biến Production cần có:

- `PUBLIC_GA_MEASUREMENT_ID`: công khai, `G-...`, dùng lúc build.
- `GA4_PROPERTY_ID`: ID dạng số.
- `GA4_CLIENT_EMAIL`: email service account.
- `GA4_PRIVATE_KEY`: Secret server-only.
- `TELEGRAM_BOT_TOKEN`: Secret bot hiện tại, giữ nguyên.
- `TELEGRAM_CHAT_ID`: tài khoản quản lý đầu tiên, giữ nguyên.
- `TELEGRAM_REPORT_CHAT_ID_2`: tài khoản quản lý thứ hai.
- `TELEGRAM_WEBHOOK_SECRET`: Secret ngẫu nhiên 32–256 ký tự, chỉ chữ/số/`_`/`-`.

Sau khi nhập đủ biến, build và triển khai. Với PowerShell 7 (`pwsh`), chạy `pwsh -NoProfile -File .\scripts\telegram-webhook-setup.ps1` tại thư mục dự án. Công cụ đọc mã webhook từ `.env` local, kiểm tra endpoint thật bằng một update rỗng (không gửi tin), yêu cầu nhập token bot ẩn, kiểm tra webhook hiện tại, rồi hỏi xác nhận đúng username trước khi đăng ký. Công cụ không thay webhook khác URL, không ghi token vào file và không gửi tin thử. Phải tự nhập token ở Terminal, không dán token vào chat. Việc kiểm tra/mô phỏng local chưa chứng minh webhook đã đăng ký thật.

Dùng `getWebhookInfo` để kiểm tra webhook hiện tại. Nếu URL trống, đăng ký `setWebhook` của bot với JSON:

```json
{
  "url": "https://vesinhtino.com/api/traffic-report",
  "secret_token": "<giá trị TELEGRAM_WEBHOOK_SECRET đã lưu>",
  "allowed_updates": ["message"],
  "drop_pending_updates": false
}
```

Nếu đang có webhook khác, hợp nhất xử lý hoặc xác nhận thay đổi trước khi đăng ký; một bot chỉ có một webhook. Dùng POST từ công cụ bảo mật, không để token trong lịch sử trình duyệt/chat. Token/khóa không được nhúng trong website. Không cần `CRON_SECRET` hay Vercel Cron Jobs. Endpoint dùng POST không có dấu `/` cuối, cần kiểm tra không redirect sau deploy.

Sau cấu hình, ở Google Analytics Realtime kiểm tra tải trang và chuyển trang nội bộ: mỗi lần một `page_view`. Localhost và preview không thu thập. Hai người thử `/start`, `/homqua`, `/thang`; mỗi người chỉ nhận báo cáo của lệnh mình gõ. Thử tài khoản ngoài sẽ không trả số liệu. Chỉ coi hoàn tất khi có dữ liệu GA4 và thử webhook thật thành công.

## Kiểm tra local

`npm run test:traffic`, `npm run test:contact`, `npm run check`, `npm run build`, `npm run verify`. Tests dùng dữ liệu giả, không gửi Telegram thật.

Nguồn: https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart · https://developers.google.com/analytics/devguides/collection/ga4/views · https://core.telegram.org/bots/api#setwebhook
