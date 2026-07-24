import React, { useState, useEffect, useMemo } from "react";
import Header from "@shared/components/Header";
import HostFormModal from "@features/listings/components/HostFormModal";
import AuthModal from "@features/auth/components/AuthModal";
import { RouterProvider, useRouter } from "@shared/context/RouterContext";
import { useAuth } from "@features/auth/hooks/useAuth";
import { useExchange } from "@features/exchange/hooks/useExchange";
import { apiClient } from "@shared/api/apiClient";
import { Category, Property } from "@/types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "@shared/components/Loader";
import ConfirmModal from "@shared/components/ConfirmModal";
import ReviewModal from "@shared/components/ReviewModal";

// Page mounts
import HomePage from "@/pages/HomePage";
import ListingDetailPage from "@/pages/ListingDetailPage";
import ChatPage from "@/pages/ChatPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";

function AppContent() {
  const { page, selectedProperty, activeDashboardTab, navigate } = useRouter();
  const {
    currentUser,
    togglePremium,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    requestOtp,
    updateProfile,
    updateAvatar,
    isLoading: authLoading,
  } = useAuth();
  const { bookings, createProposal, cancelProposal } = useExchange();

  const [properties, setProperties] = useState<Property[]>([]);
  const [myListings, setMyListings] = useState<Property[]>([]);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isHostFormOpen, setIsHostFormOpen] = useState(false);

  // Reusable custom Confirm Modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [reviewState, setReviewState] = useState<{
    isOpen: boolean;
    exchangeId: string;
    revieweeId: string;
    revieweeName: string;
  }>({
    isOpen: false,
    exchangeId: "",
    revieweeId: "",
    revieweeName: "",
  });

  const [reviewedExchangeIds, setReviewedExchangeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadReviewedExchanges = async () => {
      if (!currentUser) {
        setReviewedExchangeIds(new Set());
        return;
      }
      try {
        const list = await apiClient.fetchMyGivenReviews();
        const ids = new Set(list.map((r: any) => r.exchangeId).filter(Boolean));
        setReviewedExchangeIds(ids);
      } catch (e) {
        console.warn("Could not load reviewed exchanges:", e);
      }
    };
    loadReviewedExchanges();
  }, [currentUser]);

  const triggerConfirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
    confirmText?: string;
    cancelText?: string;
  }) => {
    setConfirmState({
      isOpen: true,
      ...options,
    });
  };

  const categories = useMemo(() => {
    const list: Category[] = [];
    const seen = new Set<string>();

    const addCategory = (cat?: Category | null) => {
      if (!cat?.name) return;
      const key = cat.name.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          id: cat.id || key,
          name: cat.name,
        });
      }
    };

    apiCategories.forEach(addCategory);

    properties.forEach((p) => {
      addCategory({
        id: p.categoryId || p.id,
        name: p.category,
      });
    });

    try {
      const stored = localStorage.getItem("swaply_custom_categories");
      if (stored) {
        const customs = JSON.parse(stored);
        if (Array.isArray(customs)) {
          customs.forEach((c) => addCategory(c));
        }
      }
    } catch {
      // ignore
    }

    return list;
  }, [properties, apiCategories]);

  // Auth Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<
    "login" | "register" | "forgot-password"
  >("login");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<{
    location: string;
    guests: number;
  }>({
    location: "",
    guests: 1,
  });

  const [activeProfileTab, setActiveProfileTab] = useState<
    "trips" | "wishlist" | "host" | "received"
  >("trips");

  // Sync activeDashboardTab with profile page tab
  useEffect(() => {
    if (activeDashboardTab) {
      setActiveProfileTab(activeDashboardTab);
    }
  }, [activeDashboardTab]);

  const loadData = async () => {
    const [props, fetchedCategories, wish] = await Promise.all([
      apiClient.fetchProperties(),
      apiClient.fetchCategories(),
      apiClient.fetchWishlist(),
    ]);

    setProperties(props);
    setApiCategories(fetchedCategories);
    setWishlist(wish);
  };

  const loadMyListings = async () => {
    if (!currentUser) {
      setMyListings([]);
      return;
    }
    try {
      const myProps = await apiClient.fetchMyListings();
      setMyListings(myProps);
    } catch (err) {
      console.error("Failed to load my listings:", err);
      setMyListings([]);
    }
  };

  // Load my listings when user changes
  useEffect(() => {
    loadMyListings();
  }, [currentUser]);

  useEffect(() => {
    const checkExpiredParam = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("session_expired") === "true") {
        toast.warn("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        const newSearch = window.location.search.replace(/[?&]session_expired=true/, "").replace(/^\?$/, "");
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
        window.history.replaceState({}, "", newUrl || "/");
      }
    };
    checkExpiredParam();

    const handlePaymentRedirect = async () => {
      const path = window.location.pathname;
      if (path.includes("/payment/result")) {
        const queryParams = window.location.search;
        const ref = new URLSearchParams(queryParams).get("ref");
        if (ref) {
          try {
            // Process the VNPAY return query string using paymentApi
            await apiClient.fetchPaymentReturn(queryParams.replace(/^\?/, ""));
            toast.success("Thanh toán thành công! Gói Premium của bạn đã được kích hoạt.");
          } catch (e: any) {
            console.error("Error processing payment return:", e);
            toast.error("Xử lý kết quả thanh toán thất bại.");
          } finally {
            // Redirect to profile and clean up address bar URL
            window.history.replaceState({}, "", "/profile");
            navigate("profile");
          }
        }
      }
    };
    handlePaymentRedirect();
    loadData();
  }, []);

  const [newVersionAvailable, setNewVersionAvailable] = useState(false);

  // Lắng nghe sự kiện kết nối mạng (Online/Offline)
  useEffect(() => {
    const handleOnline = () => {
      toast.dismiss("offline-toast");
      toast.success("Đã khôi phục kết nối mạng! Đang tự động làm mới dữ liệu...");
      loadData();
      loadMyListings();
    };

    const handleOffline = () => {
      toast.error("Mất kết nối mạng! Bạn đang sử dụng chế độ Offline.", {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        toastId: "offline-toast"
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Đồng bộ phiên đăng nhập giữa các Tab/Cửa sổ khác nhau (Cross-tab Session Sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "swaply_current_user") {
        window.location.reload();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleWishlistToggle = async (id: string) => {
    const updated = await apiClient.toggleWishlist(id);
    setWishlist(updated);
  };

  const handleCreateListing = async (newProp: Property) => {
    await apiClient.createProperty(newProp);
    await loadData();
    await loadMyListings();
  };

  const handleDeleteProperty = async (id: string) => {
    triggerConfirm({
      title: "Xóa bài đăng sản phẩm",
      message: "Bạn có chắc chắn muốn xóa bài đăng sản phẩm này không? Hành động này không thể hoàn tác và sẽ gỡ bỏ vĩnh viễn tin đăng.",
      type: "danger",
      confirmText: "Xóa ngay",
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          await apiClient.deleteProperty(id);
          await loadData();
          await loadMyListings();
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  const handleResetAll = () => {
    triggerConfirm({
      title: "Đặt lại dữ liệu",
      message: "Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu mẫu không? Mọi lịch sử và bài đăng sẽ được phục hồi về trạng thái ban đầu.",
      type: "danger",
      confirmText: "Đặt lại",
      onConfirm: () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        localStorage.clear();
        window.location.reload();
      },
    });
  };

  const renderActivePage = () => {
    switch (page) {
      case "home":
        return (
          <HomePage
            properties={properties}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchFilters={searchFilters}
            setSearchFilters={setSearchFilters}
            wishlist={wishlist}
            handleWishlistToggle={handleWishlistToggle}
            onSelectProperty={(prop) => navigate("detail", prop)}
          />
        );
      case "detail":
        return selectedProperty ? (
          <ListingDetailPage
            property={selectedProperty}
            isWishlisted={wishlist.includes(selectedProperty.id)}
            onWishlistToggle={() => handleWishlistToggle(selectedProperty.id)}
            onBook={createProposal}
            currentUser={currentUser}
            properties={properties}
          />
        ) : (
          <div className="py-20 text-center text-slate">
            Không tìm thấy thông tin sản phẩm.
          </div>
        );
      case "chat":
        return currentUser ? (
          <ChatPage currentUser={currentUser} />
        ) : (
          <div className="py-32 px-6 text-center flex flex-col items-center justify-center gap-4 bg-cloud border border-mist rounded-2xl max-w-lg mx-auto my-12 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <p className="text-carbon text-sm font-semibold">
              Vui lòng đăng nhập để sử dụng tính năng nhắn tin.
            </p>
            <p className="text-slate text-xs max-w-sm">
              Trao đổi tin nhắn trực tiếp với chủ sở hữu sản phẩm để thương
              lượng và thực hiện trao đổi nhanh chóng.
            </p>
            <button
              onClick={() => {
                setAuthTab("login");
                setIsAuthOpen(true);
              }}
              className="mt-2 px-6 py-2.5 bg-brand-coral hover:bg-brand-deep text-white rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md"
            >
              Đăng nhập ngay
            </button>
          </div>
        );
      case "profile":
        return currentUser ? (
          <ProfilePage
            currentUser={currentUser}
            onUpdateProfile={updateProfile}
            onUpdateAvatar={updateAvatar}
            togglePremium={togglePremium}
            activeTab={activeProfileTab}
            setActiveTab={setActiveProfileTab}
            bookings={bookings}
            wishlistedProperties={properties.filter((p) =>
              wishlist.includes(p.id),
            )}
            hostProperties={myListings.length > 0 ? myListings : properties.filter((p) =>
              p.id.startsWith("custom-") || (currentUser && p.ownerId === currentUser.id),
            )}
            onCancelBooking={cancelProposal}
            onRemoveWishlist={handleWishlistToggle}
            onDeleteHostProperty={handleDeleteProperty}
            onSelectProperty={(prop) => navigate("detail", prop)}
            properties={properties}
            onGoToChat={async (exchangeId) => {
              try {
                const exchange = await apiClient.fetchExchangeById(exchangeId);
                if (exchange) {
                  const targetListingId = exchange.receiverListingId;
                  const otherUserId = exchange.proposerId.toLowerCase() === currentUser.id.toLowerCase() ? exchange.receiverId : exchange.proposerId;
                  const conversation = await apiClient.createConversation({
                    otherUserId,
                    relatedListingId: targetListingId,
                    relatedExchangeId: exchangeId
                  });
                  if (conversation) {
                    sessionStorage.setItem("swaply_active_conversation_id", conversation.id);
                    navigate("chat");
                  } else {
                    toast.error("Không thể mở cuộc trò chuyện.");
                  }
                }
              } catch (e: any) {
                toast.error(e.message || "Tạo cuộc trò chuyện thất bại.");
              }
            }}
            onCompleteExchange={async (exchangeId) => {
              try {
                await apiClient.completeExchange(exchangeId);
                toast.success("Chúc mừng! Đã hoàn tất giao dịch trao đổi.");
                // Reload current page to update status visual immediately
                window.location.reload();
              } catch (e: any) {
                toast.error(e.message || "Hoàn tất trao đổi thất bại.");
              }
            }}
            onOpenReviewModal={(exchangeId, partnerName, partnerId) => {
              setReviewState({
                isOpen: true,
                exchangeId,
                revieweeId: partnerId,
                revieweeName: partnerName
              });
            }}
            reviewedExchangeIds={reviewedExchangeIds}
          />
        ) : (
          <div className="py-32 px-6 text-center flex flex-col items-center justify-center gap-4 bg-cloud border border-mist rounded-2xl max-w-lg mx-auto my-12 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <p className="text-carbon text-sm font-semibold">
              Vui lòng đăng nhập để xem thông tin cá nhân.
            </p>
            <p className="text-slate text-xs max-w-sm">
              Quản lý giao dịch trao đổi, danh sách yêu thích và các bài đăng
              sản phẩm của bạn.
            </p>
            <button
              onClick={() => {
                setAuthTab("login");
                setIsAuthOpen(true);
              }}
              className="mt-2 px-6 py-2.5 bg-brand-coral hover:bg-brand-deep text-white rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md"
            >
              Đăng nhập ngay
            </button>
          </div>
        );
      default:
        return (
          <HomePage
            properties={properties}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchFilters={searchFilters}
            setSearchFilters={setSearchFilters}
            wishlist={wishlist}
            handleWishlistToggle={handleWishlistToggle}
            onSelectProperty={(prop) => navigate("detail", prop)}
          />
        );
    }
  };

  if (page === "admin") {
    return <AdminPage properties={properties} onReloadData={loadData} />;
  }

  return (
    <div className="min-h-screen bg-fog text-carbon font-sans flex flex-col selection:bg-brand-coral/20 select-none">

      {/* Sticky Global Top Header */}
      <Header
        onSearch={(filters) => {
          setSearchFilters({
            location: filters.location,
            guests: filters.guests,
          });
          setSelectedCategory(filters.category);
          navigate("home");
        }}
        onOpenHostForm={() => {
          if (!currentUser) {
            setAuthTab("login");
            setIsAuthOpen(true);
          } else {
            setIsHostFormOpen(true);
          }
        }}
        onOpenDashboard={(tab) => {
          if (!currentUser) {
            setAuthTab("login");
            setIsAuthOpen(true);
          } else {
            navigate("profile", null, tab);
          }
        }}
        activeDashboardTab={page === "profile" ? activeProfileTab : null}
        resetAll={handleResetAll}
        currentUser={currentUser}
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setIsAuthOpen(true);
        }}
        onLogout={logout}
      />

      {/* Dynamic routing page renderer */}
      {renderActivePage()}

      {/* Reusable Confirm Dialog */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewState.isOpen}
        exchangeId={reviewState.exchangeId}
        revieweeId={reviewState.revieweeId}
        revieweeName={reviewState.revieweeName}
        onClose={() => setReviewState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={async (dto) => {
          try {
            await apiClient.createExchangeReview(dto);
            toast.success("Gửi đánh giá thành công! Cảm ơn bạn.");
            setReviewedExchangeIds((prev) => new Set([...prev, dto.exchangeId]));
          } catch (e: any) {
            toast.error(e.message || "Gửi đánh giá thất bại.");
            throw e;
          }
        }}
      />

      {/* Footer Area: Multi-Column Link Grid */}
      <footer className="bg-fog border-t border-mist py-10 px-6 md:px-12 xl:px-24 text-left mt-auto">
        <div className="max-w-[1760px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-mist">
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon">
              Hỗ trợ
            </h4>
            <ul className="space-y-2 text-xs text-slate font-medium">
              <li>
                <a href="#" className="hover:underline">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Bảo đảm an toàn
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Quy trình giao dịch
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon">
              Trao đổi
            </h4>
            <ul className="space-y-2 text-xs text-slate font-medium">
              <li>
                <a href="#" className="hover:underline">
                  Đăng tin đổi đồ trên SWAPLY
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Gói đẩy bài Premium
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Tài nguyên trao đổi
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Quy tắc cộng đồng
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon">
              SWAPLY
            </h4>
            <ul className="space-y-2 text-xs text-slate font-medium">
              <li>
                <a href="#" className="hover:underline">
                  Giới thiệu về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Tính năng mới
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Tuyển dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Nhà đầu tư
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon font-sans">
              Kiến trúc hệ thống
            </h4>
            <div className="text-xs text-slate font-sans leading-relaxed">
              <p>
                Hệ thống được thiết kế tối ưu theo mô hình{" "}
                <strong className="text-brand-coral">
                  Smart Barter Marketplace
                </strong>
                .
              </p>
              <p className="mt-2 text-[11px] font-mono">
                React 19 + Vite + Tailwind v4
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1760px] mx-auto pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate gap-4 font-medium">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2026 SWAPLY Marketplace, Inc.</span>
            <span>·</span>
            <a href="#" className="hover:underline">
              Bảo mật
            </a>
            <span>·</span>
            <a href="#" className="hover:underline">
              Điều khoản
            </a>
            <span>·</span>
            <a href="#" className="hover:underline">
              Sơ đồ trang
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">
              Tiếng Việt (VN)
            </span>
            <span className="hover:underline cursor-pointer">đ VNĐ</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isHostFormOpen && (
        <HostFormModal
          onClose={() => setIsHostFormOpen(false)}
          onSubmit={handleCreateListing}
          categories={apiCategories.length > 0 ? apiCategories : [{ id: "00000000-0000-0000-0000-000000000000", name: "Danh mục khác" }]}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
        onLogin={login}
        onRegister={register}
        onForgotPassword={forgotPassword}
        onResetPassword={resetPassword}
        onRequestOtp={requestOtp}
        isLoading={authLoading}
      />
      {authLoading && <Loader message="Đang xử lý thông tin..." />}
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
      <ToastContainer position="top-right" autoClose={2000} />
    </RouterProvider>
  );
}
