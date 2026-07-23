import React, { useState, useEffect, useCallback } from "react";
import { Star, Heart, ClipboardList, Home, Calendar, Users, Trash2, Shield, Award, Sparkles, X, Loader2, User, ArrowRightLeft } from "lucide-react";
import { Property, Booking } from "@/types";
import { toast } from "react-toastify";
import { fetchIncomingExchanges, acceptExchange, rejectExchange } from "@/shared/api/exchangeApi";

interface ProfilePageProps {
  currentUser: { id: string; name: string; email: string; avatar: string; isPremium: boolean; phone?: string; createdAt?: string };
  onUpdateProfile?: (fullName: string, phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateAvatar?: (file: File) => Promise<{ success: boolean; error?: string }>;
  togglePremium: () => void;
  activeTab: "trips" | "wishlist" | "host" | "received";
  setActiveTab: (tab: "trips" | "wishlist" | "host" | "received") => void;
  bookings: Booking[];
  wishlistedProperties: Property[];
  hostProperties: Property[];
  onCancelBooking: (id: string) => void;
  onRemoveWishlist: (id: string) => void;
  onDeleteHostProperty: (id: string) => void;
  onSelectProperty: (prop: Property) => void;
  properties?: Property[];
  onGoToChat?: (exchangeId: string) => void;
  onCompleteExchange?: (exchangeId: string) => void;
  onOpenReviewModal?: (exchangeId: string, partnerName: string, partnerId: string) => void;
  reviewedExchangeIds?: Set<string>;
}

export default function ProfilePage({
  currentUser,
  onUpdateProfile,
  onUpdateAvatar,
  togglePremium,
  activeTab,
  setActiveTab,
  bookings,
  wishlistedProperties,
  hostProperties,
  onCancelBooking,
  onRemoveWishlist,
  onDeleteHostProperty,
  onSelectProperty,
  properties = [],
  onGoToChat,
  onCompleteExchange,
  onOpenReviewModal,
  reviewedExchangeIds = new Set()
}: ProfilePageProps) {

  console.log("ProfilePage currentUser props:", currentUser);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditName(currentUser.name);
    setEditPhone(currentUser.phone || "");
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfile) return;

