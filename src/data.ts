import { Property, Review } from "./types";

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Sophie Dubois",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    date: "June 2026",
    rating: 5,
    content: "Món đồ trao đổi rất đúng như mô tả! Giao dịch nhanh chóng, chủ đồ thân thiện và uy tín. 5 sao cho bạn!"
  },
  {
    id: "r2",
    author: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    date: "May 2026",
    rating: 5,
    content: "Rất hài lòng với buổi giao dịch trực tiếp. Máy test hoạt động mượt mà, đầy đủ phụ kiện. Sẽ tiếp tục trao đổi tiếp!"
  },
  {
    id: "r3",
    author: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
    date: "April 2026",
    rating: 4,
    content: "Đổi đồ nhanh gọn. Sản phẩm hơi cũ một chút so với ảnh nhưng vẫn sử dụng tốt. Cảm ơn bạn chủ đồ."
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  // SECTION 1: Popular experiences nearby -> Đồ điện tử
  {
    id: "exp1",
    title: "iPhone 12 Pro Max 128GB Gold",
    hostType: "Thành viên Premium",
    hostName: "Trần Thị Lan",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    category: "experiences",
    price: 12500000, // Giá trị ước lượng
    rating: 4.9,
    reviewsCount: 18,
    images: [
      "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Máy dùng ốp suốt nên ngoại hình còn rất mới 98%. Pin 85%, mọi tính năng FaceID, camera hoạt động hoàn hảo. Chưa từng qua sửa chữa. Mong muốn đổi lấy iPad Pro M1 hoặc Laptop văn phòng tương đương giá trị.",
    amenities: ["Có hộp kèm theo", "Tặng kèm 3 ốp lưng", "Cáp sạc zin chính hãng", "Bao test trực tiếp 7 ngày"],
    location: "Đống Đa, Hà Nội",
    isGuestFavorite: true,
    maxGuests: 4,
    isExperience: true,
    dateRange: "Muốn đổi: iPad Pro M1 / Laptop"
  },
  {
    id: "exp2",
    title: "Laptop ThinkPad T490s Core i5",
    hostType: "Thành viên Standard",
    hostName: "Lê Hoàng Nam",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    category: "experiences",
    price: 8000000,
    rating: 4.5,
    reviewsCount: 6,
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "RAM 16GB, SSD 256GB, màn hình Full HD IPS sáng đẹp. Bàn phím gõ cực êm. Máy phù hợp cho sinh viên hoặc dân văn phòng. Muốn giao lưu sang Điện thoại Android đời cao (Samsung, Xiaomi) có bù thêm tiền.",
    amenities: ["Máy kèm sạc Type-C", "Có túi chống sốc", "Mới vệ sinh tra keo tản nhiệt", "Hỗ trợ cài lại Win sạch"],
    location: "Quận 1, TP. Hồ Chí Minh",
    isGuestFavorite: false,
    maxGuests: 6,
    isExperience: true,
    dateRange: "Muốn đổi: Điện thoại Samsung / Xiaomi"
  },
  {
    id: "exp3",
    title: "Kindle Paperwhite 4 (10th Gen) 8GB",
    hostType: "Thành viên Premium",
    hostName: "Trần Thị Lan",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    category: "experiences",
    price: 2200000,
    rating: 4.85,
    reviewsCount: 12,
    images: [
      "https://images.unsplash.com/photo-1544822688-c6854193bc65?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Máy đọc sách chống nước, màn hình e-ink sắc nét không đau mắt. Đã dán cường lực, kèm bao da thông minh tự tắt mở màn hình. Muốn đổi lấy vợt cầu lông Yonex dòng Astrox hoặc Nanoflare chính hãng.",
    amenities: ["Có bao da đi kèm", "Màn hình dán chống trầy", "Tặng kho sách 10.000 cuốn", "Cáp sạc Micro-USB"],
    location: "Đống Đa, Hà Nội",
    isGuestFavorite: true,
    maxGuests: 2,
    isExperience: true,
    dateRange: "Muốn đổi: Vợt cầu lông Yonex"
  },

  // SECTION 2: Capture memories nearby -> Sách & Truyện
  {
    id: "mem1",
    title: "Combo 10 cuốn tiểu thuyết trinh thám Keigo",
    hostType: "Thành viên Standard",
    hostName: "Nguyễn Minh Quang",
    hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
    category: "memories",
    price: 600000,
    rating: 4.9,
    reviewsCount: 3,
    images: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Sách mua chính hãng Nhã Nam, đã đọc một lần và cất tủ bảo quản kỹ. Không quăn mép, không rách trang. Cần đổi sang truyện tranh Conan trọn bộ hoặc tiểu thuyết khoa học viễn tưởng.",
    amenities: ["Sách bọc bookcare", "Không ghi vẽ bậy", "Tặng kèm bookmark xinh xắn"],
    location: "Cầu Giấy, Hà Nội",
    isGuestFavorite: true,
    maxGuests: 1,
    isExperience: true,
    dateRange: "Muốn đổi: Truyện tranh Conan"
  },
  {
    id: "mem2",
    title: "Máy chụp ảnh lấy liền Fujifilm Instax Mini 11",
    hostType: "Thành viên Standard",
    hostName: "Phạm Hồng Ngọc",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
    category: "memories",
    price: 1500000,
    rating: 4.7,
    reviewsCount: 5,
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Máy màu hồng cực xinh, hoạt động hoàn hảo, flash đánh đều. Thích hợp đi chơi, du lịch chụp ảnh lấy ngay lưu niệm. Muốn đổi lấy son môi Dior/Mac chính hãng hoặc túi xách thời trang.",
    amenities: ["Tặng kèm 2 pin AA", "Có dây đeo cổ tay", "Còn hộp hướng dẫn sử dụng"],
    location: "Hai Bà Trưng, Hà Nội",
    isGuestFavorite: false,
    maxGuests: 2,
    isExperience: true,
    dateRange: "Muốn đổi: Son môi Dior / Túi xách"
  },

  // SECTION 3: Homes in Seville -> Thời trang & Phụ kiện
  {
    id: "sev1",
    title: "Giày Sneaker Nike Air Force 1 White size 41",
    hostType: "Thành viên Standard",
    hostName: "Hoàng Gia Bảo",
    hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
    category: "seville",
    price: 1800000,
    rating: 4.8,
    reviewsCount: 8,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Giày mua tại Nike Store Royal City, đi được 3 lần còn rất mới 95%. Đế giày chưa mòn, da không nứt gãy. Muốn đổi lấy giày chạy bộ Adidas Ultraboost hoặc giày bóng rổ size 41.",
    amenities: ["Còn nguyên hộp giày", "Đầy đủ tag mác", "Tặng kèm chai xịt bọt vệ sinh giày"],
    location: "Thanh Xuân, Hà Nội",
    isGuestFavorite: true,
    maxGuests: 2,
    isExperience: false,
    dateRange: "Muốn đổi: Giày chạy bộ Adidas size 41"
  },
  {
    id: "sev2",
    title: "Áo khoác gió The North Face chống nước",
    hostType: "Thành viên Standard",
    hostName: "Lê Hoàng Nam",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    category: "seville",
    price: 900000,
    rating: 4.6,
    reviewsCount: 4,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Áo gió TNF 2 lớp dày dặn chống mưa nhỏ, chống tuyết và cản gió cực tốt. Phù hợp cho bạn nào hay đi phượt hoặc đi xe máy đường dài. Size L châu Á. Muốn đổi lấy balo trekking dung tích lớn.",
    amenities: ["Mũ áo tháo rời được", "Túi áo có khóa kéo chống nước", "Chất vải Gore-Tex bền bỉ"],
    location: "Quận 1, TP. Hồ Chí Minh",
    isGuestFavorite: false,
    maxGuests: 3,
    isExperience: false,
    dateRange: "Muốn đổi: Balo trekking / đi phượt"
  }
];

export const CATEGORIES_LIST = [
  { name: "Đồ điện tử", icon: "Sparkles" },
  { name: "Sách & Truyện", icon: "Camera" },
  { name: "Thời trang", icon: "Palmtree" },
  { name: "Đồ gia dụng", icon: "Cabin" },
  { name: "Thể thao", icon: "Castle" },
  { name: "Historic", icon: "Compass" },
  { name: "Seville", icon: "MapPin" },
];
