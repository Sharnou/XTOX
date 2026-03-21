import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MessageSquare, Heart, ChevronDown, Globe, Menu, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";

const COUNTRIES = ["Egypt", "UAE", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman", "Jordan", "Morocco", "USA", "UK", "France", "Germany", "Canada", "Australia"];

export default function XTOXHeader({ selectedCountry, onCountryChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countryDropdown, setCountryDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/Search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
          <div className="text-2xl font-black tracking-tight leading-none">
            <span className="text-secondary">▲</span>
            <span className="text-primary-foreground ml-1">XTOX</span>
          </div>
        </Link>

        {/* Country Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setCountryDropdown(!countryDropdown)}
            className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{selectedCountry || "Global"}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {countryDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white text-foreground rounded-xl shadow-2xl border border-border w-48 py-2 z-50">
              {/* Only show "All Countries" for admins — regular users are locked to region */}
              {COUNTRIES.map(c => (
                <div
                  key={c}
                  className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                  onClick={() => { onCountryChange(c); setCountryDropdown(false); }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for anything..."
              className="w-full bg-white text-foreground pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary border-0"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Link to="/Favorites" className="hidden md:flex p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/Messages" className="hidden md:flex p-2 hover:bg-white/10 rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5" />
              </Link>
              <div className="hidden md:flex">
                <NotificationBell />
              </div>
              <Link to="/Dashboard" className="hidden md:flex items-center gap-2 text-sm hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
                  {user.full_name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden lg:block">{user.full_name?.split(" ")[0]}</span>
              </Link>
            </>
          ) : (
            <button
              onClick={() => base44.auth.redirectToLogin()}
              className="hidden md:flex text-sm hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              Login
            </button>
          )}

          <Link
            to="/Sell"
            className="bg-secondary text-secondary-foreground font-semibold px-4 py-2 rounded-xl text-sm hover:bg-secondary/90 transition-colors whitespace-nowrap"
          >
            + Sell
          </Link>

          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Category Nav Bar */}
      <div className="bg-primary/80 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto scrollbar-hide py-1">
          {[
            { label: "🚗 Vehicles", path: "/Vehicles" },
            { label: "📱 Electronics", path: "/Electronics" },
            { label: "🏠 Real Estate", path: "/RealEstate" },
            { label: "💼 Jobs", path: "/Search?category=jobs" },
            { label: "🐾 Pets", path: "/Search?category=pets" },
            { label: "🔧 Services", path: "/Search?category=services" },
            { label: "🛋 Furniture", path: "/Search?category=furniture" },
            { label: "👗 Fashion", path: "/Search?category=fashion" },
            { label: "⚽ Sports", path: "/Search?category=sports" },
            { label: "📚 Books", path: "/Search?category=books" },
            { label: "📦 Other", path: "/Search?category=other" },
          ].map(item => (
            <Link
              key={item.label}
              to={item.path}
              className="text-xs font-medium text-primary-foreground/80 hover:text-secondary whitespace-nowrap px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary/95 border-t border-white/10 px-4 py-3 flex flex-col gap-2">
          {user ? (
            <>
              <Link to="/Dashboard" className="py-2 text-sm hover:text-secondary" onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>
              <Link to="/Favorites" className="py-2 text-sm hover:text-secondary" onClick={() => setMobileMenuOpen(false)}>Favorites</Link>
              <Link to="/Messages" className="py-2 text-sm hover:text-secondary" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
            </>
          ) : (
            <button onClick={() => base44.auth.redirectToLogin()} className="text-left py-2 text-sm hover:text-secondary">Login / Register</button>
          )}
          <div className="border-t border-white/10 pt-2 mt-1">
            <p className="text-xs text-primary-foreground/60 mb-2">Select Country</p>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.slice(0, 6).map(c => (
                <button
                  key={c}
                  onClick={() => { onCountryChange(c); setMobileMenuOpen(false); }}
                  className={`text-xs px-3 py-1 rounded-full border border-white/20 ${selectedCountry === c ? "bg-secondary text-secondary-foreground" : "hover:bg-white/10"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}