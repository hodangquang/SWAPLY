import React, { useState, useEffect } from "react";
import Header from "@shared/components/Header";
import HostFormModal from "@features/listings/components/HostFormModal";
import { RouterProvider, useRouter } from "@shared/context/RouterContext";
import { useAuth } from "@features/auth/hooks/useAuth";
import { useExchange } from "@features/exchange/hooks/useExchange";
import { apiClient } from "@shared/api/apiClient";
import { Property } from "@/types";

// Page mounts
import HomePage from "@/pages/HomePage";
import ListingDetailPage from "@/pages/ListingDetailPage";
import ChatPage from "@/pages/ChatPage";
import ProfilePage from "@/pages/ProfilePage";

function AppContent() {
  const { page, selectedProperty, activeDashboardTab, navigate } = useRouter();
  const { currentUser, togglePremium } = useAuth();
  const { bookings, createProposal, cancelProposal } = useExchange();

  const [properties, setProperties] = useState<Property[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isHostFormOpen, setIsHostFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<{ location: string; guests: number }>({
    location: "",
    guests: 1
  });

  const [activeProfileTab, setActiveProfileTab] = useState<"trips" | "wishlist" | "host">("trips");

  // Sync activeDashboardTab with profile page tab
  useEffect(() => {
    if (activeDashboardTab) {
      setActiveProfileTab(activeDashboardTab);
    }
  }, [activeDashboardTab]);

  const loadData = async () => {
    const props = await apiClient.fetchProperties();
    setProperties(props);
    const wish = await apiClient.fetchWishlist();
    setWishlist(wish);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWishlistToggle = async (id: string) => {
    const updated = await apiClient.toggleWishlist(id);
    setWishlist(updated);
  };

  const handleCreateListing = async (newProp: Property) => {
    await apiClient.createProperty(newProp);
    await loadData();
    setIsHostFormOpen(false);
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng sản phẩm này không?")) {
      await apiClient.deleteProperty(id);
      await loadData();
    }
  };

  const handleResetAll = () => {
    if (window.confirm("Bạn có muốn đặt lại toàn bộ dữ liệu mẫu không?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderActivePage = () => {
    switch (page) {
      case "home":
        return (
          <HomePage
            properties={properties}
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
          />
        ) : (
          <div className="py-20 text-center text-slate">Không tìm thấy thông tin sản phẩm.</div>
        );
      case "chat":
        return currentUser ? (
          <ChatPage currentUser={currentUser} />
        ) : (
          <div className="py-20 text-center text-slate">Vui lòng đăng nhập để sử dụng tính năng nhắn tin.</div>
        );
      case "profile":
        return currentUser ? (
          <ProfilePage
            currentUser={currentUser}
            togglePremium={togglePremium}
            activeTab={activeProfileTab}
            setActiveTab={setActiveProfileTab}
            bookings={bookings}
            wishlistedProperties={properties.filter((p) => wishlist.includes(p.id))}
            hostProperties={properties.filter((p) => p.id.startsWith("custom-"))}
            onCancelBooking={cancelProposal}
            onRemoveWishlist={handleWishlistToggle}
            onDeleteHostProperty={handleDeleteProperty}
            onSelectProperty={(prop) => navigate("detail", prop)}
          />
        ) : (
          <div className="py-20 text-center text-slate">Vui lòng đăng nhập.</div>
        );
      default:
        return (
          <HomePage
            properties={properties}
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

  return (
    <div className="min-h-screen bg-fog text-carbon font-sans flex flex-col selection:bg-brand-coral/20 select-none">
      {/* Sticky Global Top Header */}
      <Header
        onSearch={(filters) => {
          setSearchFilters({ location: filters.location, guests: filters.guests });
          setSelectedCategory(filters.category);
          navigate("home");
        }}
        onOpenHostForm={() => setIsHostFormOpen(true)}
        onOpenDashboard={(tab) => {
          navigate("profile", null, tab);
        }}
        activeDashboardTab={page === "profile" ? activeProfileTab : null}
        resetAll={handleResetAll}
      />

      {/* Dynamic routing page renderer */}
      {renderActivePage()}

      {/* Footer Area: Multi-Column Link Grid */}
      <footer className="bg-fog border-t border-mist py-10 px-6 md:px-12 xl:px-24 text-left mt-auto">
        <div className="max-w-[1760px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-mist">
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon">Hỗ trợ</h4>
            <ul className="space-y-2 text-xs text-slate font-medium">
              <li><a href="#" className="hover:underline">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:underline">Bảo đảm an toàn</a></li>
              <li><a href="#" className="hover:underline">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:underline">Quy trình giao dịch</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon">Trao đổi</h4>
            <ul className="space-y-2 text-xs text-slate font-medium">
              <li><a href="#" className="hover:underline">Đăng tin đổi đồ trên SWAPLY</a></li>
              <li><a href="#" className="hover:underline">Gói đẩy bài Premium</a></li>
              <li><a href="#" className="hover:underline">Tài nguyên trao đổi</a></li>
              <li><a href="#" className="hover:underline">Quy tắc cộng đồng</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon">SWAPLY</h4>
            <ul className="space-y-2 text-xs text-slate font-medium">
              <li><a href="#" className="hover:underline">Giới thiệu về chúng tôi</a></li>
              <li><a href="#" className="hover:underline">Tính năng mới</a></li>
              <li><a href="#" className="hover:underline">Tuyển dụng</a></li>
              <li><a href="#" className="hover:underline">Nhà đầu tư</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon font-sans">Kiến trúc hệ thống</h4>
            <div className="text-xs text-slate font-sans leading-relaxed">
              <p>Hệ thống được thiết kế tối ưu theo mô hình <strong className="text-brand-coral">Smart Barter Marketplace</strong>.</p>
              <p className="mt-2 text-[11px] font-mono">React 19 + Vite + Tailwind v4</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1760px] mx-auto pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate gap-4 font-medium">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2026 SWAPLY Marketplace, Inc.</span>
            <span>·</span>
            <a href="#" className="hover:underline">Bảo mật</a>
            <span>·</span>
            <a href="#" className="hover:underline">Điều khoản</a>
            <span>·</span>
            <a href="#" className="hover:underline">Sơ đồ trang</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Tiếng Việt (VN)</span>
            <span className="hover:underline cursor-pointer">đ VNĐ</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isHostFormOpen && (
        <HostFormModal
          onClose={() => setIsHostFormOpen(false)}
          onSubmit={handleCreateListing}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
