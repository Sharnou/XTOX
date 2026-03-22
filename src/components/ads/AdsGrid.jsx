import AdCard from "./AdCard";

export default function AdsGrid({ ads, isLoading, emptyMessage = "No ads found" }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
            <div className="aspect-[4/3] bg-muted" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-5 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
    </div>
  );
}
