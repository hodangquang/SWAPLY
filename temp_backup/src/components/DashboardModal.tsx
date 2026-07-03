import { X, Heart, ClipboardList, Home, Calendar, Users, Trash2, ArrowRight } from "lucide-react";
import { Property, Booking } from "../types";

interface DashboardModalProps {
  isOpen: boolean;
  activeTab: "trips" | "wishlist" | "host";
  onTabChange: (tab: "trips" | "wishlist" | "host") => void;
  onClose: () => void;
  bookings: Booking[];
  wishlistedProperties: Property[];
  hostProperties: Property[];
  onCancelBooking: (bookingId: string) => void;
  onRemoveWishlist: (propertyId: string) => void;
  onDeleteHostProperty: (propertyId: string) => void;
  onSelectProperty: (property: Property) => void;
}

export default function DashboardModal({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  bookings,
  wishlistedProperties,
  hostProperties,
  onCancelBooking,
  onRemoveWishlist,
  onDeleteHostProperty,
  onSelectProperty
}: DashboardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-carbon/50 flex justify-end select-none backdrop-blur-xs">
      {/* Backdrop closer click */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Slide Drawer content */}
      <div className="relative bg-cloud w-full max-w-md h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-mist flex items-center justify-between bg-cloud">
          <div className="flex items-center gap-2">
            {activeTab === "trips" && <ClipboardList className="h-5 w-5 text-brand-coral" />}
            {activeTab === "wishlist" && <Heart className="h-5 w-5 text-brand-coral fill-brand-coral" />}
            {activeTab === "host" && <Home className="h-5 w-5 text-brand-coral" />}
            <h2 className="text-base font-bold text-carbon uppercase tracking-wider">
              {activeTab === "trips" && "My Booked Trips"}
              {activeTab === "wishlist" && "My Wishlist"}
              {activeTab === "host" && "My Published Places"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-fog rounded-full text-slate hover:text-carbon transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation buttons inside Drawer */}
        <div className="flex border-b border-mist bg-fog/30 text-xs text-slate font-semibold">
          <button
            onClick={() => onTabChange("trips")}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === "trips"
                ? "border-brand-coral text-brand-coral font-bold bg-cloud"
                : "border-transparent hover:text-carbon"
            }`}
          >
            Trips ({bookings.length})
          </button>
          <button
            onClick={() => onTabChange("wishlist")}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === "wishlist"
                ? "border-brand-coral text-brand-coral font-bold bg-cloud"
                : "border-transparent hover:text-carbon"
            }`}
          >
            Wishlist ({wishlistedProperties.length})
          </button>
          <button
            onClick={() => onTabChange("host")}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === "host"
                ? "border-brand-coral text-brand-coral font-bold bg-cloud"
                : "border-transparent hover:text-carbon"
            }`}
          >
            Listings ({hostProperties.length})
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
          
          {/* TRIPS VIEW */}
          {activeTab === "trips" && (
            bookings.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-slate text-sm">You have no upcoming trips booked yet.</p>
                <button
                  onClick={onClose}
                  className="bg-brand-coral hover:bg-brand-deep text-cloud text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  Explore properties
                </button>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="border border-mist rounded-xl p-4 space-y-3 bg-fog/20 flex flex-col justify-between">
                  <div className="flex gap-3">
                    <img
                      src={booking.propertyImage}
                      alt={booking.propertyName}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-lg object-cover bg-pebble shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-xs text-carbon line-clamp-2 leading-snug">
                        {booking.propertyName}
                      </h4>
                      <p className="text-[10px] text-slate font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {booking.checkIn} — {booking.checkOut}
                      </p>
                      <p className="text-[10px] text-slate font-medium flex items-center gap-1">
                        <Users className="h-3 w-3" /> {booking.guests.adults} Guest(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-mist mt-1 text-xs">
                    <div>
                      <span className="text-[10px] text-slate block uppercase tracking-wide font-semibold">Total Cost Charged</span>
                      <span className="font-bold text-carbon text-sm">€{booking.totalPrice}</span>
                    </div>
                    <button
                      onClick={() => onCancelBooking(booking.id)}
                      className="text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 border border-transparent hover:border-red-200"
                    >
                      Cancel Reservation
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {/* WISHLIST VIEW */}
          {activeTab === "wishlist" && (
            wishlistedProperties.length === 0 ? (
              <div className="text-center py-12 text-slate text-sm">
                Your wishlist is empty. Tap the heart icons on listings to save them here!
              </div>
            ) : (
              wishlistedProperties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => {
                    onSelectProperty(prop);
                  }}
                  className="border border-mist rounded-xl p-3 flex gap-3 cursor-pointer hover:shadow-md hover:bg-fog/10 transition bg-cloud relative group"
                >
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-lg object-cover bg-pebble shrink-0"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0 pr-6">
                    <h4 className="font-semibold text-xs text-carbon truncate group-hover:text-brand-coral">
                      {prop.title}
                    </h4>
                    <p className="text-[10px] text-slate">{prop.location}</p>
                    <p className="text-xs font-bold text-carbon pt-0.5">
                      €{prop.price} <span className="text-[10px] text-slate font-normal">/ {prop.isExperience ? "guest" : "night"}</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveWishlist(prop.id);
                    }}
                    className="absolute right-3 top-3 p-1 rounded-full text-brand-coral hover:bg-red-50 transition"
                    title="Remove item"
                  >
                    <Heart className="h-4 w-4 fill-brand-coral" />
                  </button>
                </div>
              ))
            )
          )}

          {/* HOST VIEW */}
          {activeTab === "host" && (
            hostProperties.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-slate text-sm">You haven't listed any spaces yet.</p>
                <p className="text-xs text-slate px-4">List your holiday home or local experience and watch them show up instantly on Airbnb!</p>
              </div>
            ) : (
              hostProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="border border-mist rounded-xl p-3 flex gap-3 bg-cloud relative group"
                >
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-lg object-cover bg-pebble shrink-0"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-xs text-carbon truncate mr-6">
                        {prop.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate">{prop.location} • <span className="capitalize">{prop.category}</span></p>
                    <p className="text-xs font-bold text-carbon pt-0.5">
                      €{prop.price} <span className="text-[10px] text-slate font-normal">/ night</span>
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteHostProperty(prop.id)}
                    className="absolute right-3 bottom-3 p-1.5 rounded-lg text-slate hover:text-red-500 hover:bg-red-50 transition"
                    title="Delete listing"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )
          )}

        </div>
      </div>
    </div>
  );
}
