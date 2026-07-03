import React, { useMemo } from "react";
import { Compass, Palmtree, Home, Castle, Sparkles, Camera, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Property } from "@/types";
import { CATEGORIES_LIST } from "@/data";
import ListingCard from "@features/listings/components/ListingCard";

interface HomePageProps {
  properties: Property[];
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  searchFilters: { location: string; guests: number };
  setSearchFilters: React.Dispatch<React.SetStateAction<{ location: string; guests: number }>>;
  wishlist: string[];
  handleWishlistToggle: (id: string) => void;
  onSelectProperty: (prop: Property) => void;
}

export default function HomePage({
  properties,
  selectedCategory,
  setSelectedCategory,
  searchFilters,
  setSearchFilters,
  wishlist,
  handleWishlistToggle,
  onSelectProperty
}: HomePageProps) {

  // Helper for category icons
  const getCategoryIcon = (iconName: string, active: boolean) => {
    const colorClass = active ? "text-brand-coral scale-110" : "text-slate group-hover:text-carbon group-hover:scale-105";
    const iconProps = { className: `h-6 w-6 transition duration-300 ${colorClass}` };

    switch (iconName) {
      case "Palmtree":
        return <Palmtree {...iconProps} />;
      case "Cabin":
        return <Home {...iconProps} />;
      case "Castle":
        return <Castle {...iconProps} />;
      case "Compass":
        return <Compass {...iconProps} />;
      case "Sparkles":
        return <Sparkles {...iconProps} />;
      case "Camera":
        return <Camera {...iconProps} />;
      case "MapPin":
        return <MapPin {...iconProps} />;
      default:
        return <Home {...iconProps} />;
    }
  };

  // Filter calculations
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // 1. Category Pill Filter
      if (selectedCategory && prop.category !== selectedCategory) {
        return false;
      }

      // 2. Search location
      if (searchFilters.location) {
        const query = searchFilters.location.toLowerCase();
        const inLoc = prop.location.toLowerCase().includes(query);
        const inTitle = prop.title.toLowerCase().includes(query);
        if (!inLoc && !inTitle) return false;
      }

      // 3. Guests count capacity
      if (prop.maxGuests < searchFilters.guests) {
        return false;
      }

      return true;
    });
  }, [properties, selectedCategory, searchFilters]);

  // Categorized listings
  const experienceListings = useMemo(() => {
    return filteredProperties.filter(p => p.category === "experiences");
  }, [filteredProperties]);

  const memoryListings = useMemo(() => {
    return filteredProperties.filter(p => p.category === "memories");
  }, [filteredProperties]);

  const sevilleListings = useMemo(() => {
    return filteredProperties.filter(p => p.category === "seville");
  }, [filteredProperties]);

  const handleScrollRow = (rowId: string, direction: "left" | "right") => {
    const el = document.getElementById(rowId);
    if (el) {
      const scrollAmount = 400;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const isBrowsingAll = !selectedCategory && !searchFilters.location;

  return (
    <div className="flex-1 flex flex-col">
      {/* Category Pills Navigation Strip */}
      <div className="w-full bg-cloud border-b border-mist py-3.5 px-6 md:px-12 xl:px-24 flex items-center justify-between shadow-xs sticky top-24 z-30 overflow-x-auto no-scrollbar gap-8">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5 select-none w-full justify-start md:justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`group flex flex-col items-center gap-1.5 cursor-pointer pb-1.5 transition outline-none ${selectedCategory === null
                ? "border-b-2 border-carbon text-carbon font-semibold"
                : "text-slate hover:text-carbon"
              }`}
          >
            <Compass className={`h-6 w-6 transition duration-300 ${selectedCategory === null ? "text-brand-coral scale-110" : "text-slate"}`} />
            <span className="text-[11px] tracking-wide">Tất cả sản phẩm</span>
          </button>

          {CATEGORIES_LIST.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`group flex flex-col items-center gap-1.5 cursor-pointer pb-1.5 transition outline-none ${isActive
                    ? "border-b-2 border-carbon text-carbon font-semibold"
                    : "text-slate hover:text-carbon"
                  }`}
              >
                {getCategoryIcon(cat.icon, isActive)}
                <span className="text-[11px] tracking-wide">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Arena */}
      <main className="flex-1 w-full max-w-[1760px] mx-auto px-6 md:px-12 xl:px-24 py-10 space-y-12">
        {/* Dynamic Search & Category Badges Banner */}
        {(selectedCategory || searchFilters.location || searchFilters.guests > 1) && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-cloud border border-mist p-4 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate">
              <span className="font-semibold text-carbon">Bộ lọc đang hoạt động:</span>
              {selectedCategory && (
                <span className="bg-fog text-carbon px-3 py-1 rounded-full text-xs font-medium border border-mist flex items-center gap-1">
                  Danh mục: <strong className="text-brand-coral capitalize">{selectedCategory}</strong>
                  <button onClick={() => setSelectedCategory(null)} className="hover:text-brand-coral font-bold ml-1">×</button>
                </span>
              )}
              {searchFilters.location && (
                <span className="bg-fog text-carbon px-3 py-1 rounded-full text-xs font-medium border border-mist flex items-center gap-1">
                  Khu vực: <strong className="text-brand-coral">{searchFilters.location}</strong>
                  <button onClick={() => setSearchFilters(prev => ({ ...prev, location: "" }))} className="hover:text-brand-coral font-bold ml-1">×</button>
                </span>
              )}
              {searchFilters.guests > 1 && (
                <span className="bg-fog text-carbon px-3 py-1 rounded-full text-xs font-medium border border-mist flex items-center gap-1">
                  Bù thêm tối đa: <strong className="text-brand-coral">{searchFilters.guests * 500}.000đ</strong>
                  <button onClick={() => setSearchFilters(prev => ({ ...prev, guests: 1 }))} className="hover:text-brand-coral font-bold ml-1">×</button>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchFilters({ location: "", guests: 1 });
              }}
              className="text-xs text-brand-coral font-bold hover:underline"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {/* 1. LAYOUT DEFAULT: Carousels per Section */}
        {isBrowsingAll ? (
          <div className="space-y-12">
            {/* ROW 1: Đồ điện tử nổi bật */}
            {experienceListings.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-carbon tracking-tight font-sans">
                    Đồ điện tử nổi bật
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleScrollRow("row-experiences", "left")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-md transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleScrollRow("row-experiences", "right")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-md transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div id="row-experiences" className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x">
                  {experienceListings.map((prop) => (
                    <ListingCard
                      key={prop.id}
                      property={prop}
                      isWishlisted={wishlist.includes(prop.id)}
                      onWishlistToggle={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(prop.id);
                      }}
                      onClick={() => onSelectProperty(prop)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ROW 2: Sách & Truyện chọn lọc */}
            {memoryListings.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-carbon tracking-tight font-sans">
                    Sách và Truyện chọn lọc
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleScrollRow("row-memories", "left")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-md transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleScrollRow("row-memories", "right")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-md transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div id="row-memories" className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x">
                  {memoryListings.map((prop) => (
                    <ListingCard
                      key={prop.id}
                      property={prop}
                      isWishlisted={wishlist.includes(prop.id)}
                      onWishlistToggle={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(prop.id);
                      }}
                      onClick={() => onSelectProperty(prop)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ROW 3: Thời trang & Phụ kiện */}
            {sevilleListings.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-carbon tracking-tight font-sans">
                    Thời trang và Phụ kiện
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleScrollRow("row-seville", "left")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-md transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleScrollRow("row-seville", "right")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-md transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div id="row-seville" className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x">
                  {sevilleListings.map((prop) => (
                    <ListingCard
                      key={prop.id}
                      property={prop}
                      isWishlisted={wishlist.includes(prop.id)}
                      onWishlistToggle={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(prop.id);
                      }}
                      onClick={() => onSelectProperty(prop)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* FALLBACK */}
            {properties.some(p => p.category === "Beach" || p.category === "Cabins" || p.category === "Mansions") && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-carbon tracking-tight font-sans">
                    Các sản phẩm khác đang trao đổi
                  </h2>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 snap-x">
                  {properties
                    .filter(p => ["Beach", "Cabins", "Mansions"].includes(p.category))
                    .map((prop) => (
                      <ListingCard
                        key={prop.id}
                        property={prop}
                        isWishlisted={wishlist.includes(prop.id)}
                        onWishlistToggle={(e) => {
                          e.stopPropagation();
                          handleWishlistToggle(prop.id);
                        }}
                        onClick={() => onSelectProperty(prop)}
                      />
                    ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* 2. LAYOUT FILTERED: Responsive Grid View */
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-carbon tracking-tight">
              Tìm thấy {filteredProperties.length} sản phẩm tương ứng
            </h2>
            {filteredProperties.length === 0 ? (
              <div className="bg-cloud border border-mist p-12 text-center rounded-2xl space-y-4">
                <p className="text-slate text-sm">Không tìm thấy sản phẩm nào khớp với tiêu chí của bạn. Hãy thử thay đổi bộ lọc.</p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchFilters({ location: "", guests: 1 });
                  }}
                  className="bg-brand-coral hover:bg-brand-deep text-cloud text-xs font-semibold px-4 py-2.5 rounded-lg transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProperties.map((prop) => (
                  <ListingCard
                    key={prop.id}
                    property={prop}
                    isWishlisted={wishlist.includes(prop.id)}
                    onWishlistToggle={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(prop.id);
                    }}
                    onClick={() => onSelectProperty(prop)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Brand Trust Notice strip above footer */}
      <section className="bg-cloud border-t border-mist py-8 px-6 md:px-12 xl:px-24">
        <div className="max-w-[1760px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-bold text-carbon text-sm">Hỗ trợ 24/7</h4>
            <p className="text-xs text-slate font-sans leading-relaxed">Đội ngũ hỗ trợ của SWAPLY luôn sẵn sàng giải đáp mọi thắc mắc và hỗ trợ bạn giao dịch nhanh chóng.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-carbon text-sm">Bảo đảm quyền lợi trao đổi</h4>
            <p className="text-xs text-slate font-sans leading-relaxed">Các giao dịch trao đổi đều được giám sát để đảm bảo tính an toàn, công bằng và hoàn toàn minh bạch.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-carbon text-sm">Chủ đồ đã được xác minh</h4>
            <p className="text-xs text-slate font-sans leading-relaxed">Mọi tài khoản đăng tin đều được kiểm duyệt thông tin số điện thoại và hiển thị điểm uy tín rõ ràng.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
