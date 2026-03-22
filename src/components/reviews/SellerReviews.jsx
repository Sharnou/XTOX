import { useState, useEffect } from "react";
import { base44 } from "@/api/XTOXClient";
import { Star } from "lucide-react";

export default function SellerReviews({ sellerEmail }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerEmail) return;
    base44.entities.SellerReview.filter({ seller_email: sellerEmail }, "-created_date", 20)
      .then(r => { setReviews(r); setLoading(false); });
  }, [sellerEmail]);

  if (loading) return <div className="h-8 bg-muted rounded-xl animate-pulse w-32" />;
  if (reviews.length === 0) return <p className="text-xs text-muted-foreground">No reviews yet</p>;

  const avg = reviews.filter(r => r.stars > 0).reduce((s, r) => s + r.stars, 0) / (reviews.filter(r => r.stars > 0).length || 1);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`w-4 h-4 ${s <= Math.round(avg) ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />
          ))}
        </div>
        <span className="text-sm font-bold">{avg.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
      </div>

      {/* Review list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {reviews.map(r => (
          <div key={r.id} className="bg-muted rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex">
                {r.stars === 0 ? (
                  <span className="text-xs text-red-500 font-semibold">ðŸš« Blocked</span>
                ) : [1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-3 h-3 ${s <= r.stars ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{r.reviewer_email?.split("@")[0]}</span>
            </div>
            {r.comment && <p className="text-xs text-foreground leading-relaxed">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
