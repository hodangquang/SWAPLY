import React, { useState, useEffect, useMemo } from "react";
import { Palmtree, Castle, Compass, Sparkles, Camera, MapPin, ChevronLeft, ChevronRight, Home, Shield, Heart } from "lucide-react";
import { Property, Booking } from "./types";
import { INITIAL_PROPERTIES, CATEGORIES_LIST } from "./data";

import Header from "./components/Header";
import ListingCard from "./components/ListingCard";
import ListingModal from "./components/ListingModal";
import HostFormModal from "./components/HostFormModal";
import DashboardModal from "./components/DashboardModal";

export default function App() {
  // Master states
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem("airbnb-properties");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PROPERTIES;
      }
    }
    return INITIAL_PROPERTIES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("airbnb-bookings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("airbnb-wishlist");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<{ location: string; guests: number }>({
    location: "",
    guests: 1
  });

  // UI overlays/modals states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isHostFormOpen, setIsHostFormOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"trips" | "wishlist" | "host">("trips");

  // Synchronize localStorage on states change
  useEffect(() => {
    localStorage.setItem("airbnb-properties", JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem("airbnb-bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("airbnb-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Icon mapping helper for categories
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

  // Reset all sandbox data back to initials
  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to restore the default listings and delete all custom modifications, wishlists, and bookings?")) {
      setProperties(INITIAL_PROPERTIES);
      setBookings([]);
      setWishlist([]);
      setSelectedCategory(null);
      setSearchFilters({ location: "", guests: 1 });
      setSelectedProperty(null);
      setIsHostFormOpen(false);
      setIsDashboardOpen(false);
    }
  };

  // Filter computations
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

  // Categorized listings lists (used for row structure when no category pill selected)
  const experienceListings = useMemo(() => {
    return filteredProperties.filter(p => p.category === "experiences");
  }, [filteredProperties]);

  const memoryListings = useMemo(() => {
    return filteredProperties.filter(p => p.category === "memories");
  }, [filteredProperties]);

  const sevilleListings = useMemo(() => {
    return filteredProperties.filter(p => p.category === "seville");
  }, [filteredProperties]);

  // Wishlist list
  const wishlistedProperties = useMemo(() => {
    return properties.filter(p => wishlist.includes(p.id));
  }, [properties, wishlist]);

  // User-owned Host properties
  const userHostProperties = useMemo(() => {
    return properties.filter(p => p.id.startsWith("custom-"));
  }, [properties]);

  // Wishlist handler
  const handleWishlistToggle = (propertyId: string) => {
    setWishlist((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  };

  // Booking creator
  const handleCreateBooking = (bookingData: Omit<Booking, "id" | "bookedAt">) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      bookedAt: new Date().toISOString()
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  // Cancel booking
  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      setBookings((prev) => prev.filter(b => b.id !== bookingId));
    }
  };

  // Create new listing from host form
  const handleCreateHostListing = (newProp: Property) => {
    setProperties((prev) => [newProp, ...prev]);
  };

  // Delete/Unlist host property
  const handleDeleteHostProperty = (propertyId: string) => {
    if (window.confirm("Are you sure you want to delete and unlist this property?")) {
      setProperties((prev) => prev.filter(p => p.id !== propertyId));
      setWishlist((prev) => prev.filter(id => id !== propertyId));
    }
  };

  // Horizontal scroll triggers
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
    <div className="min-h-screen bg-fog text-carbon font-sans flex flex-col selection:bg-brand-coral/20 select-none">
      
      {/* Sticky Global Top Header */}
      <Header
        onSearch={(filters) => {
          setSearchFilters({ location: filters.location, guests: filters.guests });
          setSelectedCategory(filters.category);
        }}
        onOpenHostForm={() => setIsHostFormOpen(true)}
        onOpenDashboard={(tab) => {
          setDashboardTab(tab);
          setIsDashboardOpen(true);
        }}
        activeDashboardTab={isDashboardOpen ? dashboardTab : null}
        resetAll={handleResetAll}
      />

      {/* Category Pills Navigation Strip */}
      <div className="w-full bg-cloud border-b border-mist py-3.5 px-6 md:px-12 xl:px-24 flex items-center justify-between shadow-xs sticky top-24 z-30 overflow-x-auto no-scrollbar gap-8">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5 select-none w-full justify-start md:justify-center">
          {/* "All" Category Pill */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`group flex flex-col items-center gap-1.5 cursor-pointer pb-1.5 transition outline-none ${
              selectedCategory === null
                ? "border-b-2 border-carbon text-carbon font-semibold"
                : "text-slate hover:text-carbon"
            }`}
          >
            <Compass className={`h-6 w-6 transition duration-300 ${selectedCategory === null ? "text-brand-coral scale-110" : "text-slate"}`} />
            <span className="text-[11px] tracking-wide">All Stays</span>
          </button>

          {CATEGORIES_LIST.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`group flex flex-col items-center gap-1.5 cursor-pointer pb-1.5 transition outline-none ${
                  isActive
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
              <span className="font-semibold text-carbon">Active filters:</span>
              {selectedCategory && (
                <span className="bg-fog text-carbon px-3 py-1 rounded-full text-xs font-medium border border-mist flex items-center gap-1">
                  Category: <strong className="text-brand-coral capitalize">{selectedCategory}</strong>
                  <button onClick={() => setSelectedCategory(null)} className="hover:text-brand-coral font-bold ml-1">×</button>
                </span>
              )}
              {searchFilters.location && (
                <span className="bg-fog text-carbon px-3 py-1 rounded-full text-xs font-medium border border-mist flex items-center gap-1">
                  Near: <strong className="text-brand-coral">{searchFilters.location}</strong>
                  <button onClick={() => setSearchFilters(prev => ({ ...prev, location: "" }))} className="hover:text-brand-coral font-bold ml-1">×</button>
                </span>
              )}
              {searchFilters.guests > 1 && (
                <span className="bg-fog text-carbon px-3 py-1 rounded-full text-xs font-medium border border-mist flex items-center gap-1">
                  For: <strong className="text-brand-coral">{searchFilters.guests} guests</strong>
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
              Clear all filters
            </button>
          </div>
        )}

        {/* 1. LAYOUT DEFAULT: Elegant Horizontal Carousels per Section (Screenshot Match) */}
        {isBrowsingAll ? (
          <div className="space-y-12">
            
            {/* ROW 1: Popular experiences nearby */}
            {experienceListings.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold text-carbon tracking-tight flex items-center gap-1.5 font-sans" style={{ letterSpacing: "-0.2px" }}>
                      <span>Popular experiences nearby</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleScrollRow("row-experiences", "left")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleScrollRow("row-experiences", "right")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  id="row-experiences"
                  className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x"
                >
                  {experienceListings.map((prop) => (
                    <ListingCard
                      key={prop.id}
                      property={prop}
                      isWishlisted={wishlist.includes(prop.id)}
                      onWishlistToggle={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(prop.id);
                      }}
                      onClick={() => setSelectedProperty(prop)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ROW 2: Capture memories nearby */}
            {memoryListings.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold text-carbon tracking-tight flex items-center gap-1.5 font-sans" style={{ letterSpacing: "-0.2px" }}>
                      <span>Capture memories nearby</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleScrollRow("row-memories", "left")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleScrollRow("row-memories", "right")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  id="row-memories"
                  className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x"
                >
                  {memoryListings.map((prop) => (
                    <ListingCard
                      key={prop.id}
                      property={prop}
                      isWishlisted={wishlist.includes(prop.id)}
                      onWishlistToggle={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(prop.id);
                      }}
                      onClick={() => setSelectedProperty(prop)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ROW 3: Homes in Seville */}
            {sevilleListings.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold text-carbon tracking-tight flex items-center gap-1.5 font-sans" style={{ letterSpacing: "-0.2px" }}>
                      <span>Homes in Seville</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleScrollRow("row-seville", "left")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleScrollRow("row-seville", "right")}
                      className="h-8 w-8 rounded-full border border-mist bg-cloud hover:bg-fog active:scale-95 flex items-center justify-center text-carbon shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  id="row-seville"
                  className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x"
                >
                  {sevilleListings.map((prop) => (
                    <ListingCard
                      key={prop.id}
                      property={prop}
                      isWishlisted={wishlist.includes(prop.id)}
                      onWishlistToggle={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(prop.id);
                      }}
                      onClick={() => setSelectedProperty(prop)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* FALLBACK: Any other Categories row if there's custom item listed */}
            {properties.some(p => p.category === "Beach" || p.category === "Cabins" || p.category === "Mansions") && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-carbon tracking-tight font-sans" style={{ letterSpacing: "-0.2px" }}>
                    Other Premium Stays worldwide
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
                        onClick={() => setSelectedProperty(prop)}
                      />
                    ))}
                </div>
              </section>
            )}

          </div>
        ) : (
          /* 2. LAYOUT FILTERED: Beautiful Dynamic Responsive Grid View */
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-carbon tracking-tight">
              Showing {filteredProperties.length} matches
            </h2>
            {filteredProperties.length === 0 ? (
              <div className="bg-cloud border border-mist p-12 text-center rounded-2xl space-y-4">
                <p className="text-slate text-sm">No properties found matching your criteria. Try adjusting your filters or destination keywords.</p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchFilters({ location: "", guests: 1 });
                  }}
                  className="bg-brand-coral hover:bg-brand-deep text-cloud text-xs font-semibold px-4 py-2.5 rounded-lg transition"
                >
                  Reset all filters
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
                    onClick={() => setSelectedProperty(prop)}
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
            <h4 className="font-bold text-carbon text-sm">24/7 Global Assistance</h4>
            <p className="text-xs text-slate font-sans leading-relaxed">No matter where you are, we've got you covered with premium support standing by.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-carbon text-sm">Guest Refund Guarantee</h4>
            <p className="text-xs text-slate font-sans leading-relaxed">We protect every reservation so you can complete experiences with absolute confidence.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-carbon text-sm">Verified Hosts only</h4>
            <p className="text-xs text-slate font-sans leading-relaxed">Every local guide and superhost undergoes structured security audits.</p>
          </div>
        </div>
      </section>

      {/* Footer Area: Multi-Column Link Grid */}
      <footer className="bg-fog border-t border-mist py-10 px-6 md:px-12 xl:px-24 text-left">
        <div className="max-w-[1760px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-mist">
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon">Support</h4>
            <ul className="space-y-2 text-xs text-slate font-medium">
              <li><a href="#" className="hover:underline">Help Centre</a></li>
              <li><a href="#" className="hover:underline">AirCover</a></li>
              <li><a href="#" className="hover:underline">Anti-discrimination</a></li>
              <li><a href="#" className="hover:underline">Disability support</a></li>
              <li><a href="#" className="hover:underline">Cancellation options</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon">Hosting</h4>
            <ul className="space-y-2 text-xs text-slate font-medium">
              <li><a href="#" className="hover:underline">Airbnb your home</a></li>
              <li><a href="#" className="hover:underline">AirCover for Hosts</a></li>
              <li><a href="#" className="hover:underline">Hosting resources</a></li>
              <li><a href="#" className="hover:underline">Community forum</a></li>
              <li><a href="#" className="hover:underline">Hosting responsibly</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon">Airbnb</h4>
            <ul className="space-y-2 text-xs text-slate font-medium">
              <li><a href="#" className="hover:underline">Newsroom</a></li>
              <li><a href="#" className="hover:underline">New features</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Investors</a></li>
              <li><a href="#" className="hover:underline">Gift cards</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-carbon font-sans">Tech Stack</h4>
            <div className="text-xs text-slate font-sans leading-relaxed">
              <p>Designed and built under the <strong className="text-brand-coral">Airbnb Style Reference</strong> guidelines.</p>
              <p className="mt-2 text-[11px] font-mono">React 19 + Vite + Tailwind v4</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1760px] mx-auto pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate gap-4 font-medium">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2026 Airbnb, Inc.</span>
            <span>·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:underline">Terms</a>
            <span>·</span>
            <a href="#" className="hover:underline">Sitemap</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">English (UK)</span>
            <span className="hover:underline cursor-pointer">€ EUR</span>
          </div>
        </div>
      </footer>

      {/* ACTIVE MODAL VIEWS */}
      
      {/* 1. Property Details Modal */}
      {selectedProperty && (
        <ListingModal
          property={selectedProperty}
          isWishlisted={wishlist.includes(selectedProperty.id)}
          onWishlistToggle={() => handleWishlistToggle(selectedProperty.id)}
          onClose={() => setSelectedProperty(null)}
          onBook={handleCreateBooking}
        />
      )}

      {/* 2. Create Listing Host Form Modal */}
      {isHostFormOpen && (
        <HostFormModal
          onClose={() => setIsHostFormOpen(false)}
          onSubmit={handleCreateHostListing}
        />
      )}

      {/* 3. Dashboard Sliding Drawer Panel */}
      <DashboardModal
        isOpen={isDashboardOpen}
        activeTab={dashboardTab}
        onTabChange={(tab) => setDashboardTab(tab)}
        onClose={() => setIsDashboardOpen(false)}
        bookings={bookings}
        wishlistedProperties={wishlistedProperties}
        hostProperties={userHostProperties}
        onCancelBooking={handleCancelBooking}
        onRemoveWishlist={handleWishlistToggle}
        onDeleteHostProperty={handleDeleteHostProperty}
        onSelectProperty={(prop) => {
          setSelectedProperty(prop);
          setIsDashboardOpen(false);
        }}
      />

    </div>
  );
}
