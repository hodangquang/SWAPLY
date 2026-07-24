import React, { useState } from "react";
import { Search, Globe, Menu, Sparkles, MapPin, Calendar, Users, X, Heart, ClipboardList, User, MessageCircle, MessageSquare } from "lucide-react";
import { UserSession } from "../../features/auth/hooks/useAuth";
import { toast } from "react-toastify";
import { useRouter } from "../../shared/context/RouterContext";

interface HeaderProps {
  onSearch: (filters: { location: string; guests: number; category: string | null }) => void;
  onOpenHostForm: () => void;
  onOpenDashboard: (tab: "trips" | "wishlist" | "host") => void;
  activeDashboardTab: string | null;
  resetAll: () => void;
  currentUser: UserSession | null;
  onOpenAuth: (tab: "login" | "register") => void;
  onLogout: () => void;
}

export default function Header({
  onSearch,
  onOpenHostForm,
  onOpenDashboard,
  resetAll,
  currentUser,
  onOpenAuth,
  onLogout
}: HeaderProps) {
  const { navigate } = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const handleLanguageToggle = () => {
    const currentLang = localStorage.getItem("swaply_lang") || "vi";
    const nextLang = currentLang === "vi" ? "en" : "vi";
    localStorage.setItem("swaply_lang", nextLang);

    if (nextLang === "en") {
      toast.success("Switched language to English! Reloading...");
    } else {
      toast.success("Đã chuyển ngôn ngữ sang Tiếng Việt! Đang tải lại...");
    }

    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  // Search inputs
  const [searchLocation, setSearchLocation] = useState("");
  const [searchGuests, setSearchGuests] = useState(1);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location: searchLocation,
      guests: searchGuests,
      category: null // clear category filter to search worldwide
    });
    setSearchDropdownOpen(false);
  };

  const handleClearSearch = () => {
    setSearchLocation("");
    setSearchGuests(1);
    onSearch({ location: "", guests: 1, category: null });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-mist bg-cloud px-6 md:px-12 xl:px-24 h-24 flex items-center justify-between transition-all duration-300">
      {/* Left: Logo */}
      <div
        id="logo-container"
        onClick={handleClearSearch}
        className="flex items-center gap-2 cursor-pointer text-brand-coral select-none hover:opacity-90 active:scale-95 transition"
      >
        <div className="h-9 w-9 bg-brand-coral rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-extrabold text-lg">S</span>
        </div>
        <span className="font-sans font-black tracking-tight text-2xl hidden md:inline select-none text-carbon">
          SWAPLY
        </span>
      </div>

      {/* Center: Interactive Search Bar */}
      <div className="relative" id="main-search-bar">
        <div
          onClick={() => setSearchDropdownOpen(!searchDropdownOpen)}
          className="flex items-center bg-cloud border border-mist hover:shadow-md transition-shadow cursor-pointer py-2 pl-6 pr-2 rounded-[20px] select-none h-12 md:h-14 w-[280px] sm:w-[360px] md:w-[460px] justify-between shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center justify-between w-full pr-2 text-sm">
            <div className="flex-1 text-left border-r border-mist pr-2">
              <p className="font-semibold text-[11px] text-carbon tracking-[0.44px] uppercase">
                Sản phẩm
              </p>
              <p className="text-slate text-xs truncate max-w-[100px] md:max-w-[120px]">
                {searchLocation || "Tìm đồ cần đổi..."}
              </p>
            </div>
            <div className="flex-1 text-left border-r border-mist px-3 hidden sm:block">
              <p className="font-semibold text-[11px] text-carbon tracking-[0.44px] uppercase">
                Tình trạng
              </p>
              <p className="text-slate text-xs truncate">
                Mọi tình trạng
              </p>
            </div>
            <div className="flex-1 text-left pl-3">
              <p className="font-semibold text-[11px] text-carbon tracking-[0.44px] uppercase">
                Bù thêm
              </p>
              <p className="text-slate text-xs truncate max-w-[70px]">
                {searchGuests > 1 ? `< ${searchGuests * 500}k` : "Bất kỳ"}
              </p>
            </div>
          </div>
          <button className="flex items-center justify-center h-10 w-10 bg-brand-coral hover:bg-brand-deep text-cloud rounded-full transition duration-200 shrink-0">
            <Search className="h-4 w-4 stroke-[3px]" />
          </button>
        </div>

        {/* Search Dropdown Panel */}
        {searchDropdownOpen && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[340px] md:w-[420px] bg-cloud border border-mist shadow-[0_4px_24px_rgba(0,0,0,0.15)] rounded-2xl p-5 z-50">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-mist">
                <span className="font-semibold text-carbon text-sm">Tìm kiếm đồ dùng trên SWAPLY</span>
                <button
                  type="button"
                  onClick={() => setSearchDropdownOpen(false)}
                  className="p-1 text-slate hover:text-carbon hover:bg-fog rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Location Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-brand-coral" /> Khu vực giao dịch
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cầu Giấy, Đống Đa, Hà Nội..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full border border-mist rounded-lg px-3 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral"
                />
              </div>

              {/* Date Simulation Notice */}
              <div className="flex items-center gap-3 bg-fog p-3 rounded-xl border border-mist text-xs text-slate">
                <Calendar className="h-4 w-4 shrink-0 text-slate" />
                <span>Tìm kiếm đồ dùng dễ dàng, kết nối đàm phán trực tuyến để trao đổi nhanh gọn.</span>
              </div>

              {/* Guests Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate flex items-center gap-1">
                  <Users className="h-3 w-3 text-brand-coral" /> Khoản tiền bù tối đa
                </label>
                <div className="flex items-center justify-between border border-mist rounded-lg px-3 py-1 bg-cloud">
                  <span className="text-sm text-carbon">Dưới {searchGuests * 500}.000 VNĐ</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={searchGuests <= 1}
                      onClick={() => setSearchGuests(g => Math.max(1, g - 1))}
                      className="h-7 w-7 border border-mist hover:border-slate hover:bg-fog flex items-center justify-center rounded-full text-carbon disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchGuests(g => Math.min(10, g + 1))}
                      className="h-7 w-7 border border-mist hover:border-slate hover:bg-fog flex items-center justify-center rounded-full text-carbon transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="flex-1 border border-mist text-slate hover:bg-fog font-medium py-2 rounded-lg text-sm transition"
                >
                  Xóa bộ lọc
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-coral hover:bg-brand-deep text-cloud font-medium py-2 rounded-lg text-sm transition"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Right: Actions Menu */}
      <div className="flex items-center gap-2 md:gap-4 relative" id="actions-navigation">
        <button
          onClick={onOpenHostForm}
          className="font-sans font-semibold text-carbon hover:bg-fog py-2 px-4 rounded-lg text-sm select-none transition cursor-pointer hidden lg:inline-block"
        >
          Đăng bài đổi đồ
        </button>
        <button
          onClick={handleLanguageToggle}
          className="h-9 w-9 hover:bg-fog rounded-full flex items-center justify-center text-carbon transition cursor-pointer hidden md:flex"
          title="Đổi ngôn ngữ / Change Language"
        >
          <Globe className="h-[18px] w-[18px] stroke-[1.5]" />
        </button>
        {currentUser && (
          <button
            onClick={() => navigate("chat")}
            className="h-9 w-9 hover:bg-fog rounded-full flex items-center justify-center text-carbon transition cursor-pointer"
            title="Tin nhắn / Hộp thư"
          >
            <MessageCircle className="h-[18px] w-[18px] stroke-[1.5]" />
          </button>
        )}

        {/* Profile Hamburger menu button */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 border border-mist hover:shadow-md transition-shadow cursor-pointer px-3 py-1.5 rounded-full select-none bg-cloud animate-in duration-200"
          >
            <Menu className="h-[16px] w-[16px] stroke-[2] text-carbon" />
            {currentUser ? (
              currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover shadow-sm"
                />
              ) : (
                <div className="h-8 w-8 bg-brand-coral text-white rounded-full flex items-center justify-center font-bold text-xs select-none shadow-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )
            ) : (
              <div className="h-8 w-8 bg-slate/15 text-slate rounded-full flex items-center justify-center select-none">
                <User className="h-4 w-4" />
              </div>
            )}
          </button>

          {/* Profile Dropdown Panel */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-11 w-64 bg-cloud border border-mist shadow-[0_4px_18px_rgba(0,0,0,0.12)] rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {currentUser ? (
                <>
                  <div className="px-4 py-2.5 border-b border-mist">
                    <p className="font-semibold text-carbon text-sm">Chào, {currentUser.name}!</p>
                    <p className="text-xs text-slate truncate font-medium">{currentUser.email}</p>
                    {currentUser.isPremium && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-md text-[9px] font-extrabold uppercase tracking-wider">
                        Premium Member
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenDashboard("trips");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition flex items-center gap-2 font-medium"
                  >
                    <User className="h-4 w-4 text-slate" />
                    Trang cá nhân
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("chat");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition flex items-center gap-2 font-medium"
                  >
                    <MessageSquare className="h-4 w-4 text-slate" />
                    Tin nhắn của tôi
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenDashboard("trips");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition flex items-center gap-2 font-medium"
                  >
                    <ClipboardList className="h-4 w-4 text-slate" />
                    Giao dịch của tôi
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenDashboard("wishlist");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition flex items-center gap-2 font-medium"
                  >
                    <Heart className="h-4 w-4 text-brand-coral fill-brand-coral" />
                    Danh sách yêu thích
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenDashboard("host");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition flex items-center gap-2 font-medium"
                  >
                    <Sparkles className="h-4 w-4 text-brand-coral" />
                    Bài đăng của tôi
                  </button>

                  <div className="border-t border-mist my-1"></div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenHostForm();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition font-medium"
                  >
                    Đăng bài trao đổi mới
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-brand-coral hover:bg-fog transition font-semibold border-t border-mist mt-1"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenAuth("register");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition font-semibold"
                  >
                    Đăng ký tài khoản
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenAuth("login");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate hover:bg-fog hover:text-carbon transition font-medium"
                  >
                    Đăng nhập
                  </button>

                  <div className="border-t border-mist my-1"></div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenAuth("login");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate hover:bg-fog hover:text-carbon transition font-medium"
                  >
                    Đăng bài trao đổi mới
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  resetAll();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate hover:bg-fog hover:text-carbon transition border-t border-mist/50 mt-1"
              >
                Đặt lại toàn bộ dữ liệu
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
