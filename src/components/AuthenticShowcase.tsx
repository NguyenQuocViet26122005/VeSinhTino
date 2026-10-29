'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import GlareHover from './react-bits/GlareHover';
import type { ResponsiveImages } from '../types/responsive-image';

export interface ProjectItem {
  id: string;
  category: 'apartment' | 'home' | 'glass' | 'factory' | 'floor' | 'furnishing';
  categoryLabel: string;
  title: string;
  caption: string;
  tag: string;
  image: string;
  problem: string;
  solution: string;
  result: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    id: 'f3e9578413dffb6cd7a69149858785c1',
    category: 'home',
    categoryLabel: 'Nhà ở & Nhà phố',
    title: 'Tổng vệ sinh nhà phố 4 tầng Nguyễn Duy Cung, Gò Vấp',
    caption: 'Sàn đá bóng loáng phản chiếu ánh sáng tự nhiên, toàn bộ nội thất và khung cửa kính được làm sạch tinh tươm.',
    tag: 'Bàn giao thực tế',
    image: '/images/f3e9578413dffb6cd7a69149858785c1.webp',
    problem: 'Nhà phố 4 tầng mới hoàn thiện xây dựng, vữa xi măng và bụi mịn bám dày đặc trên sàn đá cẩm thạch và các khung cửa kính lớn.',
    solution: 'Đội ngũ 4 kỹ thuật viên dùng máy hút bụi 3 motor hút sạch bụi góc khuất, hóa chất trung tính bóc keo xi măng và đánh bóng bảo vệ mặt đá.',
    result: 'Chủ nhà trực tiếp kiểm tra và nghiệm thu hài lòng từng chi tiết, không gian sáng bừng sẵn sàng đón tân gia.'
  },
  {
    id: 'abce569d7fb37039',
    category: 'glass',
    categoryLabel: 'Kính cao ốc',
    title: 'Vệ sinh kính mặt ngoài tòa nhà bằng xe nâng người',
    caption: 'Kỹ thuật viên thao tác trong lồng xe nâng người, làm sạch các mảng kính mặt dựng trên cao an toàn, đúng quy trình.',
    tag: 'Xe nâng người',
    image: '/images/abce569d7fb37039.webp',
    problem: 'Mặt kính bên ngoài tích tụ bụi bẩn, cặn khoáng từ nước mưa và các vết ố lâu ngày, gây ảnh hưởng đến độ trong và tính thẩm mỹ của tòa nhà.',
    solution: 'Điều xe nâng chuyên dụng đưa kỹ thuật viên tiếp cận trực tiếp bề mặt kính trên cao, xử lý cẩn thận bằng hóa chất làm sạch an toàn cho ron và khung nhôm.',
    result: 'Loại bỏ bụi bẩn và xử lý các vết ố trong phạm vi cho phép, giúp mặt kính sạch sáng hơn, cải thiện khả năng lấy sáng và diện mạo công trình.'
  },
  {
    id: '0822a0e36fddb2a9dd9a1b6424f8ff49',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Vệ sinh sàn epoxy văn phòng nhà máy công nghiệp',
    caption: 'Sàn epoxy xám bóng gương sau khi được chà rửa bằng máy liên hợp và hóa chất bảo dưỡng chuyên dụng.',
    tag: 'Sàn epoxy gương',
    image: '/images/0822a0e36fddb2a9dd9a1b6424f8ff49.webp',
    problem: 'Khu vực văn phòng xưởng bám bụi mịn kim loại và vệt bánh xe đẩy cao su làm mờ đục sàn sơn epoxy.',
    solution: 'Dùng pad mềm đánh bóng nhẹ cùng hóa chất trung tính không hại màng sơn, hút sạch ngay bằng cần gạt kép.',
    result: 'Mặt sàn lấy lại độ bóng gương hoàn hảo, tăng độ bền và khả năng chống trầy cho xưởng.'
  },
  {
    id: '606d1140fe49df7060f5a8997d8261c2',
    category: 'home',
    categoryLabel: 'Trường học & Trẻ em',
    title: 'Tổng vệ sinh trường mầm non & khu vui chơi',
    caption: 'Sàn gỗ sạch bóng, góc vui chơi và đồ dùng học tập được lau sạch và khử khuẩn bằng dung dịch sinh học an toàn, không mùi nồng gắt.',
    tag: 'An toàn trẻ nhỏ',
    image: '/images/606d1140fe49df7060f5a8997d8261c2.webp',
    problem: 'Không gian lớp mầm non cần làm sạch sâu sau kỳ nghỉ lễ, vừa tẩy sạch vết bẩn vừa phải an toàn tuyệt đối cho trẻ nhỏ.',
    solution: 'Sử dụng dung dịch sát khuẩn sinh học nguồn gốc tự nhiên, máy chà sàn pad vi sợi đánh bóng sàn gỗ và khử trùng đồ chơi.',
    result: 'Các phòng học sáng sạch, không còn mùi ẩm mốc, sẵn sàng đón các bé trở lại trường với sự an tâm của phụ huynh.'
  },
  {
    id: 'tino-danh-san-tho',
    category: 'floor',
    categoryLabel: 'Đánh bóng sàn',
    title: 'Kỹ thuật viên vận hành máy mài & đánh bóng sàn',
    caption: 'Kỹ thuật viên Tino điều khiển máy mài sàn mâm tạ công nghiệp, xử lý xước và tạo độ bóng.',
    tag: 'Mài sàn chuyên nghiệp',
    image: '/images/tino-danh-san-tho.webp',
    problem: 'Sàn đá mài terrazzo tại sảnh tòa nhà bị ố mờ mất bóng do lưu lượng người đi lại đông đúc.',
    solution: 'Mài phục hồi bằng 5 đầu số đĩa kim cương từ thô đến mịn, đánh bóng tăng cường bằng pad trắng hóa chất phủ bóng.',
    result: 'Bề mặt sàn sáng bóng rõ nét, nhẵn mịn và chống bám bụi bẩn hiệu quả hơn khi đưa vào sử dụng hàng ngày.'
  },
  {
    id: '122cac8e1bd2f9d6',
    category: 'furnishing',
    categoryLabel: 'Sofa & Thảm',
    title: 'Giặt phun hút chuyên sâu ghế sofa nỉ',
    caption: 'Đầu hút tam giác công nghệ cao hút kiệt chất bẩn, dung dịch diệt khuẩn nấm mốc 99.9%.',
    tag: 'Giặt sofa tại nhà',
    image: '/images/122cac8e1bd2f9d6.webp',
    problem: 'Bộ sofa nỉ màu be bị đổ nước trà và mồ hôi ố vàng, bốc mùi ẩm nhẹ khi thời tiết nồm ẩm.',
    solution: 'Phun dung dịch sinh học chiết xuất thực vật diệt khuẩn, dùng máy hút chân không lực hút 2200W hút kiệt nước đen.',
    result: 'Vết ố trà biến mất hoàn toàn, vải mềm mại thơm tho thoang thoảng mùi sả chanh, khô ráo sau 2 giờ.'
  },
  {
    id: 'b486da45979bde972f03edd7f9a890e5',
    category: 'apartment',
    categoryLabel: 'Căn hộ chung cư',
    title: 'Thi công đồng bộ căn hộ Quang Trung, Gò Vấp',
    caption: 'Kỹ thuật viên Tino thao tác đồng bộ: lau khung kính trên cao, hút bụi sàn đá và xử lý tủ kệ âm tường.',
    tag: 'Phối hợp kỹ thuật',
    image: '/images/b486da45979bde972f03edd7f9a890e5.webp',
    problem: 'Căn hộ nhiều hạng mục nội thất gỗ công nghiệp và kính vòm cao cấp đòi hỏi thao tác cẩn trọng, tránh trầy xước.',
    solution: 'Phân chia vị trí chuyên trách: thợ lau kính và rèm trần kết hợp thợ hút bụi rãnh trượt và tẩy sạch keo ron gạch.',
    result: 'Bàn giao nhanh trong 5 giờ, sàn nhà sạch bóng không vết ố, chủ nhà đánh giá cao tính chuyên nghiệp.'
  },
  {
    id: 'c949d223bc44f1ae',
    category: 'glass',
    categoryLabel: 'Kính cao ốc',
    title: 'Vệ sinh kính mặt ngoài tòa nhà bằng kỹ thuật đu dây',
    caption: 'Đội ngũ kỹ thuật viên có chứng chỉ an toàn đu dây thi công làm sạch hệ thống vách kính mặt dựng trên cao.',
    tag: 'Thi công đu dây',
    image: '/images/c949d223bc44f1ae.webp',
    problem: 'Hệ thống kính mặt dựng tại tòa nhà tích tụ bụi bẩn, dấu nước mưa và các vết ố do tác động của môi trường, khó tiếp cận bằng phương pháp vệ sinh thông thường.',
    solution: 'Đội ngũ kỹ thuật viên có chứng chỉ an toàn đu dây khảo sát điểm neo mái, sử dụng hệ thống dây cáp chịu tải kép, bình phun và cần gạt kính chuyên dụng để làm sạch từng hàng kính từ trên xuống.',
    result: 'Đội ngũ kỹ thuật tiếp cận các vị trí kính trên cao, vệ sinh theo từng khu vực và kiểm tra chất lượng bề mặt sau khi hoàn thành.'
  },
    {
    id: 'tino-chung-cu-binh-chanh',
    category: 'apartment',
    categoryLabel: 'Căn hộ chung cư',
    title: 'Tổng vệ sinh căn hộ chung cư tại Tân Kiên, Bình Chánh',
    caption: 'Không gian phòng khách, sảnh căn hộ và các phòng ngủ được hút bụi mịn, sủi keo và vệ sinh bóng loáng trước bàn giao.',
    tag: 'Chung cư Bình Chánh',
    image: '/images/tino-chung-cu-binh-chanh.webp',
    problem: 'Căn hộ sau hoàn thiện nội thất tại Tân Kiên, Bình Chánh còn đọng bụi mịn trong các khe tủ, kệ gỗ và vết keo, bột trét trên sàn nhà.',
    solution: 'Hút bụi công nghiệp toàn diện trần, tường, khe tủ và ray trượt; tẩy keo, sủi bột trét trên sàn gỗ và sàn gạch bóng; lau sạch thiết bị và khử khuẩn trước khi gia chủ dọn vào ở.',
    result: 'Sàn gạch bóng gương sạch sẽ, sàn gỗ phòng ngủ khô thoáng, nội thất bàn giao sạch bụi chuẩn bị cho gia chủ dọn đồ vào ở.'
  },
  {
    id: 'tino-chung-cu-binh-chanh-phong-ngu',
    category: 'apartment',
    categoryLabel: 'Căn hộ chung cư',
    title: 'Vệ sinh phòng ngủ sàn gỗ căn hộ tại Bình Chánh',
    caption: 'Sàn gỗ phòng ngủ được hút bụi mịn khe chân tường và lau bằng dung dịch bảo dưỡng chuyên dụng an toàn.',
    tag: 'Sàn gỗ phòng ngủ',
    image: '/images/tino-chung-cu-binh-chanh-phong-ngu.webp',
    problem: 'Phòng ngủ căn hộ sau khi lắp giường tủ gỗ bám nhiều bụi gỗ li ti và vệt keo dán nẹp chỉ sàn gỗ.',
    solution: 'Dùng đầu hút lông mềm hút sạch bụi mịn trong ngăn kéo, hộc tủ và khe nẹp chân tường; lau bảo dưỡng sàn gỗ bằng khăn vi sợi ẩm.',
    result: 'Phòng ngủ sạch mát, không bám bụi sàn, vân gỗ sáng bóng tự nhiên và an toàn cho sức khỏe.'
  },
  {
    id: 'e6ecb611e10bc770',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Tổng vệ sinh nhà máy & kho xưởng quy mô lớn',
    caption: 'Quy mô diện tích lớn với trần thép tiền chế, đường ống kỹ thuật và sàn bê tông công nghiệp.',
    tag: 'Kho xưởng sản xuất',
    image: '/images/e6ecb611e10bc770.webp',
    problem: 'Xưởng cơ khí 1.200m² chuyển giao mặt bằng, trần bám nhiều mạng nhện và bụi xơ vải, sàn loang lổ vết dầu máy.',
    solution: 'Dùng giàn giáo và máy thổi áp lực quét mạng nhện trần xưởng, dùng máy chà sàn liên hợp tải nặng tẩy dầu sàn bê tông.',
    result: 'Bàn giao mặt bằng kho xưởng sạch sẽ, thông thoáng, đáp ứng tiêu chuẩn tiếp nhận và vận hành sản xuất.'
  },
  {
    id: 'e28b5ab0b1d848ea',
    category: 'home',
    categoryLabel: 'Nhà ở & Nhà phố',
    title: 'Nghiệm thu bàn giao nhà phố sau xây dựng',
    caption: 'Từng chi tiết len chân tường, khung cửa sổ và sàn gạch được chủ nhà kiểm tra hài lòng.',
    tag: 'Nghiệm thu thực tế',
    image: '/images/e28b5ab0b1d848ea.webp',
    problem: 'Nhà phố 1 trệt 2 lầu nhiều rác thô, vết xi măng chết bám trên gạch nhám và cửa kính các tầng.',
    solution: 'Phân tổ 5 nhân sự: tổ 1 dọn rác thô và hút bụi, tổ 2 tẩy xi măng bằng dung dịch an toàn ron gạch, tổ 3 chà sàn máy và lau kính.',
    result: 'Nghiệm thu từng tầng, chủ nhà ký biên bản bàn giao và đánh giá cao sự cẩn thận ở các góc khuất cầu thang.'
  },
  {
    id: 'f911a44071a765251aab844dfd730298',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Vệ sinh gầm kệ kho hàng tải nặng Huỳnh Thị Hai, Quận 12',
    caption: 'Kỹ thuật viên thao tác máy hút ướt công suất lớn làm sạch tận chân trụ pallet và gầm kệ hàng.',
    tag: 'Kho logistics',
    image: '/images/f911a44071a765251aab844dfd730298.webp',
    problem: 'Kho lưu trữ hàng bốc dỡ liên tục tích tụ bụi bẩn ở các khe hẹp dưới chân kệ sắt chịu tải nặng.',
    solution: 'Trang bị đầu hút dẹp góc hẹp và ống dẫn nối dài 5m, len lỏi làm sạch từng rãnh trụ kho.',
    result: 'Toàn bộ 800m² mặt sàn kho thông thoáng, đạt chuẩn kiểm định an toàn hàng hóa.'
  },
  {
    id: 'c2f625c607452a14',
    category: 'floor',
    categoryLabel: 'Đánh bóng sàn',
    title: 'Bề mặt sàn đá sau khi hoàn thiện',
    caption: 'Độ bóng gương phản chiếu sắc nét, đường ron được làm sạch tinh tế và phủ bóng bảo vệ.',
    tag: 'Sạch bóng gương',
    image: '/images/c2f625c607452a14.webp',
    problem: 'Sàn gạch men bóng bị dính vệt sơn và lớp màng keo xây dựng làm mờ xỉn, lau nước thường không sạch.',
    solution: 'Dùng máy chà sàn đơn kết hợp pad đỏ và hóa chất bóc keo chuyên dụng, hút khô ngay bằng cần gạt cao su.',
    result: 'Sàn gạch sáng bóng, loại bỏ màng keo xây dựng và vệt ố mờ, phản chiếu ánh đèn rõ nét.'
  },
  {
    id: '0dffb2a53aec534128d29cd9bf60aea5',
    category: 'home',
    categoryLabel: 'Nhà ở & Nhà phố',
    title: 'Phục hồi không gian bếp cũ ố dầu mỡ Tôn Đản, Quận 4',
    caption: 'Xử lý triệt để mảng dầu mỡ cháy kết tủa và muội khói lâu năm trên tường gạch, mặt đá bếp.',
    tag: 'Phục hồi sâu',
    image: '/images/0dffb2a53aec534128d29cd9bf60aea5.webp',
    problem: 'Căn bếp lâu năm bám muội khói đen, dầu mỡ cô đặc trên mặt bếp và ron tường ố vàng khó tẩy bằng xà phòng thông thường.',
    solution: 'Ủ dung dịch sinh học phân hủy dầu mỡ chuyên dụng, kết hợp bàn chải nhiệt và máy hút chân không.',
    result: 'Mặt đá và tường gạch sáng bóng trở lại, bay sạch mùi khét ẩm, an tâm sử dụng hàng ngày.'
  },
  {
    id: '1dbcc214c91f18f3',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Xử lý dầu mỡ & lối đi nội bộ xưởng',
    caption: 'Tẩy rửa sàn chịu tải nặng, tẩy dầu mỡ công nghiệp bằng hóa chất sinh học chuyên dụng.',
    tag: 'Tẩy sàn công nghiệp',
    image: '/images/1dbcc214c91f18f3.webp',
    problem: 'Khu vực xe nâng di chuyển liên tục bị trơn trượt do dầu nhớt rò rỉ, gây mất an toàn lao động.',
    solution: 'Ủ hóa chất tẩy dầu sinh học không ăn mòn bê tông, dùng máy chà sàn mâm cước sắt đánh bật gốc dầu.',
    result: 'Sàn khô ráo, tăng độ ma sát bám bánh xe nâng, loại bỏ hoàn toàn nguy cơ trượt ngã cho công nhân.'
  },
  {
    id: '934c3c727f9a36a0',
    category: 'factory',
    categoryLabel: 'Kho xưởng',
    title: 'Hút bụi công nghiệp máy công suất 3 motor',
    caption: 'Hệ thống hút bụi công suất lớn thu gom triệt để bụi mịn bê tông và bột bả sau thi công.',
    tag: 'Máy móc 3 motor',
    image: '/images/934c3c727f9a36a0.webp',
    problem: 'Bụi mịn sau khi cắt gạch và chà nhám bay lơ lửng khắp không gian, máy hút bụi gia đình lập tức bị nghẹt lọc.',
    solution: 'Trang bị 3 máy hút bụi công nghiệp 80L 3 motor công suất 3600W, hút khô và ướt đồng thời.',
    result: 'Thu gom triệt để lượng lớn bụi mịn và bột bả, làm sạch không gian nhanh chóng và không để bụi bay ngược vào không khí.'
  },
  {
    id: '92a7f6090b410117',
    category: 'home',
    categoryLabel: 'Nhà ở & Nhà cũ',
    title: 'Cải tạo & làm sạch sâu nhà ở cũ',
    caption: 'Tẩy ố mốc lâu năm, khử mùi ẩm mốc và phục hồi độ sáng tự nhiên cho toàn bộ không gian.',
    tag: 'Vệ sinh nhà cũ',
    image: '/images/92a7f6090b410117.webp',
    problem: 'Nhà để trống hơn 6 tháng, ẩm thấp, tường phòng tắm ố vàng, ron gạch đen và tủ bếp bám dầu mỡ kết tủa.',
    solution: 'Phun dung dịch sinh học phân hủy dầu mỡ khu bếp, chà tẩy ron gạch toilet bằng máy cầm tay chuyên dụng.',
    result: 'Không gian sạch sẽ, thông thoáng, khử sạch mùi ẩm và các vết ố mốc lâu ngày, sẵn sàng cho gia đình dọn vào sinh hoạt.'
  },
  {
    id: 'tino-tham-may-giat',
    category: 'furnishing',
    categoryLabel: 'Sofa & Thảm',
    title: 'Máy mâm xoay giặt thảm văn phòng',
    caption: 'Đánh bật vết ố cà phê, bụi mịn sâu trong sợi thảm và sấy khô nhanh bằng quạt thổi công suất cao.',
    tag: 'Giặt thảm công nghiệp',
    image: '/images/tino-tham-may-giat.webp',
    problem: 'Thảm văn phòng công ty 200m² tích tụ bụi đất cả năm, nhiều vết đổ cà phê tại khu vực pantry.',
    solution: 'Giặt vào chiều thứ 7: dùng máy mâm cước mềm chà sạch từng mét vuông, kết hợp quạt sấy 3 cấp tốc độ.',
    result: 'Sáng thứ 2 nhân viên đi làm thấy thảm sạch sẽ, thơm mát, khô ráo hoàn toàn không ảnh hưởng giờ làm việc.'
  }
];

