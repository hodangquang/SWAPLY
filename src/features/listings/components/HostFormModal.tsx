import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Upload,
  Home,
  MapPin,
  Sparkles,
  Plus,
  DollarSign,
} from "lucide-react";
import { Property } from "@/types";
import { apiClient } from "@shared/api/apiClient";

interface HostFormModalProps {
  onClose: () => void;
  onSubmit: (property: Property) => Promise<void>;
  categories: { id: string; name: string }[];
}

const AVAILABLE_AMENITIES = [
  "Nguyên hộp (Fullbox)",
  "Còn bảo hành chính hãng",
  "Ngoại hình như mới 99%",
  "Có hóa đơn mua hàng",
  "Đầy đủ phụ kiện đi kèm",
  "Hỗ trợ giao hàng (Ship)",
  "Bao test trực tiếp",
  "Hàng chính hãng 100%",
  "Có sách hướng dẫn sử dụng",
  "Tặng kèm quà tặng nhỏ",
];

export default function HostFormModal({
  onClose,
  onSubmit,
  categories,
}: HostFormModalProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState<number>(1000);
  const [categoryId, setCategoryId] = useState(
    categories.length > 0 ? categories[0].id : "",
  );
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [checkedAmenities, setCheckedAmenities] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [condition, setCondition] = useState<"New" | "LikeNew" | "Good" | "Fair">("New");
  const [brand, setBrand] = useState("");
  const [exchangeWish, setExchangeWish] = useState("");
  const [cashTopUpAmount, setCashTopUpAmount] = useState<number>(0);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      const objectUrls = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(objectUrls);
      return () => {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
      };
    }

    setPreviewUrls([]);
  }, [selectedFiles]);

  const toggleAmenity = (amenity: string) => {
    setCheckedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      if (selectedFiles.length === 0) {
        setSubmitError("Vui lòng chọn ít nhất một ảnh sản phẩm.");
        setIsSubmitting(false);
        return;
      }

      const matchedCategory = categories.find((c) => c.id === categoryId);
      const categoryName = matchedCategory
        ? matchedCategory.name
        : categories[0]?.name || "Danh mục khác";

      // Create Property object matching API fields
      const newProperty: Property = {
        id: "", // Will be assigned by server
        title,
        description:
          description ||
          "Sản phẩm còn mới tốt, cần giao lưu đổi đồ khác có giá trị tương đưng.",
        categoryId: categoryId || "00000000-0000-0000-0000-000000000000",
        categoryName,
        estimatedValue: Number(estimatedAmount),
        currency: "VND",
        condition,
        conditionName: condition,
        status: "Pending", // Will be set by server after submit
        brand,
        exchangeWish,
        cashTopUpAmount,
        cashTopUpCurrency: "VND",
        location,
        viewCount: 0,
        favoriteCount: 0,
        images: [], // Will be set by server after upload
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: "",
        rejectionReason: null,
        // Image files for upload
        imageFiles: selectedFiles.length > 0 ? selectedFiles : undefined,
        // Optional fields
        amenities:
          checkedAmenities.length > 0
            ? checkedAmenities
            : ["Nguyên hộp (Fullbox)", "Ngoại hình như mới 99%"],
        // Legacy fields for compatibility
        hostType: "Thành viên Standard",
        hostName: "",
        hostAvatar: "",
        price: Number(estimatedAmount),
        rating: 5.0,
        reviewsCount: 0,
        isGuestFavorite: false,
        maxGuests: 1,
        isExperience: false,
        dateRange: "Hỗ trợ ship hoặc giao dịch trực tiếp",
        category: categoryName,
      };

      await onSubmit(newProperty);
      setIsSubmitted(true);
    } catch (error: any) {
      setSubmitError(error?.message || "Đăng bài thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-carbon/50 flex items-center justify-center p-0 md:p-6 backdrop-blur-xs select-none">
      <div className="bg-cloud w-full max-w-2xl h-full md:h-auto md:max-h-[92vh] rounded-none md:rounded-[20px] overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-cloud z-30 border-b border-mist px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-carbon flex items-center gap-2">
            <Home className="h-5 w-5 text-brand-coral" />
            <span>Đăng bài trao đổi trên SWAPLY</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-fog rounded-full text-slate hover:text-carbon transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-sm mx-auto space-y-5">
              <CheckCircle className="h-16 w-16 text-emerald-500 animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-carbon">
                  Tin đăng đã được tạo!
                </h3>
                <p className="text-slate text-sm leading-relaxed">
                  Sản phẩm{" "}
                  <span className="font-semibold text-carbon">{title}</span> của
                  bạn đã được tạo thành công. Vui lòng đợi quản trị viên duyệt bài trước khi hiển thị công khai.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-brand-coral hover:bg-brand-deep text-cloud py-3 rounded-xl font-semibold shadow-md transition cursor-pointer"
              >
                Quay lại khám phá
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
              {/* Title & Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Tiêu đề bài đăng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: iPhone 12 Pro Max 128GB"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-mist rounded-xl px-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Khu vực giao dịch <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Thủ Đức, TP.HCM"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full border border-mist rounded-xl pl-10 pr-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud"
                    />
                  </div>
                </div>
              </div>

              {/* Price & Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Giá trị ước lượng (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate">
                      đ
                    </span>
                    <input
                      type="number"
                      required
                      min={1000}
                      max={100000000}
                      value={estimatedAmount}
                      onChange={(e) => setEstimatedAmount(Number(e.target.value))}
                      className="w-full border border-mist rounded-xl pl-7 pr-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud font-semibold"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Danh mục sản phẩm <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-mist rounded-xl px-3 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand & Condition Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Apple, Sony, Nike, Zara..."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full border border-mist rounded-xl px-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Tình trạng sản phẩm <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as "New" | "LikeNew" | "Good" | "Fair")}
                    className="w-full border border-mist rounded-xl px-3 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud cursor-pointer"
                  >
                    <option value="New">Mới 100% (New)</option>
                    <option value="LikeNew">Như mới (Like New)</option>
                    <option value="Good">Đang dùng tốt (Good)</option>
                    <option value="Fair">Khá / Trầy nhẹ (Fair)</option>
                  </select>
                </div>
              </div>

              {/* Exchange Wish & Cash Top Up Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Nhu cầu đổi đồ (Exchange Wish)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cần đổi iPad, Laptop, hoặc tương đương"
                    value={exchangeWish}
                    onChange={(e) => setExchangeWish(e.target.value)}
                    className="w-full border border-mist rounded-xl px-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Tiền bù thêm ước lượng (VNĐ)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate">
                      đ
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={cashTopUpAmount || ""}
                      onChange={(e) => setCashTopUpAmount(Number(e.target.value))}
                      placeholder="0"
                      className="w-full border border-mist rounded-xl pl-7 pr-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                  Mô tả chi tiết sản phẩm
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả chi tiết về sản phẩm, tình trạng sử dụng, phụ kiện kèm theo và các món đồ bạn mong muốn nhận trao đổi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-mist rounded-xl px-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud resize-none font-sans"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <span className="text-[11px] text-slate uppercase tracking-wider font-semibold">
                  Hình ảnh sản phẩm <span className="text-rose-500">*</span>
                </span>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="host-form-images"
                    className="inline-flex items-center gap-2 rounded-2xl border border-mist bg-cloud px-4 py-3 text-sm font-semibold text-carbon cursor-pointer hover:bg-fog transition"
                  >
                    <Upload className="h-4 w-4" />
                    Chọn tệp ảnh (tối thiểu 1 ảnh)
                  </label>
                  <input
                    id="host-form-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files
                        ? Array.from(e.target.files)
                        : [];
                      setSelectedFiles(files);
                    }}
                    className="hidden"
                  />
                </div>
                {previewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {previewUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="h-20 rounded-xl overflow-hidden border border-mist"
                      >
                        <img
                          src={url}
                          alt={`Ảnh upload ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {selectedFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate">
                    {selectedFiles.map((file, idx) => (
                      <span
                        key={`${file.name}-${idx}`}
                        className="inline-flex items-center gap-2 rounded-full border border-mist bg-fog px-3 py-1"
                      >
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Amenities checklist */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate uppercase tracking-wider">
                  Đặc điểm nổi bật
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {AVAILABLE_AMENITIES.map((amenity) => {
                    const isChecked = checkedAmenities.includes(amenity);
                    return (
                      <div
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition ${
                          isChecked
                            ? "bg-brand-coral/5 border-brand-coral text-brand-coral font-medium"
                            : "border-mist hover:bg-fog text-carbon"
                        }`}
                      >
                        <Plus
                          className={`h-3.5 w-3.5 transition ${isChecked ? "rotate-45" : ""}`}
                        />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {submitError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
                  {submitError}
                </div>
              ) : null}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-coral hover:bg-brand-deep disabled:bg-brand-coral/70 text-cloud py-3.5 rounded-xl font-bold shadow-md transition duration-200 cursor-pointer text-center text-sm"
              >
                {isSubmitting
                  ? "Đang đăng bài..."
                  : "Đăng bài trao đổi ngay lập tức"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
