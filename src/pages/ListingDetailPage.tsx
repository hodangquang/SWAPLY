import React, { useState, useEffect, useMemo } from "react";
import { Star, Heart, MapPin, Calendar, Shield, Compass, Check, CalendarCheck, Share2, ArrowLeft, Loader2, Eye, TrendingUp, Clock, Package, ChevronLeft, ChevronRight, X, Flag, MessageSquare } from "lucide-react";
import { Property, Review } from "@/types";
import { fetchListingById, fetchMyListings, fetchProperties } from "@shared/api/listingApi";
import { fetchExchanges } from "@/shared/api/exchangeApi";
import { apiClient } from "@shared/api/apiClient";
import { useRouter } from "@shared/context/RouterContext";
import { toast } from "react-toastify";

interface ListingDetailPageProps {
  propertyId?: string;
  property?: Property;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  onBook: (booking: {
    propertyId: string;
    propertyName: string;
    propertyImage: string;
    checkIn: string;
    checkOut: string;
    guests: { adults: number; children: number };
    totalPrice: number;
    isExchange?: boolean;
    proposerListingId?: string;
    receiverListingId?: string;
    message?: string;
  }) => Promise<any>;
  currentUser?: { id: string; name: string; email: string; avatar: string; isPremium: boolean } | null;
  properties?: Property[];
}

