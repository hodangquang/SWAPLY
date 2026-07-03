import React, { useState } from "react";
import { Search, Globe, Menu, Sparkles, MapPin, Calendar, Users, X, Heart, ClipboardList } from "lucide-react";

interface HeaderProps {
  onSearch: (filters: { location: string; guests: number; category: string | null }) => void;
  onOpenHostForm: () => void;
  onOpenDashboard: (tab: "trips" | "wishlist" | "host") => void;
  activeDashboardTab: string | null;
  resetAll: () => void;
}

export default function Header({
  onSearch,
  onOpenHostForm,
  onOpenDashboard,
  resetAll
}: HeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  
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
        onClick={resetAll}
        className="flex items-center gap-2 cursor-pointer text-brand-coral select-none hover:opacity-90 active:scale-95 transition"
      >
        <svg
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
          className="h-9 w-9 fill-current"
        >
          <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533.981c.195.374.385.768.572 1.182.762 1.683 1.632 3.845 2.588 6.444l.117.323c1.373 3.791 2.452 7.025 3.21 9.638.293 1.01.442 1.956.442 2.81 0 3.308-2.3 5.433-5.553 5.433-2.112 0-3.891-.979-5.461-2.827l-.145-.172c-.11-.133-.217-.272-.322-.416-.3-.41-.57-.84-.814-1.286-.24.444-.509.873-.807 1.28l-.33.43c-1.564 1.838-3.34 2.811-5.446 2.811-3.253 0-5.553-2.125-5.553-5.433 0-.854.149-1.8.442-2.81.758-2.613 1.837-5.847 3.21-9.638l.117-.323c.956-2.599 1.826-4.761 2.588-6.444.187-.414.377-.808.572-1.182l.533-.981C12.537 1.963 13.992 1 16 1zm0 2c-1.235 0-2.201.618-3.1 2.222l-.493.906c-.169.324-.336.666-.502 1.033-.738 1.632-1.584 3.738-2.512 6.26l-.116.315c-1.348 3.722-2.408 6.91-3.153 9.48-.25.862-.371 1.62-.371 2.25 0 2.213 1.503 3.433 3.553 3.433 1.484 0 2.766-.757 3.966-2.254l.112-.144c.3-.399.567-.822.8-1.264l.144-.287.143.287c.234.442.501.865.8 1.264l.112.144c1.2 1.497 2.482 2.254 3.966 2.254 2.05 0 3.553-1.22 3.553-3.433 0-.63-.121-1.388-.371-2.25-.745-2.57-1.805-5.758-3.153-9.48l-.116-.315c-.928-2.522-1.774-4.628-2.512-6.26-.166-.367-.333-.709-.502-1.033l-.493-.906C18.201 3.618 17.235 3 16 3zm0 11c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm0 2c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1z" />
        </svg>
        <span className="font-sans font-bold tracking-tight text-2xl hidden md:inline select-none">
          airbnb
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
                Where
              </p>
              <p className="text-slate text-xs truncate max-w-[100px] md:max-w-[120px]">
                {searchLocation || "Search stays"}
              </p>
            </div>
            <div className="flex-1 text-left border-r border-mist px-3 hidden sm:block">
              <p className="font-semibold text-[11px] text-carbon tracking-[0.44px] uppercase">
                When
              </p>
              <p className="text-slate text-xs truncate">
                Anytime
              </p>
            </div>
            <div className="flex-1 text-left pl-3">
              <p className="font-semibold text-[11px] text-carbon tracking-[0.44px] uppercase">
                Who
              </p>
              <p className="text-slate text-xs">
                {searchGuests > 1 ? `${searchGuests} guests` : "Add guests"}
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
                <span className="font-semibold text-carbon text-sm">Find stays & experiences</span>
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
                  <MapPin className="h-3 w-3 text-brand-coral" /> Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g. Seville, Barcelona, California, Italy"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full border border-mist rounded-lg px-3 py-2 text-sm text-carbon focus:outline-none focus:border-brand-coral"
                />
              </div>

              {/* Date Simulation Notice */}
              <div className="flex items-center gap-3 bg-fog p-3 rounded-xl border border-mist text-xs text-slate">
                <Calendar className="h-4 w-4 shrink-0 text-slate" />
                <span>Select stays freely; we offer instant booking without blackouts.</span>
              </div>

              {/* Guests Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate flex items-center gap-1">
                  <Users className="h-3 w-3 text-brand-coral" /> Number of Guests
                </label>
                <div className="flex items-center justify-between border border-mist rounded-lg px-3 py-1 bg-cloud">
                  <span className="text-sm text-carbon">{searchGuests} {searchGuests === 1 ? "Guest" : "Guests"}</span>
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
                      onClick={() => setSearchGuests(g => Math.min(16, g + 1))}
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
                  Clear Filters
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-coral hover:bg-brand-deep text-cloud font-medium py-2 rounded-lg text-sm transition"
                >
                  Apply Filters
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
          Become a Host
        </button>
        <button className="h-9 w-9 hover:bg-fog rounded-full flex items-center justify-center text-carbon transition cursor-pointer hidden md:flex">
          <Globe className="h-[18px] w-[18px] stroke-[1.5]" />
        </button>

        {/* Profile Hamburger menu button */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 border border-mist hover:shadow-md transition-shadow cursor-pointer px-3 py-1.5 rounded-full select-none bg-cloud"
          >
            <Menu className="h-[16px] w-[16px] stroke-[2] text-carbon" />
            <div className="h-8 w-8 bg-brand-coral rounded-full flex items-center justify-center text-cloud font-bold text-xs select-none">
              U
            </div>
          </button>

          {/* Profile Dropdown Panel */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-11 w-64 bg-cloud border border-mist shadow-[0_4px_18px_rgba(0,0,0,0.12)] rounded-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-mist">
                <p className="font-semibold text-carbon text-sm">Welcome back!</p>
                <p className="text-xs text-slate truncate">quanghdse180734@fpt.edu.vn</p>
              </div>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onOpenDashboard("trips");
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition flex items-center gap-2 font-medium"
              >
                <ClipboardList className="h-4 w-4 text-slate" />
                My Booked Trips
              </button>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onOpenDashboard("wishlist");
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition flex items-center gap-2 font-medium"
              >
                <Heart className="h-4 w-4 text-brand-coral fill-brand-coral" />
                My Wishlist
              </button>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onOpenDashboard("host");
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition flex items-center gap-2 font-medium"
              >
                <Sparkles className="h-4 w-4 text-brand-coral" />
                My Host Properties
              </button>

              <div className="border-t border-mist my-1"></div>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onOpenHostForm();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-carbon hover:bg-fog transition font-medium"
              >
                Create New Listing
              </button>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  resetAll();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate hover:bg-fog hover:text-carbon transition"
              >
                Reset All Data
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
