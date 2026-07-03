import React from "react";
import { Star, Heart, ClipboardList, Home, Calendar, Users, Trash2, Shield, Award, Sparkles } from "lucide-react";
import { Property, Booking } from "@/types";

interface ProfilePageProps {
  currentUser: { id: string; name: string; email: string; avatar: string; isPremium: boolean };
  togglePremium: () => void;
  activeTab: "trips" | "wishlist" | "host";
  setActiveTab: (tab: "trips" | "wishlist" | "host") => void;
  bookings: Booking[];
  wishlistedProperties: Property[];
  hostProperties: Property[];
  onCancelBooking: (id: string) => void;
  onRemoveWishlist: (id: string) => void;
  onDeleteHostProperty: (id: string) => void;
  onSelectProperty: (prop: Property) => void;
}

export default function ProfilePage({
  currentUser,
  togglePremium,
  activeTab,
  setActiveTab,
  bookings,
  wishlistedProperties,
  hostProperties,
  onCancelBooking,
  onRemoveWishlist,
  onDeleteHostProperty,
  onSelectProperty
}: ProfilePageProps) {

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
      
      {/* Left Column: User Card */}
      <div className="w-full md:w-80 space-y-6 shrink-0 text-left">
        <div className="border border-mist rounded-[20px] bg-cloud p-6 shadow-xs space-y-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-24 w-24 rounded-full object-cover border-2 border-brand-coral shadow"
              />
              <span className="absolute bottom-0 right-0 bg-brand-coral text-cloud p-1 rounded-full border-2 border-cloud">
                <Shield className="h-4 w-4" />
              </span>
            </div>
            <div>
              <h3 className="font-bold text-carbon text-base">{currentUser.name}</h3>
              <p className="text-xs text-slate mt-0.5">{currentUser.email}</p>
            </div>

            <div className="flex items-center gap-1.5 bg-fog px-3 py-1 rounded-full text-xs font-semibold text-carbon border border-mist select-none">
              <Award className="h-4 w-4 text-brand-coral" />
              <span>Điểm uy tín: 5.0</span>
            </div>
          </div>

          <div className="border-t border-mist pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate font-medium">Loại tài khoản:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                currentUser.isPremium ? "bg-amber-100 text-amber-800" : "bg-slate text-slate"
              }`}>
                {currentUser.isPremium ? "Premium member" : "Standard member"}
              </span>
            </div>

            <button
              onClick={togglePremium}
              className="w-full bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral py-2.5 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {currentUser.isPremium ? "Hủy Premium" : "Nâng cấp Premium"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Tab View */}
      <div className="flex-1 bg-cloud border border-mist rounded-[20px] overflow-hidden flex flex-col text-left">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-mist bg-fog/20 text-xs text-slate font-semibold select-none">
          <button
            onClick={() => setActiveTab("trips")}
            className={`flex-1 py-4 text-center border-b-2 transition cursor-pointer ${
              activeTab === "trips"
                ? "border-brand-coral text-brand-coral font-bold bg-cloud"
                : "border-transparent hover:text-carbon"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <ClipboardList className="h-4 w-4" /> Đề xuất đã gửi ({bookings.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`flex-1 py-4 text-center border-b-2 transition cursor-pointer ${
              activeTab === "wishlist"
                ? "border-brand-coral text-brand-coral font-bold bg-cloud"
                : "border-transparent hover:text-carbon"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Heart className="h-4 w-4" /> Yêu thích ({wishlistedProperties.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("host")}
            className={`flex-1 py-4 text-center border-b-2 transition cursor-pointer ${
              activeTab === "host"
                ? "border-brand-coral text-brand-coral font-bold bg-cloud"
                : "border-transparent hover:text-carbon"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Home className="h-4 w-4" /> Tin đã đăng ({hostProperties.length})
            </span>
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto no-scrollbar max-h-[600px] space-y-4">
          
          {/* TRIPS VIEW */}
          {activeTab === "trips" && (
            bookings.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-slate text-sm">Bạn chưa gửi đề xuất trao đổi đồ nào.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="border border-mist rounded-xl p-4 space-y-3 bg-fog/20 flex flex-col justify-between hover:shadow-xs transition duration-200">
                  <div className="flex gap-3">
                    <img
                      src={booking.propertyImage}
                      alt={booking.propertyName}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-lg object-cover bg-pebble shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-xs text-carbon line-clamp-2 leading-snug">
                        {booking.propertyName}
                      </h4>
                      <p className="text-[10px] text-slate font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Ngày đề xuất: {booking.checkIn}
                      </p>
                      <p className="text-[10px] text-slate font-medium flex items-center gap-1">
                        <Users className="h-3 w-3" /> Số lượng: {booking.guests.adults} sản phẩm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-mist mt-1 text-xs">
                    <div>
                      <span className="text-[10px] text-slate block uppercase tracking-wide font-semibold">Giá trị ước tính</span>
                      <span className="font-bold text-carbon text-sm">{(booking.totalPrice * 1000).toLocaleString("vi-VN")} đ</span>
                    </div>
                    <button
                      onClick={() => onCancelBooking(booking.id)}
                      className="text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 border border-transparent hover:border-red-200 cursor-pointer"
                    >
                      Hủy đề xuất
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {/* WISHLIST VIEW */}
          {activeTab === "wishlist" && (
            wishlistedProperties.length === 0 ? (
              <div className="text-center py-16 text-slate text-sm">
                Danh sách yêu thích trống. Nhấn biểu tượng trái tim trên các sản phẩm để lưu lại!
              </div>
            ) : (
              wishlistedProperties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => onSelectProperty(prop)}
                  className="border border-mist rounded-xl p-3 flex gap-3 cursor-pointer hover:shadow-md hover:bg-fog/10 transition bg-cloud relative group"
                >
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-lg object-cover bg-pebble shrink-0"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0 pr-6">
                    <h4 className="font-semibold text-xs text-carbon truncate group-hover:text-brand-coral">
                      {prop.title}
                    </h4>
                    <p className="text-[10px] text-slate">{prop.location}</p>
                    <p className="text-xs font-bold text-carbon pt-0.5">
                      {prop.price.toLocaleString("vi-VN")} đ <span className="text-[10px] text-slate font-normal">/ sản phẩm</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveWishlist(prop.id);
                    }}
                    className="absolute right-3 top-3 p-1 rounded-full text-brand-coral hover:bg-red-50 transition cursor-pointer"
                    title="Remove item"
                  >
                    <Heart className="h-4 w-4 fill-brand-coral" />
                  </button>
                </div>
              ))
            )
          )}

          {/* HOST VIEW */}
          {activeTab === "host" && (
            hostProperties.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-slate text-sm">Bạn chưa đăng sản phẩm nào.</p>
                <p className="text-xs text-slate px-4">Hãy đăng bài trao đổi sản phẩm của bạn, chúng sẽ hiển thị ngay lập tức trên trang chủ SWAPLY!</p>
              </div>
            ) : (
              hostProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="border border-mist rounded-xl p-3 flex gap-3 bg-cloud relative group"
                >
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-lg object-cover bg-pebble shrink-0"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-xs text-carbon truncate mr-6">
                        {prop.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate">{prop.location} • <span className="capitalize">{prop.category}</span></p>
                    <p className="text-xs font-bold text-carbon pt-0.5">
                      {prop.price.toLocaleString("vi-VN")} đ <span className="text-[10px] text-slate font-normal">/ sản phẩm</span>
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteHostProperty(prop.id)}
                    className="absolute right-3 bottom-3 p-1.5 rounded-lg text-slate hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Xóa bài đăng"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))
            )
          )}

        </div>
      </div>
    </main>
  );
}
