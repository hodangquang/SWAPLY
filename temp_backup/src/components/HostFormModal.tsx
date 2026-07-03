import React, { useState } from "react";
import { X, CheckCircle, Upload, Home, MapPin, Sparkles, Plus, DollarSign } from "lucide-react";
import { Property } from "../types";

interface HostFormModalProps {
  onClose: () => void;
  onSubmit: (property: Property) => void;
}

const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&h=600&q=80"
];

const AVAILABLE_AMENITIES = [
  "High-speed WiFi",
  "Air Conditioning",
  "Full Kitchen",
  "Rooftop Terrace",
  "Infinity Pool",
  "Hot Tub",
  "Espresso Machine",
  "Bicycles Provided",
  "Washer & Dryer",
  "Dedicated Workspace"
];

export default function HostFormModal({ onClose, onSubmit }: HostFormModalProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState(85);
  const [category, setCategory] = useState("seville");
  const [description, setDescription] = useState("");
  const [hostName, setHostName] = useState("You (Host)");
  const [selectedImg, setSelectedImg] = useState(PRESET_IMAGES[0]);
  const [customImgUrl, setCustomImgUrl] = useState("");
  const [checkedAmenities, setCheckedAmenities] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleAmenity = (amenity: string) => {
    setCheckedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrls = [
      customImgUrl.trim() || selectedImg,
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&h=600&q=80"
    ];

    const isExperienceCategory = category === "experiences" || category === "memories";

    const newProperty: Property = {
      id: `custom-${Date.now()}`,
      title,
      hostType: "Individual host",
      hostName,
      hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
      category,
      price: Number(price),
      rating: 5.0,
      reviewsCount: 1,
      images: imageUrls,
      description: description || "A spectacular luxury space crafted with love and attention to fine design detail.",
      amenities: checkedAmenities.length > 0 ? checkedAmenities : ["High-speed WiFi", "Air Conditioning"],
      location,
      isGuestFavorite: true,
      maxGuests: isExperienceCategory ? 10 : 4,
      isExperience: isExperienceCategory,
      dateRange: isExperienceCategory ? `From € ${price} / guest` : "Instant booking active"
    };

    onSubmit(newProperty);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-carbon/50 flex items-center justify-center p-0 md:p-6 backdrop-blur-xs select-none">
      <div className="bg-cloud w-full max-w-2xl h-full md:h-auto md:max-h-[92vh] rounded-none md:rounded-[20px] overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-cloud z-30 border-b border-mist px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-carbon flex items-center gap-2">
            <Home className="h-5 w-5 text-brand-coral" />
            <span>List your space on Airbnb</span>
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
                <h3 className="text-xl font-bold text-carbon">Your Space is Live!</h3>
                <p className="text-slate text-sm leading-relaxed">
                  Excellent! <span className="font-semibold text-carbon">{title}</span> has been published successfully and is now active in the main listing directory.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-brand-coral hover:bg-brand-deep text-cloud py-3 rounded-xl font-semibold shadow-md transition"
              >
                Go back to explore
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
              
              {/* Title & Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Listing Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cozy Loft with Private Rooftop"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-mist rounded-xl px-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Location / Area
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Santa Cruz, Seville"
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
                    Price per night (€)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm font-semibold text-slate">€</span>
                    <input
                      type="number"
                      required
                      min={10}
                      max={1000}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full border border-mist rounded-xl pl-7 pr-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud font-semibold"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                    Property Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-mist rounded-xl px-3 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud"
                  >
                    <option value="seville">Seville Stay</option>
                    <option value="experiences">Experience Activity</option>
                    <option value="memories">Capture Memory Photo session</option>
                    <option value="Beach">Beachfront stay</option>
                    <option value="Cabins">Cabin stay</option>
                    <option value="Mansions">Grand Mansion</option>
                  </select>
                </div>
              </div>

              {/* Host Name input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                  Host / Publisher Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full border border-mist rounded-xl px-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate uppercase tracking-wider">
                  Describe your property
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell guests what makes your place special, its historical details, location highlights, and what to expect."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-mist rounded-xl px-3.5 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral bg-cloud resize-none font-sans"
                />
              </div>

              {/* Photo selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate uppercase tracking-wider">
                  Select cover photo
                </label>
                <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                  {PRESET_IMAGES.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedImg(img);
                        setCustomImgUrl("");
                      }}
                      className={`h-16 w-16 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer transition ${
                        selectedImg === img && !customImgUrl
                          ? "border-brand-coral scale-105 shadow-md"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="preset thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                
                {/* Custom Photo URL Input */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-slate">Or paste custom image URL</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={customImgUrl}
                    onChange={(e) => {
                      setCustomImgUrl(e.target.value);
                    }}
                    className="w-full border border-mist rounded-xl px-3 py-1.5 text-xs text-carbon focus:outline-none focus:border-brand-coral bg-cloud"
                  />
                </div>
              </div>

              {/* Amenities checklist */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate uppercase tracking-wider">
                  Select available amenities
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
                        <Plus className={`h-3.5 w-3.5 transition ${isChecked ? "rotate-45" : ""}`} />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-brand-coral hover:bg-brand-deep text-cloud py-3.5 rounded-xl font-bold shadow-md transition duration-200 cursor-pointer text-center text-sm"
              >
                Publish New Listing
              </button>
            </form>
          )}
        </div>
        
      </div>
    </div>
  );
}