const TABS = [
  { key: 'all', label: `Tất cả công trình (${PROJECTS.length})` },
  { key: 'apartment', label: 'Căn hộ chung cư' },
  { key: 'home', label: 'Nhà ở & Nhà phố' },
  { key: 'glass', label: 'Kính cao ốc' },
  { key: 'factory', label: 'Kho xưởng' },
  { key: 'floor', label: 'Đánh bóng sàn' },
  { key: 'furnishing', label: 'Sofa & Thảm' }
] as const;

type TabKey = typeof TABS[number]['key'];

const INITIAL_COUNT = 6;

export const AuthenticShowcase: React.FC<{ images?: ResponsiveImages }> = ({ images = {} }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [activePhoto, setActivePhoto] = useState<ProjectItem | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setIsExpanded(false);
  };

  const filtered = useMemo(() => {
    if (activeTab === 'all') return PROJECTS;
    return PROJECTS.filter(p => p.category === activeTab);
  }, [activeTab]);

  const displayed = useMemo(() => {
    if (isExpanded) return filtered;
    return filtered.slice(0, INITIAL_COUNT);
  }, [filtered, isExpanded]);

  const lastActiveElement = useRef<HTMLElement | null>(null);
  const modalBoxRef = useRef<HTMLDivElement | null>(null);

  const openModal = (item: ProjectItem) => {
    if (typeof document !== 'undefined') {
      lastActiveElement.current = document.activeElement as HTMLElement;
    }
    setActivePhoto(item);
  };

  const closeModal = () => {
    setActivePhoto(null);
    if (lastActiveElement.current) {
      lastActiveElement.current.focus();
    }
  };

  const handleRequestSimilar = (item: ProjectItem) => {
    closeModal();
    const contactSection = document.getElementById('lien-he-tu-van');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    const detail = {
      serviceName: item.categoryLabel,
      serviceId: item.category,
      quantity: '1 công trình',
      estimateText: `Tôi cần vệ sinh tương tự công trình: ${item.title}`
    };
    if (typeof window !== 'undefined') {
      (window as unknown as { __tino_pending_prefill?: typeof detail }).__tino_pending_prefill = detail;
    }
    window.dispatchEvent(
      new CustomEvent('tino:prefill-contact', {
        detail
      })
    );
  };

  useEffect(() => {
    if (!activePhoto) return;

    const timer = setTimeout(() => {
      if (modalBoxRef.current) {
        const focusable = modalBoxRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'Tab' && modalBoxRef.current) {
        const focusable = modalBoxRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [activePhoto]);

  return (
    <div id="cong-trinh" className="authentic-showcase">
      {/* Category Filter Tabs */}
      <div className="showcase-tabs" role="tablist" aria-label="Bộ lọc ảnh thực tế">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`showcase-tab ${activeTab === tab.key ? 'is-active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Swipe Hint */}
      <div className="showcase-swipe-hint">
        <span>Vuốt ngang xem công trình thực tế</span>
        <span className="swipe-badge">{displayed.length} công trình →</span>
      </div>

      {/* Grid of Projects with Storytelling Layout (compact with load more) */}
      <div className="showcase-grid">
        {displayed.map(item => (
          <article key={item.id} className="showcase-card">
            <div
              className="showcase-media"
              onClick={() => openModal(item)}
              role="button"
              tabIndex={0}
              aria-label={`Xem chi tiết công trình: ${item.title}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal(item);
                }
              }}
            >
              <GlareHover
                glareColor="#ffffff"
                glareOpacity={0.3}
                variant="sheen"
                borderRadius="14px"
                className="showcase-glare-wrap"
              >
                <img
                  src={images[item.image]?.src ?? item.image}
                  srcSet={images[item.image]?.srcSet}
                  sizes="(max-width: 768px) min(82vw, 315px), (max-width: 1000px) calc((100vw - 60px) / 2), (max-width: 1432px) calc((100vw - 160px) / 3), 424px"
                  alt={item.title}
                  width={600}
                  height={450}
                  loading="lazy"
                  decoding="async"
                  className="showcase-img"
                />
              </GlareHover>
              <span className="showcase-badge">{item.tag}</span>
              <button
                type="button"
                className="showcase-zoom-btn"
                aria-label="Phóng to ảnh và xem câu chuyện"
                onClick={e => {
                  e.stopPropagation();
                  openModal(item);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </div>

            <div className="showcase-content">
              <span className="showcase-cat">{item.categoryLabel}</span>
              <h3 className="showcase-title">{item.title}</h3>

              {/* Story Mini-Summary */}
              <div className="story-preview">
                <div className="story-step-item">
                  <span className="story-label">Hiện trạng:</span>
                  <span className="story-val">{item.problem}</span>
                </div>
                <div className="story-step-item">
                  <span className="story-label">Kết quả:</span>
                  <span className="story-val highlight">{item.result}</span>
                </div>
              </div>

              {/* Contextual CTA */}
              <div className="showcase-card-footer">
                <button
                  type="button"
                  className="showcase-action-btn"
                  onClick={() => handleRequestSimilar(item)}
                >
                  Tư vấn công trình tương tự
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Expand / Collapse Load More Controls */}
      {filtered.length > INITIAL_COUNT && (
        <div className="showcase-expand-wrap">
          <button
            type="button"
            className="showcase-expand-btn"
            onClick={() => {
              if (isExpanded) {
                setIsExpanded(false);
                const section = document.getElementById('cong-trinh');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              } else {
                setIsExpanded(true);
              }
            }}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <span>Thu gọn danh sách</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </>
            ) : (
              <>
                <span>Xem thêm {filtered.length - INITIAL_COUNT} công trình khác</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Story Lightbox Modal */}
      {activePhoto && (
        <div
          className="showcase-modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
        >
          <div ref={modalBoxRef} className="showcase-modal-box" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="showcase-modal-close"
              onClick={closeModal}
              aria-label="Đóng hộp thoại"
            >
              ✕
            </button>
            <div className="showcase-modal-image-wrap">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                className="showcase-modal-img"
              />
            </div>
            <div className="showcase-modal-info">
              <div className="modal-header-line">
                <span className="showcase-badge">{activePhoto.tag}</span>
                <span className="modal-cat-text">{activePhoto.categoryLabel}</span>
              </div>
              <h3 className="modal-work-title">{activePhoto.title}</h3>

              {/* 3-Step Full Story Breakdown */}
              <div className="story-full-breakdown">
                <div className="story-full-item problem">
                  <div className="story-full-badge">01. Hiện trạng ban đầu</div>
                  <p>{activePhoto.problem}</p>
                </div>
                <div className="story-full-item solution">
                  <div className="story-full-badge">02. Hạng mục Tino xử lý</div>
                  <p>{activePhoto.solution}</p>
                </div>
                <div className="story-full-item result">
                  <div className="story-full-badge">03. Kết quả bàn giao</div>
                  <p>{activePhoto.result}</p>
                </div>
              </div>

              <div className="modal-cta-row">
                <button
                  type="button"
                  className="button modal-contact-btn"
                  onClick={() => handleRequestSimilar(activePhoto)}
                >
                  Tôi cần vệ sinh như công trình này
                  <span aria-hidden="true">↗</span>
                </button>
                <a
                  href="https://zalo.me/0925649666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button light modal-zalo-btn"
                  onClick={async () => {
                    const msg = `Chào Tino, tôi xem công trình "${activePhoto.title}" và muốn được khảo sát, báo giá tương tự cho công trình của tôi!`;
                    try {
                      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(msg);
                      }
                    } catch {
                      // Ignore
                    }
                  }}
                >
                  Nhắn Zalo kèm ảnh
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticShowcase;
