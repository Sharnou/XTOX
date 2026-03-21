import { useState } from "react";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TRENDING = ["iPhone 15", "Toyota Camry", "Apartment Dubai", "MacBook Pro", "PS5"];

export default function HeroBanner() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/Search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-secondary" />
          <span className="text-secondary text-sm font-semibold uppercase tracking-widest">AI-Powered Global Marketplace</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
          Buy & Sell <span className="text-secondary">Anything</span>,<br />Anywhere.
        </h1>
        <p className="text-primary-foreground/70 text-lg mb-8">
          From Cairo to Dubai, New York to Paris — millions of listings at your fingertips.
        </p>

        <form onSubmit={handleSearch} className="flex bg-white rounded-2xl overflow-hidden shadow-2xl max-w-xl mx-auto mb-6">
          <Search className="w-5 h-5 text-muted-foreground ml-4 self-center flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Try "cheap iPhone in Cairo" or "villa Dubai"...'
            className="flex-1 px-3 py-4 text-foreground text-sm focus:outline-none"
          />
          <button type="submit" className="bg-secondary text-secondary-foreground font-bold px-6 hover:bg-secondary/90 transition-colors text-sm">
            Search
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <TrendingUp className="w-4 h-4 text-secondary/70" />
          <span className="text-xs text-primary-foreground/50">Trending:</span>
          {TRENDING.map(t => (
            <button
              key={t}
              onClick={() => navigate(`/Search?q=${encodeURIComponent(t)}`)}
              className="text-xs bg-white/10 hover:bg-secondary/20 hover:text-secondary px-3 py-1 rounded-full transition-all"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}