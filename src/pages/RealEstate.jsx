import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import AdsGrid from "@/components/ads/AdsGrid";
import { Home } from "lucide-react";

const SUBS = ["All", "Apartments", "Villas", "Commercial", "Land", "Vacation Homes"];

export default function RealEstate() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState("All");
  const [country, setCountry] = useState("");
  const urlParams = new URLSearchParams(window.location.search);
  const defaultSub = urlParams.get("sub") || "All";

  useEffect(() => { setSub(defaultSub); }, []);
  useEffect(() => { load(); }, [sub, country]);

  const load = async () => {
    setLoading(true);
    const filter = { status: "active", category: "real_estate" };
    if (sub !== "All") filter.subcategory = sub;
    if (country) filter.country = country;
    const results = await base44.entities.Ad.filter(filter, "-created_date", 40);
    setAds(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry={country} onCountryChange={setCountry} />
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Home className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-black">Real Estate</h1>
          </div>
          <p className="text-white/70">Apartments, villas, commercial, land and more</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {SUBS.map(s => (
            <button key={s} onClick={() => setSub(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${sub === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>
              {s}
            </button>
          ))}
        </div>
        <AdsGrid ads={ads} isLoading={loading} emptyMessage="No real estate listings found." />
      </div>
      <XTOXFooter />
    </div>
  );
}