export default function ListingDetailPage({
  propertyId,
  property: initialProperty,
  isWishlisted,
  onWishlistToggle,
  onBook,
  currentUser,
  properties
}: ListingDetailPageProps) {
  const { navigate } = useRouter();
  
  // State for API data
  const [property, setProperty] = useState<Property | null>(initialProperty || null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ownerRating, setOwnerRating] = useState<{ rating: number; count: number }>({ rating: 4.8, count: 0 });
  const [loading, setLoading] = useState(!initialProperty);
  const [error, setError] = useState<string | null>(null);
  
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImgIndex, setLightboxImgIndex] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!property?.images || property.images.length === 0) return;
    setLightboxImgIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!property?.images || property.images.length === 0) return;
    setLightboxImgIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property?.ownerId) {
      toast.error("Không tìm thấy thông tin chủ sản phẩm.");
      return;
    }

    setIsSubmittingReport(true);
    try {
      await apiClient.reportUser(property.ownerId, reportReason, reportDescription);
      toast.success("Báo cáo người dùng thành công!");
      setIsReportModalOpen(false);
      setReportDescription("");
      setReportReason("Spam");
    } catch (err: any) {
      toast.error(err.message || "Gửi báo cáo thất bại.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const [createdExchange, setCreatedExchange] = useState<any>(null);
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  const handleOpenChat = async () => {
    if (!property || !currentUser) return;
    setIsOpeningChat(true);
    try {
      const conversation = await apiClient.createConversation({
        otherUserId: property.ownerId,
        relatedListingId: property.id,
        relatedExchangeId: createdExchange?.id || undefined
      });
      if (conversation) {
        sessionStorage.setItem("swaply_active_conversation_id", conversation.id);
        navigate("chat");
      } else {
        toast.error("Không thể mở cuộc trò chuyện.");
      }
    } catch (err: any) {
      toast.error(err.message || "Tạo cuộc trò chuyện thất bại.");
    } finally {
      setIsOpeningChat(false);
    }
  };

  const handleGoToChatDirectly = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!property || !currentUser) return;
    setIsOpeningChat(true);
    try {
      const conversation = await apiClient.createConversation({
        otherUserId: property.ownerId,
        relatedListingId: property.id,
        relatedExchangeId: existingExchange?.id || undefined
      });
      if (conversation) {
        sessionStorage.setItem("swaply_active_conversation_id", conversation.id);
        navigate("chat");
      } else {
        toast.error("Không thể mở cuộc trò chuyện.");
      }
    } catch (err: any) {
      toast.error(err.message || "Tạo cuộc trò chuyện thất bại.");
    } finally {
      setIsOpeningChat(false);
    }
  };

  const handleGoToChatForExchange = async (exchangeId: string) => {
    if (!property || !currentUser) return;
    setIsOpeningChat(true);
    try {
      const conversation = await apiClient.createConversation({
        otherUserId: property.ownerId,
        relatedListingId: property.id,
        relatedExchangeId: exchangeId
      });
      if (conversation) {
        sessionStorage.setItem("swaply_active_conversation_id", conversation.id);
        navigate("chat");
      } else {
        toast.error("Không thể mở cuộc trò chuyện.");
      }
    } catch (err: any) {
      toast.error(err.message || "Tạo cuộc trò chuyện thất bại.");
    } finally {
      setIsOpeningChat(false);
    }
  };

  const [checkIn, setCheckIn] = useState(new Date().toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  });
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [proposerListingId, setProposerListingId] = useState("");
  const [message, setMessage] = useState("Tôi muốn đề xuất đổi sản phẩm của tôi lấy sản phẩm này của bạn.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myPropertyIds, setMyPropertyIds] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [dbHasExchange, setDbHasExchange] = useState(false);
  const [existingExchange, setExistingExchange] = useState<any | null>(null);
  const [proposedListingIds, setProposedListingIds] = useState<Set<string>>(new Set());
  const [myExchangesForThisItem, setMyExchangesForThisItem] = useState<any[]>([]);

  const [hasIncomingExchange, setHasIncomingExchange] = useState(false);
  const [incomingExchange, setIncomingExchange] = useState<any | null>(null);

  // Fetch exchanges from DB to verify if user has already proposed a trade for this item
  useEffect(() => {
    const checkDbExchange = async () => {
      const targetId = property?.id || propertyId;
      if (!currentUser || !targetId) return;
      try {
        const list = await apiClient.fetchExchanges();
        
        // Find ALL active pending/approved exchanges for this listing from the current user
        const activeExchanges = list.filter(
          (ex: any) =>
            ex.proposerId === currentUser.id &&
            ex.receiverListingId === targetId &&
            (ex.status.toLowerCase() === "pending" || ex.status.toLowerCase() === "approved")
        );

        setMyExchangesForThisItem(activeExchanges);

        if (activeExchanges.length > 0) {
          setExistingExchange(activeExchanges[0]);
          setDbHasExchange(true);
          
          const proposed = new Set(
            activeExchanges.map((ex: any) => ex.proposerListingId.toLowerCase())
          );
          setProposedListingIds(proposed);
        } else {
          setExistingExchange(null);
          setDbHasExchange(false);
          setProposedListingIds(new Set());
        }

        // Find if the listing owner proposed this listing to the current user
        const incoming = list.find(
          (ex: any) =>
            ex.receiverId === currentUser.id &&
            ex.proposerListingId === targetId &&
            (ex.status.toLowerCase() === "pending" || ex.status.toLowerCase() === "approved")
        );

        if (incoming) {
          setHasIncomingExchange(true);
          setIncomingExchange(incoming);
        } else {
          setHasIncomingExchange(false);
          setIncomingExchange(null);
        }
      } catch (e) {
        console.warn("Could not fetch exchanges for verification:", e);
      }
    };
    checkDbExchange();
  }, [currentUser, property?.id, propertyId, refreshKey]);

  // Check localStorage synchronously for pending exchange
  const hasPendingExchange = useMemo(() => {
    const id = property?.id || propertyId;
    if (!currentUser || !id) return false;
    const sentKey = `exchange_sent_${id}_${currentUser.id}`;
    return localStorage.getItem(sentKey) === "true" || dbHasExchange;
  }, [currentUser, property?.id, propertyId, dbHasExchange, refreshKey]);

  // Fetch my listing IDs for exchange from API
  useEffect(() => {
    const loadMyListings = async () => {
      if (!currentUser) {
        setMyPropertyIds(new Set());
        return;
      }
      try {
        // Call /Listings/my API
        const myProps = await fetchMyListings();
        console.log("[Exchange Debug] fetchMyListings returned:", myProps.length, "listings");
        
        // Normalize IDs to lowercase for consistent comparison
        const ids = new Set(myProps.map((p) => p.id.toLowerCase()));
        console.log("[Exchange Debug] myPropertyIds set:", ids);
        setMyPropertyIds(ids);
      } catch (e) {
        console.error("[Exchange Debug] Error loading my listings:", e);
        setMyPropertyIds(new Set());
      }
    };
    loadMyListings();
  }, [currentUser]);

  // Fetch property data from API
  useEffect(() => {
    const loadProperty = async () => {
      const targetId = propertyId || initialProperty?.id;
      if (!targetId) {
        setError("Không có thông tin sản phẩm.");
        setLoading(false);
        return;
      }

      // If initialProperty is not provided, show fullscreen loader.
      // If it is provided, display it immediately and fetch the full listing details in the background.
      if (!initialProperty) {
        setLoading(true);
      }
      setError(null);
      
      try {
        const data = await fetchListingById(targetId);
        if (data) {
          setProperty(data);
        } else if (!initialProperty) {
          setError("Không tìm thấy sản phẩm này.");
        }
      } catch (err: any) {
        if (!initialProperty) {
          setError(err?.message || "Không thể tải thông tin sản phẩm.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, initialProperty?.id]);

  // Fetch reviews for this listing
  useEffect(() => {
    const loadReviews = async () => {
      if (!property?.ownerId) {
        setReviews([]);
        return;
      }
      
      try {
        const userReviews = await apiClient.getUserReviews(property.ownerId);
        setReviews(userReviews || []);
      } catch {
        setReviews([]);
      }
    };

    loadReviews();
  }, [property?.ownerId]);

  // Fetch owner rating info
  useEffect(() => {
    const loadOwnerRating = async () => {
      if (!property?.ownerId) return;
      try {
        const ratingData = await apiClient.getUserRating(property.ownerId);
        if (ratingData) {
          setOwnerRating({
            rating: ratingData.rating || 4.8,
            count: ratingData.count || 0
          });
        }
      } catch (e) {
        console.warn("Could not fetch owner rating:", e);
      }
    };
    loadOwnerRating();
  }, [property?.ownerId]);

  // Check existing exchanges from API (runs after initial render)
  useEffect(() => {
    const checkExistingExchange = async () => {
      if (!currentUser || !propertyId) return;
      try {
        const exchanges = await fetchExchanges();
        const hasPending = exchanges.some(
          (ex) =>
            ex.receiverListingId === propertyId &&
            (ex.status?.toLowerCase() === "pending" || ex.status?.toLowerCase() === "accepted")
        );
        // If API says no pending, also clear localStorage
        if (!hasPending) {
          localStorage.removeItem(`exchange_sent_${propertyId}_${currentUser.id}`);
        }
      } catch {
        // Silently fail - localStorage check is primary
      }
    };
    checkExistingExchange();
  }, [currentUser, propertyId]);

  // Filter current user's listings to propose (excluding current property)
  const myProperties = useMemo(() => {
    if (!myPropertyIds.size || !properties) return [];
    const filtered = properties.filter((p) => 
      myPropertyIds.has(p.id.toLowerCase()) && 
      p.id.toLowerCase() !== property?.id?.toLowerCase()
    );
    console.log("[Exchange Debug] myProperties computed:", filtered.length);
    return filtered;
  }, [myPropertyIds, properties, property]);

  // Filter available properties (excluding ones already proposed)
  const availableMyProperties = useMemo(() => {
    return myProperties.filter(p => !proposedListingIds.has(p.id.toLowerCase()));
  }, [myProperties, proposedListingIds]);

  // Sync default select option to first available property
  useEffect(() => {
    if (availableMyProperties.length > 0) {
      if (!proposerListingId || !availableMyProperties.some(p => p.id === proposerListingId)) {
        setProposerListingId(availableMyProperties[0].id);
      }
    } else {
      setProposerListingId("");
    }
  }, [availableMyProperties, proposerListingId]);

  // Calculate nights
  const nights = useMemo(() => {
    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 5 : diffDays;
  }, [checkIn, checkOut]);

  // Calculated costs - use estimatedValue from API
  const estimatedValue = property?.estimatedValue || property?.price || 0;
  const baseCost = estimatedValue;
  const cleaningFee = 30000;
  const serviceFee = 0;
  const totalCost = baseCost + cleaningFee + serviceFee;

  const handleShare = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || isSubmitting) return;
    
    if (proposerListingId && proposedListingIds.has(proposerListingId.toLowerCase())) {
      toast.error("Vật phẩm này đã được đề xuất trao đổi trước đó.");
      return;
    }
    
    // Immediately prevent double-submit
    setIsSubmitting(true);
    
    try {
      if (currentUser && myProperties.length > 0) {
        const exchange = await onBook({
          propertyId: property.id,
          propertyName: property.title,
          propertyImage: property.images?.[0] || "",
          checkIn,
          checkOut,
          guests: { adults: guestsCount, children: 0 },
          totalPrice: estimatedValue / 1000,
          isExchange: true,
          proposerListingId: proposerListingId || myProperties[0].id,
          receiverListingId: property.id,
          message: message
        });
        
        // Save to localStorage so it persists when navigating back
        if (currentUser) {
          localStorage.setItem(`exchange_sent_${property.id}_${currentUser.id}`, "true");
          setRefreshKey(k => k + 1); // Force re-render
        }

        // Auto-create/fetch conversation and redirect immediately
        try {
          const conversation = await apiClient.createConversation({
            otherUserId: property.ownerId,
            relatedListingId: property.id,
            relatedExchangeId: exchange?.id || undefined
          });
          if (conversation) {
            sessionStorage.setItem("swaply_active_conversation_id", conversation.id);
            toast.success("Gửi đề xuất trao đổi thành công! Đang kết nối...");
            navigate("chat");
          } else {
            toast.success("Gửi đề xuất trao đổi thành công!");
            navigate("chat");
          }
        } catch (chatErr) {
          toast.success("Gửi đề xuất trao đổi thành công!");
          navigate("chat");
        }
      } else {
        await onBook({
          propertyId: property.id,
          propertyName: property.title,
          propertyImage: property.images?.[0] || "",
          checkIn,
          checkOut,
          guests: { adults: guestsCount, children: 0 },
          totalPrice: estimatedValue / 1000
        });
        setBookingSuccess(true);
      }
    } catch (err: any) {
      toast.error(err?.message || "Gửi đề xuất trao đổi thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-10">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-coral" />
          <p className="text-slate text-sm">Đang tải thông tin sản phẩm...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-10">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-16 w-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8" />
          </div>
          <p className="text-carbon text-lg font-semibold">{error || "Không tìm thấy sản phẩm"}</p>
          <button
            onClick={() => navigate("home")}
            className="bg-brand-coral hover:bg-brand-deep text-cloud font-semibold py-2.5 px-6 rounded-xl transition"
          >
            Quay lại trang chủ
          </button>
        </div>
      </main>
    );
  }

  // Get condition display text
  const getConditionText = (condition: string) => {
    switch (condition) {
      case "New": return "Mới 100% (New)";
      case "LikeNew": return "Như mới (Like New)";
      case "Good": return "Đang dùng tốt (Good)";
      case "Fair": return "Khá / Trầy nhẹ (Fair)";
      default: return condition || "Đang sử dụng (Good)";
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return { text: "Đang hoạt động", class: "bg-emerald-100 text-emerald-700" };
      case "Pending": return { text: "Đang chờ duyệt", class: "bg-amber-100 text-amber-700" };
      case "Rejected": return { text: "Đã bị từ chối", class: "bg-rose-100 text-rose-700" };
      case "Expired": return { text: "Đã hết hạn", class: "bg-gray-100 text-gray-700" };
      default: return { text: status, class: "bg-gray-100 text-gray-700" };
    }
  };

  const statusBadge = getStatusBadge(property.status);

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
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="p-2.5 hover:bg-rose-50 text-carbon hover:text-brand-coral rounded-full transition cursor-pointer"
            title="Báo cáo người dùng này"
          >
            <Flag className="h-4.5 w-4.5" />
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
                <span className="text-slate">Sản phẩm muốn nhận:</span>
                <span className="font-semibold text-carbon text-right max-w-[200px] truncate">{property.title}</span>
              </div>
              {currentUser && myProperties.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate">Sản phẩm đề xuất đổi:</span>
                  <span className="font-semibold text-brand-coral text-right max-w-[200px] truncate">
                    {myProperties.find(p => p.id === proposerListingId)?.title || "Sản phẩm của bạn"}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate">Chủ sở hữu đối phương:</span>
                <span className="font-medium text-carbon">{property.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Ngày đề xuất:</span>
                <span className="font-medium text-carbon">{checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Ngày hoàn trả (nếu mượn):</span>
                <span className="font-medium text-carbon">{checkOut}</span>
              </div>
              <div className="border-t border-mist pt-2 mt-2 flex justify-between font-bold text-base text-carbon">
                <span>Giá trị ước tính sản phẩm:</span>
                <span>{estimatedValue.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => navigate("home")}
              className="flex-1 border border-mist hover:bg-fog text-carbon font-semibold py-3 rounded-xl transition cursor-pointer text-center text-xs"
            >
              Tiếp tục khám phá
            </button>
            {currentUser && (
              <button
                onClick={handleOpenChat}
                disabled={isOpeningChat}
                className="flex-1 bg-brand-coral hover:bg-brand-deep text-cloud font-semibold py-3 rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
              >
                {isOpeningChat ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <span>Trò chuyện thương lượng</span>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Heading Titles */}
          <div className="space-y-1 text-left">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-sans font-bold text-carbon tracking-tight leading-tight">
                {property.title}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.class}`}>
                {statusBadge.text}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-carbon font-medium">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-carbon text-carbon" />
                <span>{ownerRating.rating?.toFixed(2) || "4.8"}</span>
                <span className="text-slate font-normal">({ownerRating.count || reviews.length || 0} đánh giá)</span>
              </div>
              <span>•</span>
              <span className="text-slate flex items-center gap-1 font-normal">
                <MapPin className="h-4 w-4 text-slate" /> {property.location}
              </span>
            </div>
          </div>

          {/* Single Image Showcase (Wide horizontal layout) */}
          <div 
            className="relative rounded-[20px] overflow-hidden aspect-[16/9] md:aspect-[2.2/1] w-full bg-pebble cursor-zoom-in border border-mist shadow-md"
            onClick={() => {
              if (property.images && property.images.length > 0) {
                setLightboxImgIndex(0);
                setIsLightboxOpen(true);
              }
            }}
          >
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-101 transition duration-300"
              />
            ) : (
              <div className="w-full h-full bg-fog flex items-center justify-center text-slate font-semibold select-none animate-pulse">
                <div className="text-center space-y-2">
                  <Package className="h-12 w-12 mx-auto text-pebble" />
                  <p className="text-xs">Không có hình ảnh</p>
                </div>
              </div>
            )}
          </div>

          {/* Grid Layout: Details Left, Widgets Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Detailed Info */}
            <div className="lg:col-span-2 space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-mist">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-bold text-carbon">
                    Đăng bởi {property.ownerName}
                  </h2>
                  <p className="text-slate text-sm">
                    {property.categoryName} • Thành viên uy tín
                  </p>
                </div>
                <img
                  src={property.ownerAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                  alt={property.ownerName}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full object-cover border border-mist shadow-xs"
                />
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 pb-3 border-b border-mist">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-slate" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate tracking-wider">Lượt xem</span>
                    <span className="text-sm font-semibold text-carbon">{property.viewCount || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-slate" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate tracking-wider">Yêu thích</span>
                    <span className="text-sm font-semibold text-carbon">{property.favoriteCount || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate tracking-wider">Ngày đăng</span>
                    <span className="text-sm font-semibold text-carbon">
                      {property.createdAt ? new Date(property.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-cloud p-4 rounded-2xl border border-mist shadow-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate tracking-wider">Tình trạng</span>
                  <span className="text-sm font-semibold text-carbon mt-0.5 block">
                    {getConditionText(property.condition)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate tracking-wider">Thương hiệu</span>
                  <span className="text-sm font-semibold text-carbon mt-0.5 block">
                    {property.brand || "Khác (Generic)"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate tracking-wider">Nhu cầu đổi</span>
                  <span className="text-sm font-semibold text-brand-coral mt-0.5 block truncate" title={property.exchangeWish}>
                    {property.exchangeWish || "Đồ dùng tương đương"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate tracking-wider">Tiền bù thêm</span>
                  <span className="text-sm font-semibold text-carbon mt-0.5 block">
                    {property.cashTopUpAmount && property.cashTopUpAmount > 0 
                      ? `${property.cashTopUpAmount.toLocaleString("vi-VN")} đ` 
                      : "Giao dịch ngang giá"}
                  </span>
                </div>
              </div>


              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-3 pb-3 border-b border-mist">
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
              )}

              {/* Reviews */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-carbon flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-carbon text-carbon" />
                  <span>{ownerRating.rating?.toFixed(2) || "4.8"}</span>
                  <span className="text-slate text-xs font-normal">({ownerRating.count || reviews.length || 0} đánh giá)</span>
                </h3>
                {reviews.length > 0 ? (
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
                ) : (
                  <div className="text-slate text-sm italic">Chưa có đánh giá nào cho sản phẩm này.</div>
                )}
              </div>
            </div>

            {/* Right: Reservation/Trade Widget */}
            <div className="h-fit">
              <div className="border border-mist rounded-[20px] bg-cloud p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)] space-y-4 text-left">
                <div className="flex justify-between items-baseline">
                  <p className="text-xl font-bold text-carbon">
                    {estimatedValue.toLocaleString("vi-VN")} đ
                    <span className="text-slate font-normal text-xs">
                      / giá trị ước tính
                    </span>
                  </p>
                  <span className="text-slate text-xs flex items-center gap-1 font-medium">
                    <Star className="h-3.5 w-3.5 fill-carbon text-carbon" />
                    {ownerRating.rating?.toFixed(2) || "4.8"} ({ownerRating.count || reviews.length || 0})
                  </span>
                </div>

                {currentUser && property.ownerId?.toLowerCase() === currentUser.id?.toLowerCase() ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 font-sans">
                    <p className="text-sm font-bold text-emerald-800">Sản phẩm này của bạn</p>
                    <p className="text-xs text-emerald-600 leading-relaxed">
                      Bạn là người đăng sản phẩm này, không thể tự gửi đề xuất trao đổi với chính mình.
                    </p>
                  </div>
                ) : !currentUser ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3 font-sans">
                    <p className="text-xs text-amber-800 font-semibold">Vui lòng đăng nhập để gửi đề xuất trao đổi sản phẩm này.</p>
                    <button
                      type="button"
                      onClick={() => {
                        alert("Vui lòng nhấp vào nút Đăng nhập ở góc trên bên phải trang để tiếp tục.");
                      }}
                      className="w-full bg-brand-coral hover:bg-brand-deep text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer active:scale-95"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hasIncomingExchange ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2 font-sans animate-in fade-in zoom-in-95 duration-200">
                          <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">
                            Bạn đã nhận được đề xuất từ chủ đồ
                          </p>
                          <p className="text-[10px] text-slate leading-relaxed">
                            Chủ sở hữu của sản phẩm này đã gửi một yêu cầu trao đổi sản phẩm này lấy một trong các sản phẩm của bạn. Vui lòng bấm vào nút dưới đây để vào khung chat thương lượng trực tiếp!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleGoToChatForExchange(incomingExchange.id)}
                          disabled={isOpeningChat}
                          className="w-full bg-brand-coral hover:bg-brand-deep text-cloud py-3.5 rounded-xl font-bold transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 text-xs"
                        >
                          {isOpeningChat ? (
                            <>
                              <Loader2 className="h-4.5 w-4.5 animate-spin" />
                              <span>Đang mở khung chat...</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4.5 w-4.5 fill-none" />
                              <span>Nhắn tin thương lượng (Đề xuất nhận được)</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Render a block for each already proposed exchange */}
                        {myExchangesForThisItem.map((ex: any) => {
                          const propListing = properties?.find(p => p.id.toLowerCase() === ex.proposerListingId.toLowerCase());
                          const propTitle = propListing?.title || `Sản phẩm (ID: ${ex.proposerListingId.substring(0,4)})`;
                          
                          return (
                            <div key={ex.id} className="space-y-3 p-4 bg-brand-coral/5 border border-brand-coral/10 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                              <div className="text-center space-y-1.5 font-sans">
                                <p className="text-xs text-brand-coral font-bold uppercase tracking-wider">
                                  Đã đề xuất: {propTitle}
                                </p>
                                <p className="text-[10px] text-slate leading-relaxed">
                                  Đề xuất trao đổi bằng sản phẩm này đang chờ phản hồi. Bạn có thể nhắn tin thương lượng trực tiếp qua khung chat.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleGoToChatForExchange(ex.id)}
                                disabled={isOpeningChat}
                                className="w-full bg-brand-coral hover:bg-brand-deep text-cloud py-3 rounded-xl font-bold transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 text-[11px]"
                              >
                                {isOpeningChat ? (
                                  <>
                                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                                    <span>Đang mở khung chat...</span>
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare className="h-4.5 w-4.5 fill-none" />
                                    <span>Nhắn tin thương lượng ({propTitle})</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}

                        {/* Propose form */}
                        {availableMyProperties.length > 0 ? (
                          <form onSubmit={handleReserve} className="space-y-4 pt-2 border-t border-mist/50 animate-in fade-in duration-200">
                            <div className="space-y-1.5 font-sans">
                              <label className="block text-[10px] font-bold text-carbon uppercase tracking-wider">
                                {hasPendingExchange ? "Gửi thêm đề xuất với vật phẩm khác:" : "Sản phẩm của bạn muốn đổi:"}
                              </label>
                              <select
                                value={proposerListingId}
                                onChange={(e) => setProposerListingId(e.target.value)}
                                className="w-full px-3.5 py-3 rounded-xl border border-mist bg-cloud text-xs font-bold text-carbon outline-none focus:border-brand-coral transition"
                              >
                                {availableMyProperties.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.title} ({p.estimatedValue?.toLocaleString("vi-VN") || p.price?.toLocaleString("vi-VN") || 0} đ)
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full bg-brand-coral hover:bg-brand-deep disabled:bg-slate/30 disabled:cursor-not-allowed text-cloud py-3.5 rounded-xl font-bold transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                                  <span>Đang gửi đề xuất...</span>
                                </>
                              ) : (
                                <>
                                  <CalendarCheck className="h-4.5 w-4.5" />
                                  <span>Gửi đề xuất trao đổi đồ</span>
                                </>
                              )}
                            </button>
                          </form>
                        ) : (
                          // If they have proposed everything, and they have items
                          myProperties.length > 0 ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-1 font-sans animate-in fade-in duration-200">
                              <p className="text-xs text-emerald-800 font-bold">Đã đề xuất tất cả sản phẩm của bạn</p>
                              <p className="text-[10px] text-slate leading-relaxed">
                                Bạn đã gửi đề xuất bằng tất cả {myProperties.length} sản phẩm của mình cho bài đăng này.
                              </p>
                            </div>
                          ) : (
                            // If they don't have any items at all
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3 font-sans animate-in fade-in duration-200">
                              <p className="text-xs text-rose-800 font-bold">Bạn chưa đăng sản phẩm nào để đem đi trao đổi.</p>
                              <p className="text-[11px] text-rose-600 leading-relaxed">
                                Hệ thống yêu cầu bạn có ít nhất một sản phẩm đã đăng để đề xuất đổi đồ.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  alert("Vui lòng nhấp vào nút 'Đăng tin mới' trên thanh menu để đăng sản phẩm của bạn.");
                                }}
                                className="w-full bg-brand-coral hover:bg-brand-deep text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer active:scale-95"
                              >
                                Đăng sản phẩm mới ngay
                              </button>
                            </div>
                          )
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Lightbox Gallery Modal Overlay */}
      {isLightboxOpen && property.images && property.images.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-6 left-6 text-white/80 font-bold text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
            {lightboxImgIndex + 1} / {property.images.length}
          </div>

          {/* Main Lightbox Content Area */}
          <div className="relative w-full max-w-5xl px-16 flex items-center justify-center gap-4">
            {/* Prev Arrow */}
            {property.images.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-4 p-4 bg-black/60 hover:bg-black/90 hover:scale-105 border border-white/20 text-white rounded-full transition cursor-pointer shadow-lg active:scale-95 z-10"
                title="Previous Image"
              >
                <ChevronLeft className="h-6 w-6 stroke-[3]" />
              </button>
            )}

            {/* Displaying Image */}
            <div className="relative max-h-[75vh] flex items-center justify-center overflow-hidden">
              <img
                src={property.images[lightboxImgIndex]}
                alt={`${property.title} lightbox`}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Next Arrow */}
            {property.images.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 p-4 bg-black/60 hover:bg-black/90 hover:scale-105 border border-white/20 text-white rounded-full transition cursor-pointer shadow-lg active:scale-95 z-10"
                title="Next Image"
              >
                <ChevronRight className="h-6 w-6 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Thumbnail strip at bottom */}
          {property.images.length > 1 && (
            <div className="absolute bottom-6 flex gap-3 overflow-x-auto max-w-full px-6 py-2 bg-black/30 backdrop-blur-xs rounded-2xl border border-white/5 scrollbar-thin">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImgIndex(idx);
                  }}
                  className={`h-12 w-16 rounded-lg overflow-hidden transition cursor-pointer shrink-0 border-2 ${
                    lightboxImgIndex === idx ? "border-brand-coral scale-105" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt="thumbnail"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report User Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-[420px] bg-white border border-mist shadow-2xl rounded-3xl p-6 space-y-4 text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-mist">
              <h3 className="font-bold text-base text-carbon flex items-center gap-2">
                <Flag className="h-4.5 w-4.5 text-brand-coral fill-brand-coral/10" />
                <span>Báo cáo người dùng</span>
              </h3>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate hover:text-carbon p-1 rounded-full hover:bg-fog transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate uppercase tracking-wider block">Lý do báo cáo *</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-mist rounded-xl px-3 py-2.5 text-xs text-carbon font-semibold outline-none focus:border-brand-coral transition"
                >
                  <option value="Spam">Spam / Tin rác</option>
                  <option value="FakeListing">Tin đăng giả mạo / Lừa đảo</option>
                  <option value="Abusive">Nội dung không phù hợp / Xúc phạm</option>
                  <option value="Harassment">Quấy rối / Đe dọa</option>
                  <option value="Other">Lý do khác</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate uppercase tracking-wider block font-sans">Chi tiết báo cáo *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Vui lòng cung cấp thêm chi tiết để Swaply kiểm duyệt chính xác nhất..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-mist rounded-xl px-4 py-3 text-xs text-carbon outline-none focus:border-brand-coral transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 border border-mist hover:bg-fog text-slate py-3 rounded-xl transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex-1 bg-brand-coral hover:bg-brand-deep text-cloud py-3 rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingReport ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <span>Gửi báo cáo</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
