import React, { useState, useMemo } from "react";
import { Star, Heart, MapPin, Calendar, Users, Shield, Compass, Check, CalendarCheck, Share2, ArrowLeft } from "lucide-react";
import { Property, Booking, Review } from "@/types";
import { MOCK_REVIEWS } from "@/data";
import { useRouter } from "@shared/context/RouterContext";

interface ListingDetailPageProps {
  property: Property;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  onBook: (booking: Omit<Booking, "id" | "bookedAt">) => void;
}

export default function ListingDetailPage({
  property,
  isWishlisted,
  onWishlistToggle,
  onBook
}: ListingDetailPageProps) {
  const { navigate } = useRouter();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [checkIn, setCheckIn] = useState("2026-07-05");
  const [checkOut, setCheckOut] = useState("2026-07-10");
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate dynamic reviews specific to this place
  const reviews: Review[] = useMemo(() => {
    return MOCK_REVIEWS.map((review, i) => {
      let content = review.content;
      if (property.isExperience) {
        content = content.replace("flat", "experience").replace("place", "session");
      } else {
        content = content.replace("session", "apartment").replace("experience", "stay");
      }
      return {
        ...review,
        id: `${property.id}-review-${i}`,
        content
      };
    });
  }, [property]);

  // Calculate nights
  const nights = useMemo(() => {
    if (property.isExperience) return 1;
    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 5 : diffDays;
  }, [checkIn, checkOut, property.isExperience]);

  // Calculated costs
  const baseCost = property.price * (property.isExperience ? guestsCount : nights);
  const cleaningFee = property.isExperience ? 0 : 30000;
  const serviceFee = 0;
  const totalCost = baseCost + cleaningFee + serviceFee;

  const handleShare = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    onBook({
      propertyId: property.id,
      propertyName: property.title,
      propertyImage: property.images[0],
      checkIn,
      checkOut: property.isExperience ? checkIn : checkOut,
      guests: { adults: guestsCount, children: 0 },
      totalPrice: totalCost / 1000 // normalized value stored in mock database
    });
    setBookingSuccess(true);
  };

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-10 space-y-6">
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-mist">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-1.5 text-carbon hover:bg-fog px-3 py-1.5 rounded-full transition text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại khám phá</span>
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 hover:bg-fog rounded-full text-carbon transition relative cursor-pointer"
            title="Copy Listing Link"
          >
            <Share2 className="h-4.5 w-4.5" />
            {copiedLink && (
              <span className="absolute -bottom-8 right-0 bg-carbon text-cloud text-[11px] px-2 py-1 rounded shadow">
                Đã chép!
              </span>
            )}
          </button>
          <button
            onClick={onWishlistToggle}
            className="p-2.5 hover:bg-fog rounded-full text-carbon transition cursor-pointer"
            title="Add to Wishlist"
          >
            <Heart
              className={`h-4.5 w-4.5 ${
                isWishlisted ? "text-brand-coral fill-brand-coral" : "text-carbon fill-none"
              }`}
            />
          </button>
        </div>
      </div>

      {bookingSuccess ? (
        <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto space-y-6">
          <div className="h-16 w-16 bg-emerald-500 text-cloud rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Check className="h-10 w-10 stroke-[3]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-carbon">Gửi đề xuất thành công!</h2>
            <p className="text-slate text-sm">
              Đề xuất trao đổi của bạn đã được gửi đến chủ đồ. Bạn có thể theo dõi tiến độ trong danh sách giao dịch ở trang cá nhân.
            </p>
          </div>

          {/* Digital Receipt Card */}
          <div className="w-full bg-fog border border-mist p-5 rounded-xl text-left space-y-3 font-sans">
            <div className="flex justify-between border-b border-mist pb-2 text-xs text-slate uppercase font-semibold">
              <span>Chi tiết đề xuất trao đổi</span>
              <span className="text-brand-coral font-bold"># {property.id.substring(0,4).toUpperCase()}-{Math.floor(Math.random() * 9000 + 1000)}</span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate">Sản phẩm đổi:</span>
                <span className="font-semibold text-carbon text-right max-w-[200px] truncate">{property.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Chủ sở hữu:</span>
                <span className="font-medium text-carbon">{property.hostName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Ngày đề xuất:</span>
                <span className="font-medium text-carbon">{checkIn}</span>
              </div>
              {!property.isExperience && (
                <div className="flex justify-between">
                  <span className="text-slate">Ngày hoàn trả (nếu mượn):</span>
                  <span className="font-medium text-carbon">{checkOut}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate">Số lượng:</span>
                <span className="font-medium text-carbon">{guestsCount} sản phẩm</span>
              </div>
              <div className="border-t border-mist pt-2 mt-2 flex justify-between font-bold text-base text-carbon">
                <span>Giá trị ước tính:</span>
                <span>{property.price.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => navigate("home")}
              className="flex-1 bg-brand-coral hover:bg-brand-deep text-cloud font-semibold py-3 rounded-xl shadow transition cursor-pointer"
            >
              Tiếp tục khám phá
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Heading Titles */}
          <div className="space-y-1 text-left">
            <h1 className="text-2xl md:text-3xl font-sans font-bold text-carbon tracking-tight leading-tight">
              {property.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-carbon font-medium">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-carbon text-carbon" />
                <span>{property.rating.toFixed(2)}</span>
                <span className="text-slate font-normal">({property.reviewsCount} đánh giá)</span>
              </div>
              <span>•</span>
              {property.isGuestFavorite && (
                <span className="bg-fog text-carbon px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                  Uy tín cao
                </span>
              )}
              <span className="text-slate flex items-center gap-1 font-normal">
                <MapPin className="h-4 w-4 text-slate" /> {property.location}
              </span>
            </div>
          </div>

          {/* Photo Collage Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-[20px] overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-pebble relative">
            <div className="md:col-span-2 relative h-full w-full">
              <img
                src={property.images[activeImgIndex]}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition duration-300"
              />
            </div>
            <div className="hidden md:flex flex-col gap-3 h-full">
              {property.images.slice(1, 3).map((img, i) => (
                <div
                  key={i}
                  className="flex-1 cursor-pointer overflow-hidden relative group/img"
                  onClick={() => setActiveImgIndex(i + 1)}
                >
                  <img
                    src={img}
                    alt={`${property.title} gallery ${i}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover/img:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 right-4 bg-carbon/80 text-cloud text-xs px-3 py-1.5 rounded-md font-semibold select-none">
              {activeImgIndex + 1} / {property.images.length} hình ảnh
            </div>
          </div>

          {/* Grid Layout: Details Left, Widgets Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Detailed Info */}
            <div className="lg:col-span-2 space-y-6 text-left">
              <div className="flex items-center justify-between pb-5 border-b border-mist">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-bold text-carbon">
                    Sở hữu bởi {property.hostName}
                  </h2>
                  <p className="text-slate text-sm">
                    {property.hostType} • Thành viên uy tín
                  </p>
                </div>
                <img
                  src={property.hostAvatar}
                  alt={property.hostName}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full object-cover border border-mist shadow-xs"
                />
              </div>

              <div className="space-y-4 pb-5 border-b border-mist">
                <div className="flex gap-4">
                  <Compass className="h-6 w-6 text-brand-coral shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-carbon text-sm">Khu vực thuận tiện</h4>
                    <p className="text-slate text-xs mt-0.5">
                      Địa chỉ giao dịch rõ ràng, dễ dàng hẹn gặp mặt trao đổi trực tiếp.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Shield className="h-6 w-6 text-brand-coral shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-carbon text-sm">Giao dịch an toàn</h4>
                    <p className="text-slate text-xs mt-0.5">
                      Tự do đàm phán, hệ thống cho phép hủy giao dịch nếu hai bên không đạt được đồng thuận.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pb-5 border-b border-mist">
                <h3 className="text-base font-bold text-carbon">Mô tả sản phẩm</h3>
                <p className="text-slate text-sm leading-relaxed whitespace-pre-line font-sans">
                  {property.description}
                </p>
              </div>

              <div className="space-y-3 pb-5 border-b border-mist">
                <h3 className="text-base font-bold text-carbon">Đặc điểm nổi bật</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-carbon">
                      <Check className="h-4.5 w-4.5 text-emerald-500 stroke-[2.5] shrink-0" />
                      <span className="font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-carbon flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-carbon text-carbon" />
                  <span>{property.rating.toFixed(2)}</span>
                  <span className="text-slate text-xs font-normal">({property.reviewsCount} đánh giá)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border border-mist p-4 rounded-xl space-y-2.5 bg-fog">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatar}
                          alt={rev.author}
                          referrerPolicy="no-referrer"
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div>
                          <h5 className="font-semibold text-xs text-carbon">{rev.author}</h5>
                          <p className="text-[10px] text-slate">{rev.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <p className="text-xs text-carbon leading-relaxed font-sans">{rev.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Reservation/Trade Widget */}
            <div className="h-fit">
              <div className="border border-mist rounded-[20px] bg-cloud p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)] space-y-4 text-left">
                <div className="flex justify-between items-baseline">
                  <p className="text-xl font-bold text-carbon">
                    {property.price.toLocaleString("vi-VN")} đ
                    <span className="text-slate font-normal text-xs">
                      {property.isExperience ? " / món" : " / tổng"}
                    </span>
                  </p>
                  <span className="text-slate text-xs flex items-center gap-1 font-medium">
                    <Star className="h-3.5 w-3.5 fill-carbon text-carbon" />
                    {property.rating.toFixed(2)}
                  </span>
                </div>

                <form onSubmit={handleReserve} className="space-y-3">
                  <div className="border border-slate rounded-xl overflow-hidden text-left bg-cloud">
                    {property.isExperience ? (
                      <div className="px-3 py-2 border-b border-slate bg-cloud">
                        <label className="block text-[9px] font-bold text-carbon uppercase tracking-wider">
                          Ngày gặp mặt đề xuất
                        </label>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar className="h-3.5 w-3.5 text-brand-coral" />
                          <input
                            type="date"
                            required
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full text-xs text-carbon focus:outline-none bg-transparent"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2">
                        <div className="px-3 py-2 border-r border-slate bg-cloud">
                          <label className="block text-[9px] font-bold text-carbon uppercase tracking-wider">
                            Ngày nhận đồ
                          </label>
                          <input
                            type="date"
                            required
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full text-xs text-carbon focus:outline-none mt-0.5 bg-transparent"
                          />
                        </div>
                        <div className="px-3 py-2 bg-cloud">
                          <label className="block text-[9px] font-bold text-carbon uppercase tracking-wider">
                            Ngày trả đồ
                          </label>
                          <input
                            type="date"
                            required
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full text-xs text-carbon focus:outline-none mt-0.5 bg-transparent"
                          />
                        </div>
                      </div>
                    )}

                    <div className="px-3 py-2 bg-cloud">
                      <label className="block text-[9px] font-bold text-carbon uppercase tracking-wider">
                        Số lượng trao đổi
                      </label>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-carbon">{guestsCount} sản phẩm</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={guestsCount <= 1}
                            onClick={() => setGuestsCount(g => Math.max(1, g - 1))}
                            className="h-6 w-6 border border-mist bg-fog rounded-full flex items-center justify-center text-xs text-carbon font-bold hover:bg-pebble disabled:opacity-30 transition cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            disabled={guestsCount >= property.maxGuests}
                            onClick={() => setGuestsCount(g => Math.min(property.maxGuests, g + 1))}
                            className="h-6 w-6 border border-mist bg-fog rounded-full flex items-center justify-center text-xs text-carbon font-bold hover:bg-pebble disabled:opacity-30 transition cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-coral hover:bg-brand-deep text-cloud py-3 rounded-xl font-bold transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CalendarCheck className="h-4.5 w-4.5" />
                    <span>Gửi đề xuất trao đổi đồ</span>
                  </button>
                </form>

                <p className="text-[11px] text-slate text-center leading-normal">
                  Hệ thống sẽ lưu đề xuất và gửi thông báo đến chủ sở hữu để thương lượng.
                </p>

                <div className="space-y-2 border-t border-mist pt-4 text-xs font-medium">
                  <div className="flex justify-between text-carbon">
                    <span className="underline text-slate hover:text-carbon cursor-help">
                      {property.price.toLocaleString("vi-VN")} đ x {property.isExperience ? `${guestsCount} sản phẩm` : `${nights} ngày`}
                    </span>
                    <span>{baseCost.toLocaleString("vi-VN")} đ</span>
                  </div>
                  {!property.isExperience && (
                    <div className="flex justify-between text-carbon">
                      <span className="underline text-slate hover:text-carbon cursor-help">Phí ship dự kiến</span>
                      <span>30.000 đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-carbon">
                    <span className="underline text-slate hover:text-carbon cursor-help">Phí dịch vụ SWAPLY</span>
                    <span>0 đ</span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-sm text-carbon border-t border-mist pt-3 mt-1">
                    <span>Tổng giá trị ước tính</span>
                    <span>{(totalCost + (property.isExperience ? 0 : 30000)).toLocaleString("vi-VN")} đ</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </main>
  );
}
