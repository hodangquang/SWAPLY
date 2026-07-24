import React, { useState } from "react";
import { Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Property } from "@/types";

interface ListingCardProps {
  property: Property;
  isWishlisted: boolean;
  onWishlistToggle: (e: React.MouseEvent) => void;
  onClick: () => void;
  key?: string | number;
}

export default function ListingCard({
  property,
  isWishlisted,
  onWishlistToggle,
  onClick
}: ListingCardProps) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      onClick={onClick}
      className="group flex flex-col cursor-pointer transition duration-300 w-[240px] md:w-[280px] shrink-0 select-none relative"
      id={`property-card-${property.id}`}
    >
      {/* Container Image Carousel */}
      <div className="relative w-full aspect-[1/1] bg-pebble rounded-[20px] overflow-hidden select-none">
        {/* Status Badge */}
        {property.status && property.status !== "Active" && (
          <div 
            className={`absolute top-3 left-3 text-cloud text-[11px] font-semibold tracking-[0.44px] uppercase px-[10px] py-[6px] rounded-[4px] z-10 shadow-[0_2px_6px_rgba(0,0,0,0.25)] ${
              property.status === "Pending" 
                ? "bg-amber-500" 
                : "bg-gray-500"
            }`}
            style={{ fontFeatureSettings: '"salt" on' }}
          >
            {property.status === "Pending" ? "Chờ duyệt" : property.status === "Rejected" ? "Từ chối" : property.status}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={onWishlistToggle}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-cloud/70 hover:bg-cloud/90 flex items-center justify-center z-10 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-90 transition duration-200"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4.5 w-4.5 transition-colors ${
              isWishlisted
                ? "text-brand-coral fill-brand-coral"
                : "text-carbon fill-none stroke-[2]"
            }`}
          />
        </button>

        {/* Carousel Image Display */}
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[activeImgIndex]}
            alt={property.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition duration-500 ease-out group-hover:scale-102"
          />
        ) : (
          <div className="w-full h-full bg-fog flex items-center justify-center text-slate text-xs font-semibold select-none">
            Không có hình ảnh
          </div>
        )}

        {/* Carousel Control Buttons (visible on hover) */}
        <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={handlePrevImg}
            className="h-8 w-8 rounded-full bg-cloud hover:bg-fog hover:scale-105 active:scale-95 flex items-center justify-center text-carbon shadow-[0_2px_4px_rgba(0,0,0,0.16)] transition"
          >
            <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
          </button>
          <button
            onClick={handleNextImg}
            className="h-8 w-8 rounded-full bg-cloud hover:bg-fog hover:scale-105 active:scale-95 flex items-center justify-center text-carbon shadow-[0_2px_4px_rgba(0,0,0,0.16)] transition"
          >
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {property.images.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeImgIndex ? "w-3 bg-cloud" : "w-1.5 bg-cloud/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Meta Text details below image */}
      <div className="pt-3 pb-1 flex flex-col gap-1 px-1">
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="font-sans font-semibold text-sm text-carbon line-clamp-1 flex-1">
            {property.title}
          </h3>
        </div>

        <p className="font-sans text-slate text-xs">
          {property.ownerName || "Thành viên Swaply"}
        </p>
        
        <p className="font-sans text-slate text-xs">
          {property.location || "Hồ Chí Minh"}
        </p>

        <p className="font-sans text-carbon text-sm mt-0.5">
          <span className="font-bold">{(property.estimatedValue || property.price || 0).toLocaleString("vi-VN")} đ</span>
          <span className="text-slate text-xs font-normal">
             / sản phẩm
          </span>
        </p>
      </div>
    </div>
  );
}
