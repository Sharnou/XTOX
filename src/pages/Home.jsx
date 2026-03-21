import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import HeroBanner from "@/components/home/HeroBanner";
import CelebrationBanner from "@/components/home/CelebrationBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import AdsGrid from "@/components/ads/AdsGrid";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import AIAssistant from "@/components/ai/AIAssistant";
import AICountryDetector from "@/components/ai/AICountryDetector";

export default function Home() {
  const [country, setCountry] = useState("");
  const [featuredAds, setFeaturedAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, [country]);

  const loadAds = async () => {
    setLoading(true);
    const filter = { status: "active" };
    if (country) filter.country = country;

    // Featured: up to 16, sorted newest first per region
    const featured = await base44.entities.Ad.filter({ ...filter, is_featured: true }, "-created_date", 16);
    setFeaturedAds(featured);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry={country} onCountryChange={setCountry} />

      <AICountryDetector onDetected={setCountry} />
      <CelebrationBanner country={country} />
      <HeroBanner />
      <CategoryGrid />

      {/* Featured Ads — by region, 16 max, newest first */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-bold">
              Featured Listings {country ? `in ${country}` : ""}
            </h2>
          </div>
          <Link to="/Search?featured=true" className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <AdsGrid ads={featuredAds} isLoading={loading} emptyMessage="No featured listings yet." />
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black mb-2">Have something to sell?</h3>
            <p className="text-primary-foreground/70">Use AI to generate your listing in seconds — just upload a photo.</p>
          </div>
          <Link
            to="/Sell"
            className="bg-secondary text-secondary-foreground font-bold px-8 py-4 rounded-2xl hover:bg-secondary/90 transition-colors whitespace-nowrap text-lg"
          >
            + Post Free Ad
          </Link>
        </div>
      </section>

      <XTOXFooter />
      <AIAssistant detectedCountry={country} />
    </div>
  );
}