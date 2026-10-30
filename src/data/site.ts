export const contact = { phone: '0925649666', display: '0925 649 666', email: 'vesinhtino@gmail.com', zalo: 'https://zalo.me/0925649666', hours: '08:00 – 20:00', webhookUrl: '', addresses: ['557 Tô Ký, Trung Mỹ Tây, Quận 12, TP.HCM','151 Nguyễn Đình Chính, Phường 11, Phú Nhuận, TP.HCM','37B Nguyễn Văn Linh, Tân Thuận Tây, Quận 7, TP.HCM'] };
export const image = (id: string) => '/images/' + id + '.webp';
export type PriceRow = { name: string; price: string; unit: string; source: string };
const commonSource = 'https://vesinhtino.com/dich-vu-ve-sinh-cong-nghiep/';
export const commonPrices: PriceRow[] = [
 {name:'Tổng vệ sinh nhà sau xây dựng',price:'12.000–20.000',unit:'m²',source:commonSource},
 {name:'Tổng vệ sinh chung cư trọn gói (50m²)',price:'Từ 1.600.000',unit:'Căn',source:commonSource},
 {name:'Tổng vệ sinh nhà ở và nhà cũ',price:'10.000–20.000',unit:'m²',source:commonSource},
 {name:'Vệ sinh kính trong',price:'5.000–10.000',unit:'m²',source:commonSource},
 {name:'Vệ sinh kính ngoài cao tầng',price:'Liên hệ',unit:'m²',source:commonSource},
 {name:'Vệ sinh ghế sofa',price:'250.000–500.000',unit:'Cái',source:commonSource},
 {name:'Vệ sinh thảm',price:'15.000–20.000',unit:'m²',source:commonSource}
];
export const apartmentPrices: PriceRow[] = [
 {name:'Căn hộ 1 phòng ngủ / Studio (≈ 50m²)',price:'Từ 1.600.000',unit:'Căn',source:commonSource},
 {name:'Căn hộ 2 phòng ngủ (65–85m²)',price:'1.950.000–2.550.000',unit:'Căn',source:commonSource},
 {name:'Căn hộ 3 phòng ngủ & Duplex (85–120m²)',price:'2.550.000–3.600.000',unit:'Căn',source:commonSource}
];
export const factoryPrices: PriceRow[] = [
 {name:'Nhà xưởng dưới 500m²',price:'10.000–15.000',unit:'m²',source:'https://vesinhtino.com/ve-sinh-nha-xuong/'},
 {name:'Nhà xưởng 500–1000m²',price:'8.000–12.000',unit:'m²',source:'https://vesinhtino.com/ve-sinh-nha-xuong/'},
 {name:'Nhà xưởng trên 1000m²',price:'6.000–10.000',unit:'m²',source:'https://vesinhtino.com/ve-sinh-nha-xuong/'}
];
export const glassPrices: PriceRow[] = [
 {name:'Vệ sinh kính bằng giàn giáo',price:'12.000–20.000',unit:'m²',source:'https://vesinhtino.com/ve-sinh-kinh-toa-nha/'},
 {name:'Vệ sinh kính bằng dây đu',price:'15.000–25.000',unit:'m²',source:'https://vesinhtino.com/ve-sinh-kinh-toa-nha/'},
 {name:'Vệ sinh kính bằng xe nâng',price:'18.000–30.000',unit:'m²',source:'https://vesinhtino.com/ve-sinh-kinh-toa-nha/'}
];
export const services = [
 {
   slug:'dich-vu-ve-sinh-cong-nghiep',
   name:'Vệ sinh công nghiệp',
   short:'Công nghiệp',
   category:'business',
   tag:'Cho mọi công trình',
   photo:'934c3c727f9a36a0',
   description:'Làm sạch tổng thể sau xây dựng, sửa chữa và trước khi đưa công trình vào sử dụng.',
   intro:'Từ bụi sau xây dựng đến các bề mặt cần làm sạch kỹ, Tino kết hợp nhân công cùng máy móc chuyên dụng (máy hút bụi 3 motor, máy chà sàn mâm xoay, hóa chất sinh học) để làm sạch tỉ mỉ từng khu vực.',
   suitableFor:'Nhà phố mới xây, căn hộ vừa hoàn thiện nội thất, tòa nhà văn phòng, mặt bằng kinh doanh hoặc showroom trước ngày khai trương.',
   tasks:['Thu gom bụi và rác sau thi công','Vệ sinh sàn, tường, cửa và kính','Làm sạch khu bếp, nhà vệ sinh','Kiểm tra và bàn giao từng khu vực'],
   scopeStandard:['Thu gom và dọn rác thô, bao bì, phế liệu xây dựng còn sót lại','Hút bụi mịn công nghiệp trên trần thạch cao, tường, hộc tủ và khe ray cửa kính','Sủi sạch vệt sơn, xi măng, keo dán bảo vệ bám trên khung cửa và mặt sàn','Chà làm sạch sàn gạch, sàn đá bằng dụng cụ phù hợp sau khi kiểm tra bề mặt','Làm sạch sâu nhà vệ sinh, thiết bị vệ sinh, tẩy cặn canxi trên vách kính','Lau sạch bề mặt tủ bếp, mặt đá bàn bếp và bồn rửa'],
   scopeCustom:['Bốc dỡ xà bần khối lượng lớn (cần xe tải vận chuyển riêng)','Vệ sinh kính ngoài cao tầng mặt ngoài cần đu dây hoặc thuê xe nâng chuyên dụng','Xử lý phục hồi sàn đá hoa cương, marble bị trầy xước sâu hoặc thấm ố từ trước'],
   quoteGuide:'Gửi ảnh hoặc video quay hiện trạng qua Zalo 0925 649 666 (diện tích sàn, số tầng, tình trạng bụi/sơn) để nhận tư vấn phương án và trao đổi báo giá phù hợp, hoặc đặt lịch kỹ thuật viên đến khảo sát thực tế.',
   photos:['934c3c727f9a36a0','b486da45979bde972f03edd7f9a890e5','41f3007bebe1b48896b222b6b4651341','ea3d500c6c2d84748035b2924802a706','606d1140fe49df7060f5a8997d8261c2','tino-danh-san-tho'],
   prices:commonPrices,
   priceNote:'Bảng giá tổng hợp các hạng mục vệ sinh công nghiệp và sau xây dựng (12.000–20.000 đ/m²).'
 },
 {
   slug:'ve-sinh-nha-o',
   name:'Vệ sinh nhà ở',
   short:'Nhà ở',
   category:'home',
   tag:'Chăm chút tổ ấm',
   photo:'f3e9578413dffb6cd7a69149858785c1',
   description:'Tổng vệ sinh nhà ở, căn hộ và không gian sinh hoạt, từ sàn nhà đến những góc nhỏ.',
   intro:'Một căn nhà sạch bắt đầu từ những chi tiết nhỏ. Dịch vụ vệ sinh nhà ở giúp bạn chăm sóc không gian sống định kỳ, dọn vào nhà mới hoặc tổng vệ sinh đón các dịp đặc biệt.',
   suitableFor:'Gia đình cần tổng dọn nhà định kỳ 3–6 tháng, nhà cũ lâu ngày không ở, gia đình chuẩn bị chuyển vào nhà mới hoặc căn hộ chung cư cần dọn sạch toàn diện.',
   tasks:['Vệ sinh phòng khách và phòng ngủ','Làm sạch cửa, kính, kệ và sàn','Vệ sinh bếp và nhà tắm','Thu dọn, kiểm tra và bàn giao'],
   scopeStandard:['Hút bụi trần, quét mạng nhện, lau bóng đèn và quạt trần','Lau sạch bụi bề mặt bàn ghế, kệ sách, mặt ngoài tủ quần áo','Tẩy sạch dầu mỡ khu vực nấu nướng, máy hút mùi và mặt bàn bếp','Chà sàn nhà tắm, tẩy ố ron gạch và cặn vôi trên gương, vòi nước','Lau chùi cửa đi, cửa sổ, ban công và hút bụi gầm giường gầm tủ','Lau sàn nhà bằng dung dịch lau sàn sinh học với hương thơm dịu nhẹ'],
   scopeCustom:['Giặt nệm, rèm cửa hoặc thảm trang trí lớn theo yêu cầu riêng','Dọn dẹp kho chứa đồ cũ có nhiều phế liệu cồng kềnh','Đánh bóng sàn gỗ hoặc bảo dưỡng bề mặt da cao cấp'],
   quoteGuide:'Chỉ cần gửi thông tin diện tích nhà, số phòng ngủ, số tầng và khu vực (Quận 12, Phú Nhuận, Quận 7 hoặc các quận khác) qua Zalo 0925 649 666 để nhận tư vấn gói trọn gói phù hợp.',
   photos:['f3e9578413dffb6cd7a69149858785c1','b486da45979bde972f03edd7f9a890e5','effe031abcb585223e20306ddd1fed11','9db6f83bac2bd674967360f2b23a76fe','89bcb22b0f0134522c66b5fa88f028b1','65aa37a328718bb9311f34b8b2e2edf9'],
   prices:[commonPrices[2]],
   priceNote:'Mức giá cho tổng vệ sinh nhà ở định kỳ, dọn vào nhà mới hoặc nhà cũ.'
 },
 {
   slug:'ve-sinh-nha-xuong',
   name:'Vệ sinh nhà xưởng',
   short:'Nhà xưởng',
   category:'business',
   tag:'Không gian làm việc',
   photo:'e6ecb611e10bc770',
   description:'Vệ sinh kho và nhà xưởng theo diện tích, tình trạng bề mặt và nhu cầu thực tế.',
   intro:'Vệ sinh nhà xưởng cần thống nhất phạm vi, lịch làm việc và cách bố trí từng khu vực theo hoạt động sản xuất thực tế của doanh nghiệp.',
   suitableFor:'Kho bãi lưu trữ hàng hóa, nhà xưởng cơ khí, xưởng may, xưởng sản xuất thực phẩm hoặc nhà kho chuẩn bị bàn giao mặt bằng.',
   tasks:['Khảo sát diện tích và hiện trạng','Làm sạch bụi, bề mặt sàn và lối đi','Bố trí công việc theo khu vực','Kiểm tra kết quả sau thi công'],
   scopeStandard:['Quét mạng nhện, hút bụi trần, dầm kèo, máng đèn và đường ống kỹ thuật trên cao','Làm sạch bề mặt tường panel hoặc tường gạch bao quanh nhà xưởng','Tẩy rửa dầu mỡ công nghiệp, vệt bánh xe nâng bám trên sàn bê tông, sàn epoxy','Hút bụi mịn và lau chùi khu vực văn phòng điều hành bên trong xưởng','Thu gom rác thải công nghiệp thông thường vào khu vực tập kết'],
   scopeCustom:['Vệ sinh bề mặt dây chuyền máy móc sản xuất chuyên dụng (cần kỹ sư phối hợp)','Sơn lại hoặc mài bóng sàn bê tông/epoxy diện rộng','Thi công vào ca đêm hoặc ngày lễ để tránh ngừng sản xuất'],
   quoteGuide:'Tino đến tận nơi khảo sát trực tiếp diện tích, độ cao trần và hiện trạng dầu mỡ để lập phương án và bảng báo giá chi tiết theo thực tế.',
   photos:['e6ecb611e10bc770','0822a0e36fddb2a9dd9a1b6424f8ff49','37d0a644bec5bde9bb0111d3d8cc929a','f911a44071a765251aab844dfd730298','a6161a90ab53b0353539b89e3b00de46','1dbcc214c91f18f3'],
   prices:factoryPrices,
   priceNote:'Đơn giá trên mỗi m², phân theo tổng diện tích nhà xưởng.'
 },
 {
   slug:'ve-sinh-kinh-toa-nha',
   name:'Vệ sinh kính tòa nhà',
   short:'Kính tòa nhà',
   category:'business',
   tag:'Trong hơn, sáng hơn',
   photo:'c949d223bc44f1ae',
   description:'Làm sạch kính tòa nhà bằng phương án thi công phù hợp với vị trí và độ cao.',
   intro:'Bề mặt kính sáng rõ giúp công trình đón trọn ánh sáng tự nhiên. Tino lựa chọn giải pháp giàn giáo, dây đu hoặc xe nâng dựa trên hiện trạng kiến trúc và điều kiện an toàn thực tế.',
   suitableFor:'Tòa nhà văn phòng, showroom ô tô, trung tâm thương mại, ngân hàng, biệt thự có vách kính cao hoặc mặt dựng nhôm kính lớn.',
   tasks:['Khảo sát bề mặt kính và vị trí thi công','Xác định phương án tiếp cận phù hợp','Vệ sinh kính, khung và các mép kính','Kiểm tra bề mặt sau khi làm sạch'],
   scopeStandard:['Gạt bụi, làm sạch bề mặt kính hai mặt trong nhà','Tẩy vết sơn, keo dán biển quảng cáo cũ, vết ố vảy cá trên bề mặt kính','Vệ sinh khung nhôm, khe gioăng cao su và lau sạch rãnh thoát nước','Dùng dung dịch làm sạch kính chuyên dụng chống bám bụi và chống tĩnh điện'],
   scopeCustom:['Đu dây lau kính mặt ngoài cao tầng cho các cao ốc trên 3 tầng','Sử dụng xe nâng tự hành cho các vị trí sảnh vòm hoặc kết cấu vát nghiêng','Bắn lại keo silicone chống dột cho hệ mặt dựng kính lâu năm'],
   quoteGuide:'Liên hệ hotline 0925 649 666 để nhân viên kỹ thuật đu dây đến khảo sát mặt bằng điểm neo, đo đạc kích thước và gửi báo giá theo hiện trạng và phương án tiếp cận.',
   photos:['c949d223bc44f1ae','abce569d7fb37039'],
   prices:glassPrices,
   priceNote:'Giá riêng theo phương pháp thi công. Bảng tổng hợp vẫn ghi kính ngoài cao tầng: Liên hệ.'
 },
 {
   slug:'dich-vu-giat-tham',
   name:'Giặt thảm',
   short:'Giặt thảm',
   category:'home',
   tag:'Sạch từ bề mặt',
   photo:'e20602f023e8669e',
   description:'Vệ sinh thảm bằng thiết bị chuyên dụng, lựa chọn cách xử lý theo chất liệu.',
   intro:'Thảm cần được kiểm tra chất liệu, vết bẩn và điều kiện làm khô trước khi chọn cách hút bụi hoặc giặt phù hợp.',
   suitableFor:'Văn phòng công ty trải thảm tấm/thảm cuộn diện rộng, hội trường, phòng họp, thảm trang trí phòng khách gia đình hoặc thảm cầu thang.',
   tasks:['Kiểm tra chất liệu và vết bẩn','Hút bụi trước khi giặt','Làm sạch bằng thiết bị chuyên dụng','Hút nước và hướng dẫn làm khô'],
   scopeStandard:['Hút bụi khô sâu toàn bộ bề mặt thảm bằng máy hút bụi công nghiệp 3 motor','Phun dung dịch sinh học chuyên dụng tạo bọt mềm đánh tan vết bẩn và ố cà phê','Dùng máy chà tay hoặc máy chà sàn gắn mâm bàn chải mềm đảo đều sợi thảm','Hút sạch nước bẩn và bọt xà phòng bằng đầu hút chân không chuyên dụng','Thổi gió bằng quạt sấy công suất lớn để hỗ trợ làm khô sợi thảm'],
   scopeCustom:['Xử lý vết ố trà, cà phê, rượu vang lâu năm đã ngấm sâu vào lớp đế cao su','Xử lý mùi hoặc chất liệu đặc biệt cần kiểm tra và trao đổi phương án riêng'],
   quoteGuide:'Gửi diện tích m² thảm văn phòng hoặc kích thước thảm tấm qua Zalo 0925 649 666 để nhận giá trọn gói và sắp xếp lịch làm việc ngoài giờ hành chính.',
   photos:['e20602f023e8669e','tino-tham-may-giat'],
   prices:[commonPrices[6]],
   priceNote:'Giá vệ sinh thảm trong bảng tổng hợp của Tino.'
 },
 {
   slug:'dich-vu-giat-ghe-sofa',
   name:'Giặt ghế sofa',
   short:'Ghế sofa',
   category:'home',
   tag:'Êm ái mỗi ngày',
   photo:'122cac8e1bd2f9d6',
   description:'Chăm sóc sofa tại nhà, kiểm tra chất liệu và xử lý các khu vực cần làm sạch.',
   intro:'Chiếc sofa là nơi sum vầy mỗi ngày của gia đình. Tino sử dụng hóa chất làm sạch phù hợp kết hợp máy hút phun áp lực để làm sạch bề mặt, hỗ trợ khử mùi và bảo vệ sợi vải hoặc bề mặt da.',
   suitableFor:'Sofa vải nỉ, sofa da thật, da công nghiệp, sofa góc chữ L, đôn sofa gia đình, ghế văn phòng và ghế ăn bọc nệm.',
   tasks:['Kiểm tra chất liệu bọc ghế','Hút bụi ở bề mặt và các khe','Xử lý vết bẩn và làm sạch phù hợp','Hướng dẫn làm khô trước khi sử dụng'],
   scopeStandard:['Hút sạch bụi bẩn, vụn thức ăn và lông thú cưng trong từng kẽ ghế và đệm ngồi','Kiểm tra chất liệu vải/da để chọn dung dịch làm sạch phù hợp','Xử lý vết bẩn ố bằng máy chà cầm tay mini và dung dịch sinh học chuyên biệt','Phun hút chân không để làm sạch bụi bẩn, cặn bám và nước dơ trong sợi vải','Lau dưỡng bề mặt chuyên dụng (đối với sofa da) giúp da mềm mại và chống nứt'],
   scopeCustom:['Giặt nệm cao su, nệm lò xo cùng đợt tại nhà','Xử lý vết mực bút bi hoặc vết dầu nhớt bám lâu ngày'],
   quoteGuide:'Chụp ảnh ghế sofa gửi qua Zalo 0925 649 666, Tino sẽ trao đổi và báo giá theo kích thước, chất liệu ghế.',
   photos:['122cac8e1bd2f9d6','tino-sofa-quy-trinh'],
   prices:[commonPrices[5]],
   priceNote:'Giữ nguyên đơn vị “Cái” của bảng giá gốc; báo giá cụ thể sau khi xác định loại ghế.'
 }
];

