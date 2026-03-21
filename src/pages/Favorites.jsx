import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import AdsGrid from "@/components/ads/AdsGrid";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Favorites() {
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { base44.auth.redirectToLogin("/Favorites"); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const favs = await base44.entities.Favorite.filter({ user_email: user.email }, "-created_date", 50);
    if (favs.length === 0) { setAds([]); setLoading(false); return; }
    const adIds = favs.map(f => f.ad_id);
    const allAds = await base44.entities.Ad.list("-created_date", 200);
    setAds(allAds.filter(a => adIds.includes(a.id)));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black">My Favorites</h1>
            <p className="text-muted-foreground text-sm">{ads.length} saved listings</p>
          </div>
        </div>
        {!loading && ads.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No favorites yet</p>
            <p className="text-sm mb-4">Save listings you like by tapping the heart icon</p>
            <Link to="/Home" className="text-primary text-sm hover:underline">Browse listings →</Link>
          </div>
        ) : (
          <AdsGrid ads={ads} isLoading={loading} />
        )}
      </div>
      <XTOXFooter />
    </div>
  );
}