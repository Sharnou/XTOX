import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useParams } from "react-router-dom";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import LeaveCommentWindow from "@/components/reviews/LeaveCommentWindow";
import SellerReviews from "@/components/reviews/SellerReviews";
import AdChatWindow from "@/components/chat/AdChatWindow";
import { Heart, MapPin, Eye, Star, Zap, ChevronLeft, ChevronRight, Share2, Shield, MessageCircle, MessageSquare, Phone, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    base44.entities.Ad.filter({ id }, "-created_date", 1).then(async ([found]) => {
      if (found) {
        setAd(found);
        // increment views
        base44.entities.Ad.update(found.id, { views_count: (found.views_count || 0) + 1 });
        // check if favorited
        if (user) {
          const favs = await base44.entities.Favorite.filter({ ad_id: found.id, user_email: user.email }, "-created_date", 1);
          setFavorited(favs.length > 0);
        }
      }
      setLoading(false);
    });
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    if (favorited) {
      const favs = await base44.entities.Favorite.filter({ ad_id: ad.id, user_email: user.email }, "-created_date", 1);
      if (favs[0]) await base44.entities.Favorite.delete(favs[0].id);
    } else {
      await base44.entities.Favorite.create({ ad_id: ad.id, user_email: user.email });
    }
    setFavorited(!favorited);
    toast.success(favorited ? "Removed from favorites" : "Added to favorites");
  };

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const placeholderImages = {
    vehicles: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
    electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop",
    real_estate: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
  };

  if (loading) return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="h-80 bg-muted rounded-2xl animate-pulse" />
        <div className="h-6 bg-muted rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
      </div>
    </div>
  );

  if (!ad) return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />
      <div className="text-center py-20 text-muted-foreground">Ad not found.</div>
      <XTOXFooter />
    </div>
  );

  const images = ad.images?.length ? ad.images : [placeholderImages[ad.category] || placeholderImages.electronics];
  const isOwner = ad.created_by === user?.email;

  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Images + Details */}
          <div className="md:col-span-2 space-y-4">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[4/3]">
              <img src={images[imgIndex]} alt={ad.title} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? "bg-white scale-125" : "bg-white/50"}`} />
                    ))}
                  </div>
                </>
              )}
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {ad.is_featured && <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}
                {ad.ai_generated && <span className="bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded-lg flex items-center gap-1"><Zap className="w-3 h-3 text-secondary" /> AI Generated</span>}
              </div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIndex(i)} className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === imgIndex ? "border-primary" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-black leading-tight">{ad.title}</h1>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={toggleFavorite} className={`p-2 rounded-xl border transition-all ${favorited ? "bg-red-50 border-red-200 text-red-500" : "border-border hover:bg-muted"}`}>
                    <Heart className={`w-5 h-5 ${favorited ? "fill-red-500" : ""}`} />
                  </button>
                  <button onClick={share} className="p-2 rounded-xl border border-border hover:bg-muted transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-3xl font-black text-primary mt-2">
                {ad.price ? `${ad.price.toLocaleString()} ${ad.currency || "USD"}` : "Price on request"}
              </p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{ad.city ? `${ad.city}, ` : ""}{ad.country}</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{ad.views_count || 0} views</span>
                {ad.condition && <span className="capitalize bg-muted px-2 py-0.5 rounded-full">{ad.condition.replace("_", " ")}</span>}
                <span className="capitalize bg-muted px-2 py-0.5 rounded-full">{ad.category?.replace("_", " ")}</span>
              </div>
            </div>

            {/* Description */}
            {ad.description && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <h3 className="font-bold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{ad.description}</p>
              </div>
            )}

            {/* Seller Reviews */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-bold mb-3">Seller Reviews</h3>
              <SellerReviews sellerEmail={ad.created_by} />
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-yellow-600" />
                <h4 className="font-semibold text-sm text-yellow-800">Safety Tips</h4>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Meet in a safe, public place</li>
                <li>• Never send money in advance</li>
                <li>• Verify the item before paying</li>
                <li>• Report suspicious behavior</li>
              </ul>
            </div>
          </div>

          {/* Right: Seller Card + Actions */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-4 sticky top-20">
              {/* Seller */}
              <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
                  {ad.created_by?.[0]?.toUpperCase() || "S"}
                </div>
                <div>
                  <p className="font-bold text-sm">{ad.created_by?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground">Seller</p>
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwner ? (
                <div className="space-y-2">
                  <button
                    onClick={() => { if (!user) { base44.auth.redirectToLogin(); return; } setChatOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl hover:bg-primary/90 transition-colors font-semibold"
                  >
                    <MessageCircle className="w-4 h-4" /> Chat with Seller
                  </button>
                  <button
                    onClick={() => { if (!user) { base44.auth.redirectToLogin(); return; } setCommentOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-3 rounded-xl hover:bg-secondary/90 transition-colors font-semibold"
                  >
                    <MessageSquare className="w-4 h-4" /> Leave a Comment
                  </button>
                  {ad.contact_phone && (
                    <a href={`tel:${ad.contact_phone}`}
                      className="w-full flex items-center justify-center gap-2 border border-border py-3 rounded-xl hover:bg-muted transition-colors font-semibold text-sm">
                      <Phone className="w-4 h-4" /> {ad.contact_phone}
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-2">This is your listing</div>
              )}

              {/* Ad Details */}
              <div className="mt-4 space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">{ad.category?.replace("_", " ")}</span>
                </div>
                {ad.subcategory && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subcategory</span>
                    <span className="font-medium">{ad.subcategory}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium capitalize ${ad.status === "active" ? "text-green-600" : "text-muted-foreground"}`}>{ad.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <XTOXFooter />
      {chatOpen && <AdChatWindow ad={ad} onClose={() => setChatOpen(false)} />}
      {commentOpen && <LeaveCommentWindow ad={ad} onClose={() => setCommentOpen(false)} onReviewed={() => {}} />}
    </div>
  );
}