export const steps = [
 ['01','Lắng nghe nhu cầu','Cho Tino biết không gian, diện tích và công việc bạn cần hỗ trợ qua điện thoại hoặc Zalo.'],
 ['02','Khảo sát & báo giá','Kiểm tra hiện trạng thực tế, thống nhất rõ từng hạng mục và chi phí trọn gói trước khi làm.'],
 ['03','Tỉ mỉ làm sạch','Đội ngũ kỹ thuật viên cùng thiết bị chuyên dụng thực hiện các hạng mục đã thống nhất.'],
 ['04','Nghiệm thu & bàn giao','Khách hàng kiểm tra thực tế từng hạng mục trước khi tiến hành thanh toán.']
];

export const faqs = [
 ['Khách hàng cần chuẩn bị những gì trước buổi vệ sinh?', 'Bạn chỉ cần hỗ trợ nguồn điện, nguồn nước sinh hoạt để máy móc vận hành và cất giữ các tư trang, tài sản cá nhân quý giá. Toàn bộ máy móc (máy hút bụi công nghiệp, máy chà sàn, quạt sấy), dụng cụ và hóa chất làm sạch chuyên dụng đều do đội ngũ Tino chuẩn bị đầy đủ.'],
 ['Thời gian thực hiện một công trình phụ thuộc vào những yếu tố nào?', 'Thời gian phụ thuộc vào diện tích thực tế, mức độ bám bẩn (công trình mới xây nhiều sơn xi măng hay nhà ở định kỳ) và số lượng kỹ thuật viên điều phối. Thời gian thực tế sẽ được trao đổi cụ thể sau khi xem xét khối lượng công việc và số lượng nhân sự bố trí.'],
 ['Đơn giá trên website đã bao gồm những chi phí nào?', 'Đơn giá đã bao gồm các phần việc cơ bản: nhân công kỹ thuật, máy móc thiết bị và hóa chất làm sạch chuyên dụng. Tino trao đổi và thống nhất chi phí rõ ràng trước khi làm theo phạm vi công việc đã xác định.'],
 ['Trường hợp công trình nào Tino cần khảo sát trực tiếp trước?', 'Các công trình nhà xưởng quy mô lớn, mặt ngoài kính cao ốc cần phương án tiếp cận đặc thù hoặc nhà sau xây dựng kết cấu phức tạp thường cần khảo sát thực tế. Với căn hộ, nhà phố hoặc giặt sofa/thảm, bạn có thể gửi ảnh hoặc video qua Zalo để trao đổi báo giá thuận tiện.'],
 ['Quy trình nghiệm thu và xử lý nếu có góc chưa đạt yêu cầu ra sao?', 'Bạn cùng giám sát Tino sẽ trực tiếp đi kiểm tra từng khu vực theo các hạng mục đã thỏa thuận. Nếu có chi tiết nào chưa đạt yêu cầu theo thỏa thuận ban đầu, kỹ thuật viên sẽ xử lý lại ngay tại chỗ trước khi nghiệm thu bàn giao.']
];

