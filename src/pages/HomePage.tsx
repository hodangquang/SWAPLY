import React, { useMemo } from "react";
import {
  Compass,
  Palmtree,
  Home,
  Castle,
  Sparkles,
  Camera,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  BookOpen,
  Shirt,
  Utensils,
  Bike,
  Gamepad2,
  Headphones,
  Watch,
} from "lucide-react";
import { Property } from "@/types";
import ListingCard from "@features/listings/components/ListingCard";

interface HomePageProps {
  properties: Property[];
  categories: { id: string; name: string }[];
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  searchFilters: { location: string; guests: number };
  setSearchFilters: React.Dispatch<
    React.SetStateAction<{ location: string; guests: number }>
  >;
  wishlist: string[];
  handleWishlistToggle: (id: string) => void;
  onSelectProperty: (prop: Property) => void;
}

export default function HomePage({
  properties,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  searchFilters,
  setSearchFilters,
  wishlist,
  handleWishlistToggle,
  onSelectProperty,
}: HomePageProps) {
  // Helper for category icons
  const getCategoryIcon = (categoryName: string, active: boolean) => {
    const colorClass = active
      ? "text-brand-coral scale-110"
      : "text-slate group-hover:text-carbon group-hover:scale-105";
    const iconProps = {
      className: `h-6 w-6 transition duration-300 ${colorClass}`,
    };

    const nameLower = (categoryName || "").toLowerCase();
    if (nameLower.includes("ipad") || nameLower.includes("tablet") || nameLower.includes("máy tính bảng")) {
      return <Tablet {...iconProps} />;
    }
    if (nameLower.includes("điện thoại") || nameLower.includes("phone") || nameLower.includes("di động")) {
      return <Smartphone {...iconProps} />;
    }
    if (
      nameLower.includes("máy tính") ||
      nameLower.includes("laptop") ||
      nameLower.includes("computer") ||
      nameLower.includes("pc")
    ) {
      return <Laptop {...iconProps} />;
    }
    if (nameLower.includes("tivi") || nameLower.includes("tv") || nameLower.includes("màn hình")) {
      return <Tv {...iconProps} />;
    }
    if (
      nameLower.includes("sách") ||
      nameLower.includes("truyện") ||
      nameLower.includes("memory") ||
      nameLower.includes("đọc")
    ) {
      return <BookOpen {...iconProps} />;
    }
    if (
      nameLower.includes("thời trang") ||
      nameLower.includes("quần áo") ||
      nameLower.includes("giày") ||
      nameLower.includes("seville") ||
      nameLower.includes("mũ") ||
      nameLower.includes("kính")
    ) {
      return <Shirt {...iconProps} />;
    }
    if (nameLower.includes("game") || nameLower.includes("đồ chơi") || nameLower.includes("toy") || nameLower.includes("mansion")) {
      return <Gamepad2 {...iconProps} />;
    }
    if (nameLower.includes("tai nghe") || nameLower.includes("loa") || nameLower.includes("audio") || nameLower.includes("âm thanh")) {
      return <Headphones {...iconProps} />;
    }
    if (nameLower.includes("đồng hồ") || nameLower.includes("watch") || nameLower.includes("smartwatch")) {
      return <Watch {...iconProps} />;
    }
    if (
      nameLower.includes("gia dụng") ||
      nameLower.includes("nhà cửa") ||
      nameLower.includes("bếp") ||
      nameLower.includes("beach")
    ) {
      return <Utensils {...iconProps} />;
    }
    if (nameLower.includes("thể thao") || nameLower.includes("xe đạp") || nameLower.includes("vợt") || nameLower.includes("cabin")) {
      return <Bike {...iconProps} />;
    }
    if (
      nameLower.includes("điện tử") ||
      nameLower.includes("công nghệ") ||
      nameLower.includes("experience") ||
      nameLower.includes("máy ảnh") ||
      nameLower.includes("camera")
    ) {
      return <Camera {...iconProps} />;
    }
    return <Home {...iconProps} />;
  };

  // Filter calculations
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      if (selectedCategory) {
        const selectedName = selectedCategory.trim().toLowerCase();
        const propCategory = (prop.category || "").trim().toLowerCase();
        const propCategoryId = (prop.categoryId || "").trim().toLowerCase();
        const categoryMatch =
          propCategory === selectedName || propCategoryId === selectedName;
        if (!categoryMatch) {
          return false;
        }
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

  const categorySections = useMemo(() => {
    return categories
      .map((cat) => ({
        ...cat,
        listings: filteredProperties.filter((prop) => {
          const propCategory = (prop.category || "").trim().toLowerCase();
          const propCategoryId = (prop.categoryId || "").trim().toLowerCase();
          const catName = (cat.name || "").trim().toLowerCase();
          return (
            propCategory === catName ||
            propCategoryId === catName ||
            propCategoryId === cat.id.toLowerCase()
          );
        }),
      }))
      .filter((section) => section.listings.length > 0);
  }, [categories, filteredProperties]);

  const handleScrollRow = (rowId: string, direction: "left" | "right") => {
    const el = document.getElementById(rowId);
    if (el) {
      const scrollAmount = 400;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
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
            className={`group flex flex-col items-center gap-1.5 cursor-pointer pb-1.5 transition outline-none ${
              selectedCategory === null
                ? "border-b-2 border-carbon text-carbon font-semibold"
                : "text-slate hover:text-carbon"
            }`}
          >
            <Compass
              className={`h-6 w-6 transition duration-300 ${selectedCategory === null ? "text-brand-coral scale-110" : "text-slate"}`}
            />
            <span className="text-[11px] tracking-wide">Tất cả sản phẩm</span>
          </button>

          {categories.map((cat) => {
            const isActive =
              selectedCategory?.trim().toLowerCase() ===
              cat.name.trim().toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`group flex flex-col items-center gap-1.5 cursor-pointer pb-1.5 transition outline-none ${
                  isActive
                    ? "border-b-2 border-carbon text-carbon font-semibold"
                    : "text-slate hover:text-carbon"
                }`}
              >
                {getCategoryIcon(cat.name, isActive)}
                <span className="text-[11px] tracking-wide">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Arena */}
      <main className="flex-1 w-full max-w-[1760px] mx-auto px-6 md:px-12 xl:px-24 py-10 space-y-12">
        {/* Dynamic Search & Category Badges Banner */}
        {(selectedCategory ||
          searchFilters.location ||
          searchFilters.guests > 1) && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-cloud border border-mist p-4 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate">
              <span className="font-semibold text-carbon">
                Bộ lọc đang hoạt động:
              </span>
              {selectedCategory && (
                <span className="bg-fog text-carbon px-3 py-1 rounded-full text-xs font-medium border border-mist flex items-center gap-1">
                  Danh mục:{" "}
                  <strong className="text-brand-coral capitalize">
                    {selectedCategory}
                  </strong>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="hover:text-brand-coral font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchFilters.location && (
                <span className="bg-fog text-carbon px-3 py-1 rounded-full text-xs font-medium border border-mist flex items-center gap-1">
                  Khu vực:{" "}
                  <strong className="text-brand-coral">
                    {searchFilters.location}
                  </strong>
                  <button
                    onClick={() =>
                      setSearchFilters((prev) => ({ ...prev, location: "" }))
                    }
                    className="hover:text-brand-coral font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchFilters.guests > 1 && (
                <span className="bg-fog text-carbon px-3 py-1 rounded-full text-xs font-medium border border-mist flex items-center gap-1">
                  Bù thêm tối đa:{" "}
                  <strong className="text-brand-coral">
                    {searchFilters.guests * 500}.000đ
                  </strong>
                  <button
                    onClick={() =>
                      setSearchFilters((prev) => ({ ...prev, guests: 1 }))
                    }
                    className="hover:text-brand-coral font-bold ml-1"
                  >
                    ×
                  </button>
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
            {categorySections.map((section) => (
              <section key={section.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-carbon tracking-tight font-sans">
                    {section.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleScrollRow(`row-${section.id}`, "left")
                      }
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-md transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleScrollRow(`row-${section.id}`, "right")
                      }
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-md transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  id={`row-${section.id}`}
                  className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x"
                >
                  {section.listings.map((prop) => (
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
            ))}

            {/* FALLBACK */}
            {properties.some(
              (p) =>
                p.category === "Beach" ||
                p.category === "Cabins" ||
                p.category === "Mansions",
            ) && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-carbon tracking-tight font-sans">
                    Các sản phẩm khác đang trao đổi
                  </h2>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 snap-x">
                  {properties
                    .filter((p) =>
                      ["Beach", "Cabins", "Mansions"].includes(p.category),
                    )
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
                <p className="text-slate text-sm">
                  Không tìm thấy sản phẩm nào khớp với tiêu chí của bạn. Hãy thử
                  thay đổi bộ lọc.
                </p>
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
            <p className="text-xs text-slate font-sans leading-relaxed">
              Đội ngũ hỗ trợ của SWAPLY luôn sẵn sàng giải đáp mọi thắc mắc và
              hỗ trợ bạn giao dịch nhanh chóng.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-carbon text-sm">
              Bảo đảm quyền lợi trao đổi
            </h4>
            <p className="text-xs text-slate font-sans leading-relaxed">
              Các giao dịch trao đổi đều được giám sát để đảm bảo tính an toàn,
              công bằng và hoàn toàn minh bạch.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-carbon text-sm">
              Chủ đồ đã được xác minh
            </h4>
            <p className="text-xs text-slate font-sans leading-relaxed">
              Mọi tài khoản đăng tin đều được kiểm duyệt thông tin số điện thoại
              và hiển thị điểm uy tín rõ ràng.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
