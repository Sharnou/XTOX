import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MessageSquare, Heart, Globe, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useUserCountry } from "@/hooks/useUserCountry";

const COUNTRIES = ["Egypt", "UAE", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman", "Jordan", "Morocco", "USA", "UK", "France", "Germany", "Canada", "Australia"];

export default function XTOXHeader({ selectedCountry, onCountryChange }) {
  const { user, login, logout } = useAuth();
  const { country: autoCountry } = useUserCountry();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const displayCountry = selectedCountry || autoCountry || "Your region";
  const [lang, setLang] = useState("English");

  useEffect(() => {
    const saved = localStorage.getItem("xtox_lang");
    if (saved) {
      applyLang(saved);
      setLang(saved);
    } else if (autoCountry === "Germany") {
      applyLang("Deutsch");
      setLang("Deutsch");
    } else if (["Egypt", "Saudi Arabia", "UAE", "Kuwait", "Qatar", "Bahrain", "Oman", "Jordan", "Morocco"].includes(autoCountry)) {
      applyLang("عربي");
      setLang("عربي");
    }
  }, [autoCountry]);

  const applyLang = (label) => {
    if (label === "عربي") {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
      document.body.classList.add("rtl");
    } else if (label === "Deutsch") {
      document.documentElement.lang = "de";
      document.documentElement.dir = "ltr";
      document.body.classList.remove("rtl");
    } else {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
      document.body.classList.remove("rtl");
    }
    localStorage.setItem("xtox_lang", label);
  };

  const cycleLang = () => {
    const next = lang === "English" ? (autoCountry === "Germany" ? "Deutsch" : "عربي") : "English";
    setLang(next);
    applyLang(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/Search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
          <div className="text-2xl font-black tracking-tight leading-none">
            <span className="text-secondary">â–²</span>
            <span className="text-primary-foreground ml-1">XTOX</span>
          </div>
        </Link>

        {/* Region (admin can change, users locked) */}
        <div className="relative hidden md:block">
          {isAdmin ? (
            <select
              value={displayCountry}
              onChange={e => onCountryChange?.(e.target.value)}
              className="text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-primary-foreground"
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <div className="flex items-center gap-2 text-sm text-primary-foreground/80 bg-white/10 px-3 py-2 rounded-lg">
              <Globe className="w-4 h-4" />
              <span>{displayCountry}</span>
            </div>
          )}
        </div>

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

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={cycleLang}
            className="flex text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
            title="Translate page direction & language"
          >
            {lang}
          </button>
          {user ? (
            <>
              <Link to="/Favorites" className="hidden md:flex p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/Messages" className="hidden md:flex p-2 hover:bg-white/10 rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5" />
              </Link>
              <div className="flex">
                <NotificationBell />
              </div>
              <Link to="/Dashboard" className="hidden md:flex items-center gap-2 text-sm hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
                  {user.full_name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden lg:block">{user.full_name?.split(" ")[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="hidden md:flex text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => login("demo@xtox.app", "demo")}
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
    </header>
  );
}


