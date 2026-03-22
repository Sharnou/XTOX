import { useState, useEffect } from "react";
import { base44 } from "@/api/XTOXClient";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import AdsGrid from "@/components/ads/AdsGrid";
import { SlidersHorizontal, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserCountry } from "@/hooks/useUserCountry";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "vehicles", label: "ðŸš— Vehicles" },
  { value: "electronics", label: "ðŸ“± Electronics" },
  { value: "real_estate", label: "ðŸ  Real Estate" },
  { value: "jobs", label: "ðŸ’¼ Jobs" },
  { value: "pets", label: "ðŸ¾ Pets" },
  { value: "services", label: "ðŸ”§ Services" },
  { value: "furniture", label: "ðŸ›‹ Furniture" },
  { value: "fashion", label: "ðŸ‘— Fashion" },
  { value: "sports", label: "âš½ Sports" },
  { value: "books", label: "ðŸ“š Books" },
  { value: "other", label: "ðŸ“¦ Other" },
];
const COUNTRIES = ["", "Egypt", "UAE", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman", "Jordan", "USA", "UK", "France", "Germany", "Canada", "Australia"];
const SORT_OPTIONS = [
  { value: "-created_date", label: "Newest First" },
  { value: "created_date", label: "Oldest First" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
];

export default function Search() {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { country: lockedCountry } = useUserCountry();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("-created_date");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const queryParam = urlParams.get("q") || "";
  const featuredParam = urlParams.get("featured") === "true";
  const categoryParam = urlParams.get("category") || "";

  useEffect(() => {
    if (categoryParam && !category) setCategory(categoryParam);
  }, []);

  useEffect(() => {
    loadAds();
  }, [lockedCountry, category, sortBy, city]);

  const loadAds = async () => {
    setLoading(true);
    const filter = { status: "active" };
    if (lockedCountry) filter.country = lockedCountry;
    if (city) filter.city = city;
    if (category) filter.category = category;
    if (featuredParam) filter.is_featured = true;
    const results = await base44.entities.Ad.filter(filter, sortBy, 40);
    setAds(results);
    setLoading(false);
  };

  const filteredAds = ads.filter(ad => {
    const matchesQuery = !queryParam || 
      ad.title?.toLowerCase().includes(queryParam.toLowerCase()) ||
      ad.description?.toLowerCase().includes(queryParam.toLowerCase()) ||
      ad.city?.toLowerCase().includes(queryParam.toLowerCase());
    const matchesMin = !minPrice || (ad.price >= parseFloat(minPrice));
    const matchesMax = !maxPrice || (ad.price <= parseFloat(maxPrice));
    return matchesQuery && matchesMin && matchesMax;
  });

  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry={lockedCountry} onCountryChange={() => {}} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {queryParam && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Results for "<span className="text-primary">{queryParam}</span>"</h1>
            <p className="text-muted-foreground text-sm mt-1">{filteredAds.length} listings found</p>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {CATEGORIES.slice(1).map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(category === c.value ? "" : c.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${category === c.value ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">City</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Cairo, Dubai..." className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">Min Price</label>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">Max Price</label>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="999999" className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
          </div>
        )}

        <AdsGrid ads={filteredAds} isLoading={loading} emptyMessage="No listings match your search." />
      </div>

      <XTOXFooter />
    </div>
  );
}

