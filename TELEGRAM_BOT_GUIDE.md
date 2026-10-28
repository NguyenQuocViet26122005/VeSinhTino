# Hướng dẫn quản trị & cài đặt Bot Telegram nhận khách cho Vệ Sinh Tino

Hệ thống đã được tích hợp và **kích hoạt sẵn sàng 100%**. 

Mỗi khi khách hàng điền form tư vấn và bấm **"Gửi yêu cầu khảo sát & báo giá"** trên website, thông tin khách hàng sẽ ngay lập tức được gửi đến **Telegram** của bạn với âm thanh và thông báo tức thì (chưa tới 1 giây)!

---

## 1. Trạng thái kết nối hiện tại

* **Tên Bot**: `@tino_thong_bao_bot` (Tino thong bao)
* **Chat ID nhận tin hiện tại**: `6668216030` (@hainam_68 - Nam Nguyễn Hải)
* **Cấu hình lưu tại**: [`src/data/site.ts`](file:///c:/Users/Modern%2014/Videos/VeSinhTino/src/data/site.ts#L1)
* **Định dạng tin nhắn nhận được**:
  ```text
  🔔 CÓ YÊU CẦU BÁO GIÁ MỚI - VỆ SINH TINO

  👤 Khách hàng: Anh Tuấn
  📞 Số điện thoại: 0925649666
  🧹 Dịch vụ: Tổng vệ sinh nhà sau xây dựng
  📐 Diện tích / Khối lượng: 120m²
  📝 Ghi chú / Địa chỉ: Nhà mới hoàn thiện cần dọn dẹp cuối tuần
  ⏰ Thời gian: 22:15 - 28/10/2026

  🌐 Tiếp nhận từ website Vệ Sinh Tino
  ```
  *(Số điện thoại được định dạng sẵn `<code>`, bạn chỉ cần chạm nhẹ vào số là tự động copy để gọi điện ngay).*

---

## 2. Hướng dẫn tạo Bot Telegram MỚI (Nếu bạn muốn đổi tên bot)

Nếu sau này bạn muốn tự tạo một con Bot riêng với tên khác:

### Bước 1: Tạo Bot qua BotFather
1. Mở ứng dụng Telegram trên điện thoại hoặc máy tính.
2. Tìm kiếm người dùng: `@BotFather` (có tích xanh chính thức).
3. Bấm **Start** và gửi lệnh: `/newbot`
4. BotFather sẽ hỏi:
   - **Tên hiển thị của bot**: Ví dụ nhập `Vệ Sinh Tino Bot`
   - **Username của bot** (phải kết thúc bằng chữ `bot`): Ví dụ nhập `vesinhtino_lead_bot`
5. Sau khi tạo xong, BotFather sẽ gửi cho bạn một đoạn mã **Token** dạng:
   `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
   *(Hãy sao chép lại chuỗi Token này)*.

### Bước 2: Kích hoạt Bot
* Nhấp vào đường link bot mà BotFather vừa tạo (hoặc tìm kiếm username của bot trên Telegram).
* Bấm nút **START** để bắt đầu kích hoạt bot.

### Bước 3: Lấy Chat ID của bạn
1. Tìm kiếm bot `@userinfobot` trên Telegram.
2. Bấm **START**, bot sẽ phản hồi ngay lập tức dãy số `Id:` của bạn (Ví dụ: `5193894351`).

### Bước 4: Cập nhật vào Website
Mở file `src/data/site.ts`, tìm đến dòng `telegram:` và thay thế Token cùng Chat ID mới:
```typescript
telegram: {
  botToken: 'DÁN_TOKEN_MỚI_VÀO_ĐÂY',
  chatId: 'DÁN_CHAT_ID_CỦA_BẠN_VÀO_ĐÂY'
}
```

---

## 3. Cách thêm Bot vào NHÓM Telegram (Để cả đội ngũ cùng nhận khách)

Nếu bạn có nhóm nhân viên / kỹ thuật viên và muốn khi có khách mới thì cả nhóm cùng nhận được:

1. **Tạo Nhóm (Group)** trên Telegram hoặc mở nhóm hiện có.
2. Thêm con bot `@tino_thong_bao_bot` vào làm thành viên nhóm.
3. Cấp quyền quản trị viên (Admin) cho Bot trong nhóm để bot có quyền gửi tin.
4. Gửi một tin nhắn bất kỳ vào nhóm (ví dụ: `test bot`).
5. Mở trình duyệt và truy cập đường link sau (thay `<TOKEN>` bằng token của bot):
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
6. Tìm dòng `"chat":{"id": -100xxxxxxxxxx` (ID của nhóm Telegram luôn có dấu trừ `-` ở đầu, ví dụ `-1002345678901`).
7. Thay thế `chatId: '-100xxxxxxxxxx'` vào file `src/data/site.ts`.
8. Từ nay, mọi đơn yêu cầu khảo sát sẽ nhảy thẳng vào nhóm chat chung của công ty!
