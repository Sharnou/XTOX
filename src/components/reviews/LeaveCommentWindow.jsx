import { useState } from "react";
import { XTOX } from "@/api/XTOXClient";
import { useAuth } from "@/lib/AuthContext";
import { X, Star, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LeaveCommentWindow({ ad, onClose, onReviewed }) {
  const { user } = useAuth();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const starLabels = ["Block seller", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  const handleSubmit = async () => {
    if (!user) { XTOX.auth.redirectToLogin(); return; }
    if (stars === 0 && !comment.trim()) return;
    setSaving(true);

    // Save review
    await XTOX.entities.SellerReview.create({
      seller_email: ad.created_by,
      reviewer_email: user.email,
      ad_id: ad.id,
      stars,
      comment: comment.trim(),
    });

    // Apply effect on ad views_count based on stars
    let viewsDelta = 0;
    if (stars >= 4) viewsDelta = 10;       // 4-5 stars: boost views
    else if (stars >= 2) viewsDelta = 2;   // 2-3 stars: slight boost
    else if (stars === 1) viewsDelta = -15; // 1 star: reduce views
    // 0 stars: block seller â€” handled via status
    if (stars === 0) {
      await XTOX.entities.Ad.update(ad.id, { status: "blocked" });
      toast.error("Seller has been reported and blocked.");
    } else {
      const newViews = Math.max(0, (ad.views_count || 0) + viewsDelta);
      await XTOX.entities.Ad.update(ad.id, { views_count: newViews });
      toast.success("Review submitted! Thank you.");
    }

    setSaving(false);
    onReviewed?.();
    onClose();
  };

  const displayStars = hovered || stars;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-bold text-base">Leave a Comment</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[260px]">{ad.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Star Rating */}
          <div>
            <p className="text-sm font-semibold mb-3">Rate this seller</p>
            <div className="flex gap-2 items-center">
              {/* 0 star = block */}
              <button
                onClick={() => setStars(0)}
                onMouseEnter={() => setHovered(0)}
                onMouseLeave={() => setHovered(0)}
                className={`text-xs px-2 py-1 rounded-lg border transition-all ${stars === 0 ? "bg-red-500 text-white border-red-500" : "border-border text-muted-foreground hover:border-red-400 hover:text-red-500"}`}
              >
                ðŸš« Block
              </button>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${s <= displayStars ? "fill-secondary text-secondary" : "text-muted-foreground/40"}`}
                  />
                </button>
              ))}
            </div>
            {displayStars > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">{starLabels[displayStars]}</p>
            )}
            {stars === 0 && comment.trim() === "" && (
              <p className="text-xs text-red-500 mt-1.5 ml-1">âš  0 stars will block this seller permanently</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-semibold block mb-2">Your Comment</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this seller..."
              rows={3}
              className="w-full bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving || (stars === 0 && !comment.trim())}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors font-semibold text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {saving ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