    setIsSaving(true);
    try {
      const res = await onUpdateProfile(editName, editPhone);
      if (res.success) {
        toast.success("Cập nhật thông tin cá nhân thành công!");
        setIsEditing(false);
      } else {
        toast.error(res.error || "Cập nhật hồ sơ thất bại.");
      }
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsSaving(false);
    }
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateAvatar) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }

    setIsUploadingAvatar(true);
    const loadingToastId = toast.loading("Đang tải ảnh lên máy chủ...");
    try {
      const res = await onUpdateAvatar(file);
      if (res.success) {
        toast.update(loadingToastId, {
          render: "Cập nhật ảnh đại diện thành công!",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
      } else {
        toast.update(loadingToastId, {
          render: res.error || "Cập nhật ảnh đại diện thất bại.",
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
      }
    } catch (err) {
      toast.update(loadingToastId, {
        render: "Không thể kết nối đến máy chủ.",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <>
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
      
      {/* Left Column: User Card */}
      <div className="w-full md:w-80 space-y-6 shrink-0 text-left">
        <div className="border border-mist rounded-[20px] bg-cloud p-6 shadow-xs space-y-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById("avatar-upload-input")?.click()}>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-24 w-24 rounded-full object-cover border-2 border-brand-coral shadow group-hover:opacity-75 transition duration-200"
              />
              <div className="absolute inset-0 bg-carbon/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                <span className="text-[10px] text-cloud font-bold">Thay ảnh</span>
              </div>
              <span className="absolute bottom-0 right-0 bg-brand-coral text-cloud p-1 rounded-full border-2 border-cloud">
                <Shield className="h-4 w-4" />
              </span>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </div>
            <div>
              <h3 className="font-bold text-carbon text-base">{currentUser.name}</h3>
              <p className="text-xs text-slate mt-0.5">{currentUser.email}</p>
              {currentUser.phone && (
                <p className="text-xs text-slate mt-1 font-semibold">SĐT: {currentUser.phone}</p>
              )}
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

            {currentUser.createdAt && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate font-medium">Ngày tham gia:</span>
                <span className="font-bold text-carbon">
                  {new Date(currentUser.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}

            <button
              onClick={togglePremium}
              className="w-full bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral py-2.5 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {currentUser.isPremium ? "Hủy Premium" : "Nâng cấp Premium"}
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full border border-mist bg-cloud hover:bg-fog text-carbon py-2.5 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <User className="h-3.5 w-3.5 text-slate" />
              Chỉnh sửa hồ sơ
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
              <ClipboardList className="h-4 w-4" /> Đã gửi
            </span>
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 py-4 text-center border-b-2 transition cursor-pointer ${
              activeTab === "received"
                ? "border-brand-coral text-brand-coral font-bold bg-cloud"
                : "border-transparent hover:text-carbon"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <ArrowRightLeft className="h-4 w-4" /> Nhận được
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
              <div className="text-center py-16 space-y-3 font-sans">
                <p className="text-slate text-sm">Bạn chưa gửi đề xuất trao đổi đồ nào.</p>
              </div>
            ) : (
              bookings.map((booking) => {
                const isEx = (booking as any).isExchange;
                const status = (booking as any).status || "Pending";
                const message = (booking as any).message || "";
                const proposerName = (booking as any).proposerPropertyName;
                const proposerImage = (booking as any).proposerPropertyImage;

                return (
                  <div key={booking.id} className="border border-mist rounded-2xl p-4 space-y-4 bg-cloud hover:shadow-xs transition duration-200 font-sans">
                    {isEx ? (
                      <div className="space-y-3">
                        {/* Title bar with Status Badge */}
                        <div className="flex justify-between items-center pb-2 border-b border-mist">
                          <span className="text-[10px] text-slate font-bold uppercase tracking-wider">Đề xuất trao đổi đồ</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            status.toLowerCase() === "pending" ? "bg-amber-100 text-amber-800" :
                            status.toLowerCase() === "accepted" ? "bg-emerald-100 text-emerald-800" :
                            status.toLowerCase() === "completed" ? "bg-blue-100 text-blue-800" :
                            status.toLowerCase() === "rejected" ? "bg-rose-100 text-rose-800" : "bg-slate/10 text-slate"
                          }`}>
                            {status.toLowerCase() === "pending" ? "Chờ phản hồi" :
                             status.toLowerCase() === "accepted" ? "Đã đồng ý" :
                             status.toLowerCase() === "completed" ? "Hoàn thành" :
                             status.toLowerCase() === "rejected" ? "Từ chối" : "Đã hủy"}
                          </span>
                        </div>

                        {/* Comparison grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-7 items-center gap-3 bg-fog/20 p-3 rounded-xl border border-mist/50">
                          {/* Proposer listing (Your item) */}
                          <div className="sm:col-span-3 flex gap-3 items-center min-w-0">
                            <img
                              src={proposerImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                              alt={proposerName}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-lg object-cover bg-pebble shrink-0 border border-mist"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[8px] uppercase font-bold text-brand-coral block">Đồ của bạn đề xuất</span>
                              <h5 className="font-semibold text-xs text-carbon truncate leading-tight mt-0.5" title={proposerName}>
                                {proposerName}
                              </h5>
                            </div>
                          </div>

                          {/* Swap icon */}
                          <div className="sm:col-span-1 flex justify-center text-slate font-bold text-sm">
                            <span className="h-7 w-7 bg-cloud rounded-full border border-mist shadow-xs flex items-center justify-center select-none font-sans">
                              ⇄
                            </span>
                          </div>

                          {/* Receiver listing (Their item) */}
                          <div className="sm:col-span-3 flex gap-3 items-center min-w-0">
                            <img
                              src={booking.propertyImage}
                              alt={booking.propertyName}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-lg object-cover bg-pebble shrink-0 border border-mist"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[8px] uppercase font-bold text-emerald-600 block">Đồ muốn nhận đổi</span>
                              <h5 className="font-semibold text-xs text-carbon truncate leading-tight mt-0.5" title={booking.propertyName}>
                                {booking.propertyName}
                              </h5>
                            </div>
                          </div>
                        </div>

                        {/* Message & Action details */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1 text-xs">
                          {message && (
                            <div className="text-[11px] text-slate leading-relaxed font-sans flex items-start gap-1 max-w-sm sm:max-w-md">
                              <span className="font-bold text-carbon shrink-0">Lời nhắn:</span>
                              <span className="italic text-carbon/80">"{message}"</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0 ml-auto">
                            <div className="text-left sm:text-right">
                              <span className="text-[8px] text-slate block uppercase tracking-wide font-bold">Ngày đề xuất</span>
                              <span className="font-bold text-carbon text-[11px]">{booking.checkIn}</span>
                            </div>
                            {status.toLowerCase() === "pending" && (
                              <button
                                onClick={() => onCancelBooking(booking.id)}
                                className="text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg font-bold transition border border-transparent hover:border-red-200 cursor-pointer active:scale-95 shrink-0 uppercase tracking-wider"
                              >
                                Hủy đề xuất
                              </button>
                            )}
                            {status.toLowerCase() === "accepted" && (
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => onGoToChat?.(booking.id)}
                                  className="text-[9px] text-brand-coral hover:bg-rose-50 px-2 py-1 rounded-lg font-bold transition border border-brand-coral cursor-pointer"
                                >
                                  Nhắn tin
                                </button>
                                <button
                                  onClick={() => onCompleteExchange?.(booking.id)}
                                  className="text-[9px] bg-brand-coral hover:bg-brand-deep text-white px-2 py-1 rounded-lg font-bold transition cursor-pointer"
                                >
                                  Hoàn tất
                                </button>
                              </div>
                            )}
                            {status.toLowerCase() === "completed" && (
                              <div className="flex gap-2 shrink-0">
                                {reviewedExchangeIds.has(booking.id) ? (
                                  <button
                                    disabled
                                    className="text-[9px] bg-slate/10 text-slate/40 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-not-allowed select-none border border-mist/50"
                                  >
                                    <Star className="h-3 w-3 fill-slate/30 text-slate/30" />
                                    Đã đánh giá
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onOpenReviewModal?.(booking.id, (booking as any).receiverOwnerName || "Chủ sản phẩm", (booking as any).receiverId)}
                                    className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
                                  >
                                    <Star className="h-3 w-3 fill-white" />
                                    Đánh giá
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
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
                    )}
                  </div>
                );
              })
            )
          )}

          {/* RECEIVED EXCHANGES VIEW */}
          {activeTab === "received" && (
            <ReceivedExchanges />
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

    {isEditing && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-cloud border border-mist rounded-[24px] p-6 shadow-2xl space-y-6 text-left animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-carbon text-lg">Cập nhật hồ sơ</h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="text-slate hover:text-carbon p-1 rounded-full hover:bg-fog transition cursor-pointer"
              disabled={isSaving}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-carbon">Họ và tên</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-mist bg-cloud focus:border-brand-coral focus:ring-1 focus:ring-brand-coral text-sm text-carbon transition outline-none"
                placeholder="Nhập họ và tên mới"
                required
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-carbon">Số điện thoại</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-mist bg-cloud focus:border-brand-coral focus:ring-1 focus:ring-brand-coral text-sm text-carbon transition outline-none"
                placeholder="Nhập số điện thoại mới"
                required
                disabled={isSaving}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 border border-mist hover:bg-fog text-carbon rounded-xl font-bold text-xs transition cursor-pointer text-center"
                disabled={isSaving}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-coral hover:bg-brand-deep disabled:bg-slate/30 text-cloud rounded-xl font-bold text-xs transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                disabled={isSaving || !editName || !editPhone}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Lưu thay đổi</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );

  // --- RECEIVED EXCHANGES SUB-COMPONENT ---
  function ReceivedExchanges() {
    const [receivedExchanges, setReceivedExchanges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadReceived = useCallback(async () => {
      setLoading(true);
      try {
        const data = await fetchIncomingExchanges();
        setReceivedExchanges(data);
      } catch {
        toast.error("Không thể tải đề xuất nhận được.");
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      if (activeTab === "received") {
        loadReceived();
      }
    }, [activeTab, loadReceived]);

    const handleAccept = async (id: string) => {
      setProcessingId(id);
      try {
        await acceptExchange(id);
        toast.success("Đã chấp nhận đề xuất trao đổi!");
        loadReceived();
      } catch (e: any) {
        toast.error(e.message || "Chấp nhận thất bại.");
      } finally {
        setProcessingId(null);
      }
    };

    const handleReject = async (id: string) => {
      setProcessingId(id);
      try {
        await rejectExchange(id);
        toast.success("Đã từ chối đề xuất.");
        loadReceived();
      } catch (e: any) {
        toast.error(e.message || "Từ chối thất bại.");
      } finally {
        setProcessingId(null);
      }
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-coral" />
        </div>
      );
    }

    if (receivedExchanges.length === 0) {
      return (
        <div className="text-center py-16 space-y-2 font-sans">
          <p className="text-slate text-sm">Chưa có đề xuất trao đổi nào gửi đến bạn.</p>
          <p className="text-xs text-slate/70">Khi có người muốn đổi sản phẩm của bạn, họ sẽ gửi đề xuất và hiện ở đây.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {receivedExchanges.map((ex) => {
          const status = ex.status || "Pending";
          const isPending = status.toLowerCase() === "pending";
          
          // Resolve listings from global properties if not populated
          const propListing = ex.proposerListing || properties?.find(p => p.id === ex.proposerListingId);
          const recvListing = ex.receiverListing || properties?.find(p => p.id === ex.receiverListingId);
          
          const proposerImage = propListing?.images?.[0]?.imageUrl || propListing?.images?.[0] || "";
          const proposerName = propListing?.title || `Sản phẩm (ID: ${ex.proposerListingId?.substring(0,8)})`;
          const receiverImage = recvListing?.images?.[0]?.imageUrl || recvListing?.images?.[0] || "";
          const receiverName = recvListing?.title || `Sản phẩm của bạn (ID: ${ex.receiverListingId?.substring(0,8)})`;
          
          const message = ex.message || "";
          const createdAt = ex.createdAt ? new Date(ex.createdAt).toLocaleDateString("vi-VN") : "";
          const proposerOwnerName = ex.proposerOwner?.fullName || ex.proposerOwner?.name || "Người dùng";
          const proposerOwnerAvatar = ex.proposerOwner?.avatar || ex.proposerOwner?.avatarUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

          return (
            <div key={ex.id} className="border border-mist rounded-xl p-4 bg-cloud space-y-3 font-sans">
              {/* Header: owner info + status */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={proposerOwnerAvatar}
                    alt={proposerOwnerName}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full object-cover bg-pebble shrink-0 border border-mist"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate uppercase font-bold tracking-wide">Người gửi</p>
                    <p className="font-semibold text-xs text-carbon truncate">{proposerOwnerName}</p>
                  </div>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  isPending ? "bg-amber-100 text-amber-800" :
                  status.toLowerCase() === "accepted" ? "bg-emerald-100 text-emerald-800" :
                  status.toLowerCase() === "completed" ? "bg-blue-100 text-blue-800" :
                  status.toLowerCase() === "rejected" ? "bg-rose-100 text-rose-800" : "bg-slate/10 text-slate"
                }`}>
                  {isPending ? "Chờ xử lý" :
                   status.toLowerCase() === "accepted" ? "Đã đồng ý" :
                   status.toLowerCase() === "completed" ? "Hoàn thành" :
                   status.toLowerCase() === "rejected" ? "Từ chối" : "Đã hủy"}
                </span>
              </div>

              {/* Comparison grid */}
              <div className="grid grid-cols-1 sm:grid-cols-7 items-center gap-3 bg-fog/20 p-3 rounded-xl border border-mist/50">
                {/* Their item (proposer's) */}
                <div className="sm:col-span-3 flex gap-3 items-center min-w-0">
                  <img
                    src={proposerImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                    alt={proposerName}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-lg object-cover bg-pebble shrink-0 border border-mist"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] uppercase font-bold text-brand-coral block">Họ muốn đổi đi</span>
                    <h5 className="font-semibold text-xs text-carbon truncate leading-tight mt-0.5" title={proposerName}>
                      {proposerName}
                    </h5>
                  </div>
                </div>

                {/* Swap icon */}
                <div className="sm:col-span-1 flex justify-center text-slate font-bold text-sm">
                  <span className="h-7 w-7 bg-cloud rounded-full border border-mist shadow-xs flex items-center justify-center select-none font-sans">⇄</span>
                </div>

                {/* Your item (receiver) */}
                <div className="sm:col-span-3 flex gap-3 items-center min-w-0">
                  <img
                    src={receiverImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                    alt={receiverName}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-lg object-cover bg-pebble shrink-0 border border-mist"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] uppercase font-bold text-emerald-600 block">Của bạn</span>
                    <h5 className="font-semibold text-xs text-carbon truncate leading-tight mt-0.5" title={receiverName}>
                      {receiverName}
                    </h5>
                  </div>
                </div>
              </div>

              {/* Message & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                {message && (
                  <div className="text-[11px] text-slate leading-relaxed font-sans flex items-start gap-1 max-w-sm sm:max-w-md">
                    <span className="font-bold text-carbon shrink-0">Lời nhắn:</span>
                    <span className="italic text-carbon/80">"{message}"</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0 ml-auto">
                  <div className="text-left sm:text-right">
                    <span className="text-[8px] text-slate block uppercase tracking-wide font-bold">Ngày gửi</span>
                    <span className="font-bold text-carbon text-[11px]">{createdAt}</span>
                  </div>
                  {isPending && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleReject(ex.id)}
                        disabled={processingId === ex.id}
                        className="text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg font-bold transition border border-transparent hover:border-red-200 cursor-pointer active:scale-95 uppercase tracking-wider disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleAccept(ex.id)}
                        disabled={processingId === ex.id}
                        className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition cursor-pointer active:scale-95 uppercase tracking-wider disabled:opacity-50 flex items-center gap-1"
                      >
                        {processingId === ex.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                        Chấp nhận
                      </button>
                    </div>
                  )}
                  {status.toLowerCase() === "accepted" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => onGoToChat?.(ex.id)}
                        className="text-[9px] text-brand-coral hover:bg-rose-50 px-2 py-1 rounded-lg font-bold transition border border-brand-coral cursor-pointer"
                      >
                        Nhắn tin
                      </button>
                      <button
                        onClick={() => onCompleteExchange?.(ex.id)}
                        className="text-[9px] bg-brand-coral hover:bg-brand-deep text-white px-2 py-1 rounded-lg font-bold transition cursor-pointer"
                      >
                        Hoàn tất
                      </button>
                    </div>
                  )}
                  {status.toLowerCase() === "completed" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => onOpenReviewModal?.(ex.id, proposerOwnerName, ex.proposerId)}
                        className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Star className="h-3 w-3 fill-white" />
                        Đánh giá
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
