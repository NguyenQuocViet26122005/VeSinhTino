// Only predefined diagnostics may reach logs or the two authorized bot users.
export const analyticsHints = Object.freeze({
  GA4_KEY: 'Khóa GA4_PRIVATE_KEY chưa đúng định dạng. Kiểm tra giá trị private_key trong file JSON.',
  GA4_AUTH: 'Google chưa chấp nhận tài khoản dịch vụ. Kiểm tra khóa còn hiệu lực và khớp GA4_CLIENT_EMAIL.',
  GA4_ACCESS: 'Tài khoản dịch vụ chưa đọc được tài sản GA4. Kiểm tra quyền Người xem và GA4_PROPERTY_ID.',
  GA4_API_DISABLED: 'Google Analytics Data API chưa được bật cho dự án của tài khoản dịch vụ.',
  GA4_TIMEZONE: 'Múi giờ tài sản GA4 chưa đúng Việt Nam. Chọn Việt Nam, GMT+07:00 trong Chi tiết tài sản.',
  GA4_NETWORK: 'Kết nối Google Analytics đang gián đoạn. Vui lòng thử lại sau.',
  GA4_RESPONSE: 'Google Analytics trả dữ liệu chưa đúng cấu trúc mong đợi. Cần kiểm tra phần kết nối.'
});

/** @typedef {keyof typeof analyticsHints} AnalyticsIssue */
export class AnalyticsReadError extends Error {
  /** @param {AnalyticsIssue} code */
  constructor(code) { super(code); this.name = 'AnalyticsReadError'; this.code = code; }
}
