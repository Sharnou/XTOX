import { useState, useEffect } from "react";
import { base44 } from "@/api/XTOXClient";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import AdsGrid from "@/components/ads/AdsGrid";
import { Car } from "lucide-react";

const SUBS = ["All", "Cars", "Motorcycles", "Trucks", "Spare Parts", "Boats"];

export default function Vehicles() {
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
    const filter = { status: "active", category: "vehicles" };
    if (sub !== "All") filter.subcategory = sub;
    if (country) filter.country = country;
    const results = await base44.entities.Ad.filter(filter, "-created_date", 40);
    setAds(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry={country} onCountryChange={setCountry} />
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Car className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-black">Vehicles</h1>
          </div>
          <p className="text-white/70">Find cars, motorcycles, trucks and more</p>
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
        <AdsGrid ads={ads} isLoading={loading} emptyMessage="No vehicle listings found." />
      </div>
      <XTOXFooter />
    </div>
  );
}
