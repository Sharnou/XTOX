import { useState } from "react";
import { Heart, MapPin, Eye, Star, Zap, MessageCircle, Play, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import AdChatWindow from "@/components/chat/AdChatWindow";
import AdMediaViewer from "@/components/ads/AdMediaViewer";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const PLACEHOLDERS = {
  vehicles: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop",
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
  real_estate: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
  pets: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop",
  jobs: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
  furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
  fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
};

export default function AdCard({ ad, onFavoriteToggle, isFavorited = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorited, setFavorited] = useState(isFavorited);
  const [imgError, setImgError] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { base44.auth.redirectToLogin(); return; }
    setFavorited(!favorited);
    onFavoriteToggle?.(ad.id, !favorited);
  };

  const openChat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { base44.auth.redirectToLogin(); return; }
    setChatOpen(true);
  };

  const openMedia = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMediaOpen(true);
  };

  const mainImage = ad.images?.[0];
  const displayImage = (!imgError && mainImage) ? mainImage : (PLACEHOLDERS[ad.category] || PLACEHOLDERS.electronics);
  const isOwner = user && ad.created_by === user?.email;
  const publishDate = ad.created_date ? new Date(ad.created_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";
  const hasMedia = (ad.images?.length > 0) || ad.video_url;
  const sellerOnline = useOnlineStatus(ad.created_by);
  const mediaCount = (ad.images?.length || 0) + (ad.video_url ? 1 : 0);
  const firstMedia = ad.video_url || ad.images?.[0];

  return (
    <>
      <div
        className={`bg-card rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${ad.is_featured ? "border-secondary shadow-secondary/20 shadow-md" : "border-border hover:border-primary/20"}`}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3]" onClick={() => navigate(`/Ad/${ad.id}`)}>
          {ad.video_url ? (
            <video
              src={ad.video_url}
              controls
              className="w-full h-full object-cover"
              poster={displayImage}
            />
          ) : (
            <img
              src={displayImage}
              alt={ad.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          )}
          {ad.is_featured && (
            <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <Star className="w-3 h-3" /> Featured
            </div>
          )}
          {ad.ai_generated && (
            <div className="absolute top-2 left-20 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded-lg flex items-center gap-1">
              <Zap className="w-3 h-3 text-secondary" /> AI
            </div>
          )}

          {/* Media count / view button */}
          {hasMedia && (
            <button
              onClick={openMedia}
              className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-black/80 transition-colors"
            >
              {ad.video_url ? <Play className="w-3 h-3" /> : null}
              {mediaCount > 1 ? `${mediaCount} media` : ad.video_url ? "Video" : "View"}
            </button>
          )}

          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow transition-all"
          >
            <Heart className={`w-4 h-4 transition-colors ${favorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3" onClick={() => navigate(`/Ad/${ad.id}`)}>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 hover:text-primary transition-colors mb-1">
            {ad.title}
          </h3>
          <p className="text-primary font-bold text-base">
            {ad.price ? `${ad.price.toLocaleString()} ${ad.currency || "USD"}` : "Price on request"}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin className="w-3 h-3" />
              <span>{ad.city ? `${ad.city}, ` : ""}{ad.country || "Global"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{ad.views_count || 0}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            {publishDate && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Calendar className="w-3 h-3" />
                <span>{publishDate}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs ml-auto">
              <div className={`w-1.5 h-1.5 rounded-full ${sellerOnline ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-muted-foreground">{sellerOnline ? "Online" : "Offline"}</span>
            </div>
          </div>
        </div>

        {/* Bottom bar: chat button always visible */}
        <div className="px-3 pb-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {!isOwner && (
            <button
              onClick={openChat}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-primary text-primary-foreground py-1.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <MessageCircle className="w-3 h-3" /> Chat
            </button>
          )}
          {isOwner && (
            <span className="text-xs text-muted-foreground italic">Your listing</span>
          )}
        </div>
      </div>

      {chatOpen && <AdChatWindow ad={ad} onClose={() => setChatOpen(false)} />}
      {mediaOpen && <AdMediaViewer images={ad.images || []} video={ad.video_url} onClose={() => setMediaOpen(false)} />}
    </>
  );
}
