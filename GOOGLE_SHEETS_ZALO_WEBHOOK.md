> LƯU TRỮ: luồng webhook trình duyệt trong tài liệu này đã được thay bằng API máy chủ Telegram. Không áp dụng hướng dẫn cũ để xác nhận đã nhận yêu cầu. Xem TELEGRAM_BOT_GUIDE.md.

# Hướng dẫn kết nối Google Sheets & Zalo Bot cho Form tư vấn Vệ Sinh Tino (Phương án 1)

Website Vệ Sinh Tino hiện đã chuyển sang **Phương án 1: Tiếp nhận và lưu trữ tự động trực tiếp trên website**.

Khách hàng chỉ cần nhập Họ tên, Số điện thoại và bấm **"Gửi yêu cầu khảo sát & báo giá"**:
- Form gửi thành công ngay trên trang web.
- Dữ liệu khách hàng được ghi nhận và lưu trữ an toàn (kèm bản sao lưu offline `localStorage`).
- Khách hàng xem được màn hình tóm tắt thông tin chuyên nghiệp và có sẵn nút tùy chọn mở Zalo gửi ảnh/video công trình nếu muốn.

---

## 1. Kết nối Google Sheets tự động (Miễn phí 100% — Chỉ 2 phút)

Khi kết nối với Google Sheet:
- Mọi khách hàng bấm gửi form sẽ tự động được thêm 1 dòng vào trang tính.
- Tự động gửi email thông báo tức thì đến Gmail của bạn (`vesinhtino@gmail.com`).

### Bước 1: Tạo Google Sheet
1. Truy cập [Google Sheets](https://sheets.new) và tạo một bảng tính mới, đặt tên ví dụ: `Khách Hàng Vệ Sinh Tino`.
2. Ở hàng đầu tiên (hàng 1), tạo các tiêu đề cột:
   - Cột A: **Thời gian**
   - Cột B: **Họ và tên**
   - Cột C: **Số điện thoại**
   - Cột D: **Dịch vụ**
   - Cột E: **Diện tích / Khối lượng**
   - Cột F: **Ghi chú / Địa chỉ**
   - Cột G: **Nguồn**

### Bước 2: Tạo Google Apps Script
1. Trên thanh menu Google Sheets, chọn **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
2. Xóa hết mã cũ và dán toàn bộ đoạn mã sau:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Ghi vào Google Sheet
    sheet.appendRow([
      data.displayTime || new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
      data.name,
      "'" + data.phone,
      data.service,
      data.area,
      data.notes,
      data.source || "Website Vệ Sinh Tino"
    ]);

    // Gửi email thông báo tức thì về Gmail
    try {
      MailApp.sendEmail({
        to: "vesinhtino@gmail.com",
        subject: "[Vệ Sinh Tino] Khách hàng mới: " + data.name + " (" + data.phone + ")",
        body: "Có yêu cầu tư vấn mới từ website Vệ Sinh Tino:\n\n" +
              "• Khách hàng: " + data.name + "\n" +
              "• Số điện thoại / Zalo: " + data.phone + "\n" +
              "• Dịch vụ cần làm: " + data.service + "\n" +
              "• Diện tích / Số lượng: " + data.area + "\n" +
              "• Ghi chú / Địa chỉ: " + data.notes + "\n" +
              "• Thời gian gửi: " + (data.displayTime || new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })) + "\n\n" +
              "Vui lòng liên hệ lại khách hàng sớm để báo giá!"
      });
    } catch (mailErr) {
      Logger.log("Email error: " + mailErr.message);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Bước 3: Triển khai Web App (Lấy Webhook URL)
1. Ở góc trên bên phải, bấm nút **Triển khai (Deploy)** -> chọn **Tùy chọn triển khai mới (New deployment)**.
2. Chọn loại triển khai là **Ứng dụng web (Web app)**:
   - **Mô tả**: Nhận form Vệ Sinh Tino
   - **Thực thi dưới dạng (Execute as)**: Tôi (Me - địa chỉ email của bạn)
   - **Người có quyền truy cập (Who has access)**: **Bất kỳ ai (Anyone)** *(Bắt buộc chọn Anyone để website gửi dữ liệu vào được)*.
3. Bấm **Triển khai (Deploy)** và cấp quyền truy cập tài khoản khi Google hỏi.
4. Sao chép đường dẫn **URL ứng dụng web** (dạng `https://script.google.com/macros/s/AKfy.../exec`).

### Bước 4: Dán vào mã nguồn website
Mở file `src/data/site.ts`, tìm dòng `export const contact`:
```typescript
export const contact = {
  phone: '0925649666',
  display: '0925 649 666',
  email: 'vesinhtino@gmail.com',
  zalo: 'https://zalo.me/0925649666',
  hours: '08:00 – 20:00',
  webhookUrl: 'https://script.google.com/macros/s/AKfy.../exec', // <-- DÁN URL CỦA BẠN VÀO ĐÂY
  addresses: [...]
};
```
Lưu file và chạy `npm run build` là xong!

---

## 2. Kết nối thông báo về Nhóm Zalo (Tùy chọn)

Nếu bạn muốn có một bot gửi thông báo trực tiếp vào nhóm Zalo khi có khách:
- **Cách 1 (Đơn giản nhất)**: Sử dụng dịch vụ Webhook Zalo (ví dụ bot webhook Zalo OA hoặc webhook nhóm của Lark/Chatbot).
- **Cách 2**: Thêm đoạn mã sau vào cuối hàm `doPost` trong Google Apps Script:
```javascript
// Gửi thông báo đến Webhook Zalo / Chatbot
var zaloWebhookUrl = "https://your-zalo-webhook-url";
UrlFetchApp.fetch(zaloWebhookUrl, {
  method: "post",
  contentType: "application/json",
  payload: JSON.stringify({
    text: "🔔 Khách mới Vệ Sinh Tino: " + data.name + " (" + data.phone + ") - Dịch vụ: " + data.service
  })
});
```