export const articles = [
  {
    "slug": "dich-vu-ve-sinh-cong-nghiep-o-tphcm",
    "title": "Kinh nghiệm chọn dịch vụ vệ sinh công nghiệp tại TP.HCM",
    "category": "Dịch vụ Tino",
    "photo": "f073dd95d8ed1766",
    "lead": "Hướng dẫn chi tiết cách chuẩn bị thông tin, so sánh đơn giá theo m² và kiểm tra nghiệm thu khi thuê dịch vụ vệ sinh công nghiệp tại TP.HCM.",
    "sections": [
      [
        "Đặc thù công trình và nhu cầu vệ sinh công nghiệp tại TP.HCM",
        "TP.HCM là đô thị phát triển với mật độ xây dựng cao và đa dạng hình thái công trình: từ nhà phố cao tầng trong các con hẻm nhỏ tại Quận 12, Phú Nhuận, căn hộ chung cư cao tầng tại Quận 7, Quận 2, đến các kho bãi và nhà xưởng vùng ven. Mỗi loại hình đòi hỏi trang thiết bị cơ động phù hợp (xe máy chở máy hút bụi 3 motor, thang nhôm chữ A) và kinh nghiệm xử lý linh hoạt theo quy định ban quản lý tòa nhà về thời gian thi công, tiếng ồn và an toàn phòng cháy chữa cháy."
      ],
      [
        "Những thông tin quan trọng cần chuẩn bị khi nhận báo giá",
        "Để nhận được bảng dự toán chính xác và nhanh chóng từ đơn vị vệ sinh, bạn nên chuẩn bị trước: (1) Địa chỉ cụ thể và loại hình công trình (nhà phố, chung cư hay nhà xưởng); (2) Diện tích sàn ước tính theo m² và số tầng cần làm sạch; (3) Hiện trạng công trình (mới thi công xong nhiều bụi bê tông, sơn xi măng hay nhà cũ cần dọn đón Tết); (4) Tình trạng nguồn điện và nước sinh hoạt tại công trình. Việc gửi kèm hình ảnh hoặc đoạn video ngắn quay hiện trạng qua Zalo 0925 649 666 sẽ giúp đội ngũ kỹ thuật nhanh chóng nắm bắt khối lượng công việc và trao đổi phương án phù hợp."
      ],
      [
        "Cách đọc và so sánh bảng giá vệ sinh theo m²",
        "Tại thị trường TP.HCM, đơn giá vệ sinh công nghiệp sau xây dựng dao động từ 12.000 đến 20.000 đ/m² tùy theo mức độ bẩn và kết cấu công trình. Khi so sánh báo giá giữa các đơn vị, bạn cần lưu ý: Đơn giá đã bao gồm trọn gói nhân công, máy móc và hóa chất tẩy rửa an toàn hay chưa? Có phát sinh phụ phí vận chuyển thiết bị vào hẻm sâu không? Chi phí đã thống nhất rõ ràng theo phạm vi công việc hay chưa? Tại Vệ Sinh Tino, các khoản mục công việc được trao đổi rõ ràng từ đầu và nghiệm thu thực tế trước khi thanh toán."
      ],
      [
        "Khu vực phục vụ và điều kiện khảo sát thực tế",
        "Tino bố trí các tổ kỹ thuật cơ động túc trực tại 3 khu vực chiến lược: Quận 12 (557 Tô Ký), Phú Nhuận (151 Nguyễn Đình Chính), Quận 7 (37B Nguyễn Văn Linh) và sẵn sàng cơ động đến mọi quận huyện nội ngoại thành TP.HCM. Với công trình có diện tích lớn hoặc kiến trúc phức tạp, kỹ thuật viên Tino sẵn sàng đến khảo sát thực tế để tư vấn phương án thi công phù hợp."
      ],
      [
        "Quy trình nghiệm thu công trình đúng chuẩn",
        "Khi nghiệm thu buổi vệ sinh công nghiệp, khách hàng nên cùng giám sát đi kiểm tra từ trên xuống dưới theo thứ tự: Kiểm tra khe ray nhôm kính cửa sổ (nơi bụi mịn dễ đọng), mặt ngoài và bên trong hộc tủ, gờ chân tường, bề mặt sàn gạch/đá xem còn vết sơn hay keo không, và độ sạch bóng của thiết bị phòng tắm. Nếu còn bất kỳ chi tiết nào chưa ưng ý, kỹ thuật viên Tino sẽ xử lý lại ngay tại chỗ trước khi ký biên bản bàn giao."
      ]
    ]
  },
  {
    "slug": "ve-sinh-cong-nghiep-sau-xay-dung",
    "title": "Quy trình tổng vệ sinh nhà và công trình sau xây dựng",
    "category": "Sau xây dựng",
    "photo": "c712448182b497ed",
    "lead": "Các bước xử lý bụi mịn xi măng, tẩy vết sơn keo thừa và bảo vệ bề mặt vật liệu mới hoàn thiện trước khi đưa công trình vào sử dụng.",
    "sections": [
      [
        "Hiện trạng bám bẩn đặc thù tại công trình sau xây dựng",
        "Sau khi thợ hồ, thợ sơn và thợ mộc hoàn thiện thi công, công trình thường để lại lớp bụi xi măng mịn len lỏi vào từng ngóc ngách, vết sơn nước và sơn dầu vương vãi trên sàn gạch, keo dán màng bảo vệ cửa kính bị nắng hóa bám chặt, cùng các mẩu phế liệu thô sót lại. Nếu không xử lý đúng phương pháp, việc quét dọn thông thường sẽ khiến bụi mịn bay lơ lửng rồi lắng đọng trở lại, hoặc dùng dụng cụ cứng làm xước hỏng bề mặt vật liệu mới đắt tiền."
      ],
      [
        "Quy trình 4 bước làm sạch chuyên sâu từ thô đến tinh",
        "Đội ngũ Tino áp dụng quy trình chuẩn 4 bước: (1) Dọn thô: Thu gom toàn bộ rác phế thải, bao bì, thanh nẹp thừa đóng bao chuyển ra vị trí tập kết; (2) Hút bụi đa tầng: Dùng máy hút bụi công nghiệp 3 motor hút sạch bụi mịn từ trần thạch cao, gờ phào chỉ, khung cửa sổ xuống sàn; (3) Tẩy điểm chuyên dụng: Sử dụng sủi chuyên dụng và hóa chất sinh học làm mềm vết xi măng, sơn nước, keo dán mà không ăn mòn men gạch hay khung nhôm; (4) Đánh bóng sàn: Sử dụng máy chà sàn công nghiệp mâm xoay kết hợp pad đánh bóng và máy hút nước công suất lớn để hoàn thiện bề mặt."
      ],
      [
        "Nguyên tắc bảo vệ bề mặt vật liệu mới trong quá trình làm sạch",
        "Trong vệ sinh sau xây dựng, nguyên tắc bảo vệ bề mặt luôn đặt lên hàng đầu: Tránh dùng bùi nhùi sắt hoặc lưỡi dao cùn chà xát lên mặt kính vì có thể gây xước bề mặt; Không dùng axit nồng độ cao đổ trực tiếp lên sàn gạch bóng kiếng hoặc đá granite tự nhiên vì dễ ảnh hưởng độ bóng của men gạch; Với sàn gỗ công nghiệp, chỉ sử dụng khăn ẩm vắt kiệt và máy hút bụi, không để nước đọng trên khe hèm khóa."
      ],
      [
        "Phân biệt hạng mục tiêu chuẩn và hạng mục khảo sát riêng",
        "Trong gói vệ sinh công nghiệp sau xây dựng tiêu chuẩn (12.000–20.000 đ/m²), Tino làm sạch toàn bộ sàn, cửa kính hai mặt trong, trần tường cơ bản, bếp và toilet. Các hạng mục cần khảo sát hoặc thỏa thuận riêng gồm: Vận chuyển xà bần khối lượng lớn bằng xe tải thùng; Đu dây lau kính mặt ngoài tòa nhà cao tầng; Đánh bóng phục hồi sàn đá cẩm thạch (marble) bị trầy xước từ khâu xây dựng."
      ],
      [
        "Checklist tự kiểm tra khi nhận bàn giao công trình",
        "Khách hàng có thể dùng đèn pin điện thoại soi nghiêng trên mặt sàn để kiểm tra độ sạch của vết sơn mỏng; kiểm tra rãnh trượt cửa lùa; dùng tay miết thử trên nóc tủ bếp và các gờ trang trí trên cao. Kỹ thuật viên Tino đồng hành hỗ trợ xử lý lại các chi tiết chưa đạt theo đúng thỏa thuận trước khi bàn giao."
      ]
    ]
  },
  {
    "slug": "ve-sinh-cong-nghiep-gia-re",
    "title": "Cách đọc và so sánh báo giá vệ sinh công nghiệp",
    "category": "Kinh nghiệm vệ sinh",
    "photo": "3c8737005483fbbb",
    "lead": "Phân biệt đơn vị tính, phạm vi công việc và thông tin cần chuẩn bị để trao đổi báo giá phù hợp.",
    "sections": [
      [
        "So sánh đúng dịch vụ và đơn vị tính",
        "Hai mức giá chỉ có ý nghĩa khi cùng phạm vi và đơn vị tính. Hãy phân biệt giá theo m², theo căn và theo cái; đồng thời kiểm tra diện tích hoặc loại vật dụng áp dụng. Mức giá “từ” là thông tin tham khảo, không phải báo giá cố định cho mọi hiện trạng."
      ],
      [
        "Những yếu tố cần mô tả khi xin báo giá",
        "Chuẩn bị diện tích, số tầng, tình trạng bụi hoặc sơn keo, bề mặt vật liệu và điều kiện tiếp cận. Với sofa hoặc thảm, gửi ảnh, kích thước và chất liệu nếu biết. Những thông tin này giúp đơn vị tiếp nhận hiểu đúng công việc trước khi trao đổi chi phí."
      ],
      [
        "Các câu hỏi nên làm rõ trước khi đặt lịch",
        "Hỏi báo giá gồm những hạng mục nào, phần nào cần thỏa thuận riêng và có yêu cầu chuẩn bị điện nước hay không. Nếu cần hóa đơn, làm ngoài giờ hoặc vận chuyển rác khối lượng lớn, hãy nêu trước để xác nhận phạm vi và chi phí liên quan."
      ],
      [
        "Đối chiếu với bảng giá của Tino",
        "Bảng giá trên website phân chia theo dịch vụ và đơn vị tính. Bạn có thể dùng làm mốc trao đổi, sau đó gửi ảnh hoặc video hiện trạng qua Zalo. Trước khi bắt đầu, hai bên thống nhất công việc và chi phí; khi bàn giao, kiểm tra theo các hạng mục đã thỏa thuận."
      ]
    ]
  },
  {
    "slug": "ve-sinh-nha-dinh-ky",
    "title": "Lập kế hoạch tổng vệ sinh nhà ở định kỳ cho gia đình",
    "category": "Chăm sóc nhà cửa",
    "photo": "e20602f023e8669e",
    "lead": "Lợi ích của việc tổng vệ sinh định kỳ 3–6 tháng/lần và cách sắp xếp công việc dọn dẹp khoa học cho từng không gian sống.",
    "sections": [
      [
        "Khi nào nên tổng vệ sinh nhà ở?",
        "Bụi thường tích tụ ở nóc tủ, khe cửa và gầm đồ nội thất dù sàn được lau thường xuyên. Hãy lên lịch theo mức sử dụng, tình trạng bám bẩn và nhu cầu gia đình; không có một chu kỳ áp dụng cho mọi căn nhà. Tổng vệ sinh hỗ trợ làm sạch bụi và các bề mặt, không đồng nghĩa với khử khuẩn hoặc điều trị dị ứng."
      ],
      [
        "Chia công việc theo từng khu vực",
        "Lập danh sách phòng khách, phòng ngủ, bếp, nhà tắm và ban công. Ghi rõ nơi cần làm sạch kỹ và vật dụng cần tránh di chuyển. Phân biệt lau dọn thông thường với giặt sofa, giặt thảm hoặc xử lý vết bẩn đặc biệt để trao đổi đúng phạm vi."
      ],
      [
        "Việc nào có thể tự làm, việc nào cần hỗ trợ?",
        "Bạn có thể sắp xếp đồ dùng và lau bề mặt dễ tiếp cận theo hướng dẫn của vật liệu. Với kính trên cao, đồ nặng hoặc vết bẩn chưa rõ cách xử lý, nên trao đổi với đơn vị có phương án tiếp cận phù hợp thay vì tự thử hóa chất hoặc leo trèo."
      ],
      [
        "Chuẩn bị thông tin để nhận báo giá",
        "Gửi diện tích, số tầng, loại nhà, khu vực và ảnh hiện trạng. Cất giấy tờ, tư trang và đánh dấu đồ dễ vỡ trước buổi làm. Khi nhận báo giá, đối chiếu hạng mục, thiết bị cần dùng và cách kiểm tra bàn giao; chi phí cụ thể được thống nhất trước khi làm."
      ]
    ]
  },
  {
    "slug": "dich-vu-tong-ve-sinh",
    "title": "Cẩm nang tổng vệ sinh toàn diện không gian sống",
    "category": "Kinh nghiệm vệ sinh",
    "photo": "bc1763828ba16db5",
    "lead": "Quy trình làm sạch bài bản từ trên xuống dưới, cách xử lý chuyên sâu từng phòng chức năng và tiêu chí kiểm tra sau khi hoàn thành.",
    "sections": [
      [
        "Nguyên tắc vàng: Làm sạch từ trên xuống dưới, từ trong ra ngoài",
        "Sai lầm phổ biến nhất khi tổng dọn nhà là lau sàn trước rồi mới quét bụi trần hoặc lau quạt, khiến bụi bẩn rơi ngược trở lại sàn vừa lau. Quy trình khoa học luôn bắt đầu từ: quét mạng nhện trần nhà -> lau bóng đèn, quạt trần -> lau tường và khung cửa sổ -> lau bề mặt bàn tủ nội thất -> và cuối cùng là hút bụi, chà rửa bề mặt sàn."
      ],
      [
        "Xử lý chuyên sâu cho từng phòng chức năng",
        "Với phòng tắm: tập trung tẩy cặn canxi bám mờ vách kính tắm và vòi hoa sen bằng dung dịch chuyên dụng không làm xỉn inox; thông tắc nắp thoát sàn. Với gian bếp: ngâm và tẩy màng dầu mỡ bám trên lưới lọc máy hút mùi, lau sạch khoang lò vi sóng và mặt đá bếp. Với phòng ngủ: hút bụi gầm giường và giặt sạch vỏ nệm gối."
      ],
      [
        "Tiêu chí đánh giá chất lượng một buổi tổng vệ sinh",
        "Một ngôi nhà được tổng vệ sinh đạt chuẩn sẽ mang lại cảm giác nhẹ nhõm ngay khi bước vào cửa: Không khí thoáng đãng không còn mùi ẩm mốc, sàn nhà khô ráo sạch bóng không nhờn rít, kính cửa trong veo không để lại vệt khăn lau, và các góc khuất dưới gầm đồ nội thất không còn mạng nhện hay bụi mịn tích tụ."
      ],
      [
        "Trải nghiệm dịch vụ tổng vệ sinh trọn gói cùng Tino",
        "Nếu bạn quá bận rộn với công việc và muốn dành trọn thời gian bên gia đình, dịch vụ tổng vệ sinh trọn gói của Tino sẵn sàng đồng hành tại Quận 12, Phú Nhuận, Quận 7 và khắp TP.HCM. Xem ngay bảng giá chi tiết hoặc liên hệ 0925 649 666 để nhận hỗ trợ tận tâm nhất."
      ]
    ]
  },
  {
    "slug": "dich-vu-tay-moc-nha-va-ve-sinh-nha-sach",
    "title": "Vệ sinh nhà: Nhận biết và xử lý nấm mốc đúng cách",
    "category": "Chăm sóc nhà cửa",
    "photo": "8c491fc16c3d51ec",
    "lead": "Nhận biết vị trí ẩm mốc, kiểm tra bề mặt và chuẩn bị thông tin trước khi trao đổi phương án làm sạch.",
    "sections": [
      [
        "Bắt đầu từ nguồn ẩm",
        "Mốc có thể xuất hiện ở nơi ẩm hoặc bị thấm. Cần xác định và xử lý nguồn ẩm; chỉ lau phần nhìn thấy mà để nguyên chỗ rò rỉ có thể khiến mốc tái xuất hiện."
      ],
      [
        "Kiểm tra bề mặt trước khi xử lý",
        "Cách xử lý phụ thuộc vật liệu và mức độ ảnh hưởng. Tránh chà khô làm phát tán bụi. Nếu mốc lan rộng, liên quan nước bẩn hoặc hệ thống thông gió, nên nhờ đơn vị phù hợp đánh giá."
      ],
      [
        "Sử dụng sản phẩm theo nhãn",
        "Chọn sản phẩm phù hợp vật liệu, dùng bảo hộ và thông gió theo hướng dẫn. Không pha các chất tẩy rửa với nhau. Không coi nguyên liệu tự nhiên là mặc nhiên an toàn hoặc có thể thay thế mọi sản phẩm chuyên dụng."
      ],
      [
        "Trao đổi đúng phạm vi công việc",
        "Gửi ảnh vị trí, chất liệu và tình trạng thấm cho Tino để trao đổi. Việc lau dọn không thay thế sửa chữa chống thấm hay xử lý kỹ thuật của công trình."
      ]
    ]
  },
  {
    "slug": "ve-sinh-nha-o-voi-muoi-an",
    "title": "Chọn cách vệ sinh phù hợp với từng chất liệu bề mặt",
    "category": "Kinh nghiệm vệ sinh",
    "photo": "3b21a7ec444d0b39",
    "lead": "Cách kiểm tra chất liệu và hướng dẫn chăm sóc trước khi dùng sản phẩm làm sạch trong gia đình.",
    "sections": [
      [
        "Đọc hướng dẫn của vật liệu trước",
        "Kiểm tra hướng dẫn chăm sóc của nhà sản xuất trước khi dùng dung dịch hoặc dụng cụ mới. Đá, gỗ, kính, kim loại và vải bọc có yêu cầu khác nhau. Nếu chưa rõ vật liệu hoặc lớp phủ, đừng áp dụng một công thức cho tất cả bề mặt."
      ],
      [
        "Vì sao không nên áp dụng mẹo muối, chanh hoặc giấm đại trà?",
        "Nguyên liệu có sẵn trong bếp không đồng nghĩa với phù hợp mọi vật liệu. Tránh chà bằng hạt cứng hoặc tự pha dung dịch lên đồ có lớp phủ, bề mặt đánh bóng hay vật dụng không có hướng dẫn rõ ràng. Có thể bắt đầu bằng cách lau bụi nhẹ theo chỉ dẫn của sản phẩm."
      ],
      [
        "Thử ở vị trí nhỏ và kiểm tra kết quả",
        "Nếu hướng dẫn vật liệu cho phép, thử sản phẩm ở một góc ít thấy rồi kiểm tra trước khi làm rộng hơn. Không trộn các chất tẩy rửa; dùng lượng và thời gian tiếp xúc theo nhãn. Với thiết bị điện, thực hiện việc vệ sinh theo hướng dẫn của nhà sản xuất."
      ],
      [
        "Khi nào nên trao đổi với đơn vị vệ sinh?",
        "Vết sơn keo sau xây dựng, vết ố lâu ngày hoặc vật liệu không xác định cần được kiểm tra trước. Gửi ảnh và mô tả hiện trạng qua Zalo Tino để trao đổi phương án, phạm vi công việc và báo giá. Không thể xác nhận kết quả chỉ từ tên dịch vụ."
      ]
    ]
  }
];

export const articleReferences: Record<string, { name: string; url: string }[]> = {
  "dich-vu-tay-moc-nha-va-ve-sinh-nha-sach": [
    {
      "name": "EPA: Mold, moisture and your home",
      "url": "https://www.epa.gov/mold/brief-guide-mold-moisture-and-your-home"
    }
  ],
  "ve-sinh-nha-dinh-ky": [
    {
      "name": "CDC: Cleaning and disinfecting your home",
      "url": "https://www.cdc.gov/hygiene/about/when-and-how-to-clean-and-disinfect-your-home.html"
    }
  ],
  "ve-sinh-nha-o-voi-muoi-an": [
    {
      "name": "CDC: Chọn sản phẩm theo bề mặt và hướng dẫn trên nhãn",
      "url": "https://www.cdc.gov/hygiene/about/when-and-how-to-clean-and-disinfect-your-home.html"
    }
  ]
};
