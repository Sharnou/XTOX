import { useState, useEffect } from "react";
import { base44 } from "@/api/XTOXClient";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import { Eye, MessageSquare, Plus, Trash2, Clock, RefreshCw, Download, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  expired: "bg-orange-100 text-orange-700",
  blocked: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  sold: "bg-blue-100 text-blue-700",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState("ads");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!user) { base44.auth.redirectToLogin("/Dashboard"); return; }
    loadData();
    // Check for expired ads on load
    checkExpiredAds();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [myAds, myMsgs] = await Promise.all([
      base44.entities.Ad.filter({ created_by: user.email }, "-created_date", 50),
      base44.entities.Message.filter({ receiver_email: user.email }, "-created_date", 50),
    ]);
    setAds(myAds);
    setMessages(myMsgs);
    setLoading(false);
  };

  const checkExpiredAds = async () => {
    const myAds = await base44.entities.Ad.filter({ created_by: user.email, status: "active" }, "-created_date", 100);
    const now = new Date();
    for (const ad of myAds) {
      if (!ad.expires_at) continue;
      const expiresAt = new Date(ad.expires_at);
      if (now > expiresAt) {
        // Mark as expired
        await base44.entities.Ad.update(ad.id, { status: "expired", expired_notified_at: now.toISOString() });
        // Notify seller via email
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `â° Your XTOX ad has expired: "${ad.title}"`,
          body: `Hello ${user.full_name || "there"},\n\nYour ad "${ad.title}" has expired after 30 days.\n\nYou have 10 days to reactivate it from your Dashboard, otherwise it will be permanently deleted.\n\nLogin to reactivate: https://xtox.base44.app/Dashboard\n\nBest,\nXTOX Team`
        });
      }
    }
    // Auto-delete expired ads older than 10 days
    const expiredAds = await base44.entities.Ad.filter({ created_by: user.email, status: "expired" }, "-created_date", 100);
    for (const ad of expiredAds) {
      if (!ad.expired_notified_at) continue;
      const notifiedAt = new Date(ad.expired_notified_at);
      const daysSince = (now - notifiedAt) / (1000 * 60 * 60 * 24);
      if (daysSince >= 10) {
        await base44.entities.Ad.delete(ad.id);
      }
    }
    loadData();
  };

  const deleteAd = async (id) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    await base44.entities.Ad.delete(id);
    setAds(prev => prev.filter(a => a.id !== id));
    toast.success("Ad deleted.");
  };

  const reactivateAd = async (ad) => {
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);
    await base44.entities.Ad.update(ad.id, { status: "active", expires_at: newExpiry.toISOString(), expired_notified_at: null });
    toast.success("Ad reactivated for 30 more days!");
    loadData();
  };

  const exportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const [allAds, allMsgs, allReviews, allFavs] = await Promise.all([
        base44.entities.Ad.filter({ created_by: user.email }, "-created_date", 200),
        base44.entities.Message.filter({ sender_email: user.email }, "-created_date", 200),
        base44.entities.SellerReview.filter({ seller_email: user.email }, "-created_date", 200),
        base44.entities.Favorite.filter({ user_email: user.email }, "-created_date", 200),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user: { email: user.email, name: user.full_name },
        ads: allAds,
        messages: allMsgs,
        reviews: allReviews,
        favorites: allFavs,
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `xtox-data-${user.email}-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Also send via email
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "ðŸ“¦ Your XTOX Data Export",
        body: `Hello ${user.full_name || "there"},\n\nYour data export has been downloaded to your device.\n\nSummary:\n- Ads: ${allAds.length}\n- Messages sent: ${allMsgs.length}\n- Reviews received: ${allReviews.length}\n- Favorites: ${allFavs.length}\n\nFor a full export with attachments, please contact support.\n\nBest,\nXTOX Team`
      });

      toast.success("Data exported & summary sent to your email!");
    } catch (e) {
      toast.error("Export failed. Please try again.");
    }
    setExporting(false);
  };

  const daysLeft = (ad) => {
    if (!ad.expires_at) return null;
    const diff = new Date(ad.expires_at) - new Date();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black">My Dashboard</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={exportData}
              disabled={exporting}
              className="flex items-center gap-2 border border-border px-4 py-2 rounded-xl text-sm hover:bg-muted transition-colors"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export My Data
            </button>
            {user?.role === "admin" && (
              <Link to="/Admin" className="flex items-center gap-2 border border-border px-4 py-2 rounded-xl text-sm hover:bg-muted transition-colors">
                Admin Panel
              </Link>
            )}
            <Link to="/Sell" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> New Ad
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Ads", value: ads.filter(a => a.status === "active").length, icon: Eye, color: "text-green-600" },
            { label: "Expired", value: ads.filter(a => a.status === "expired").length, icon: Clock, color: "text-orange-500" },
            { label: "Unread Messages", value: unreadCount, icon: MessageSquare, color: "text-blue-500" },
            { label: "Total Views", value: ads.reduce((s, a) => s + (a.views_count || 0), 0), icon: Eye, color: "text-primary" },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-2xl border border-border p-4">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {["ads", "messages"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t === "messages" ? `Messages${unreadCount ? ` (${unreadCount})` : ""}` : "My Ads"}
            </button>
          ))}
        </div>

        {/* Ads Tab */}
        {tab === "ads" && (
          <div className="space-y-3">
            {ads.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="mb-4">No ads yet.</p>
                <Link to="/Sell" className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90">Post Your First Ad</Link>
              </div>
            ) : ads.map(ad => {
              const days = daysLeft(ad);
              return (
                <div key={ad.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
                  {ad.images?.[0] && (
                    <img src={ad.images[0]} alt={ad.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{ad.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1 items-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ad.status] || "bg-muted text-muted-foreground"}`}>
                        {ad.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{ad.views_count || 0} views</span>
                      {ad.status === "active" && days !== null && (
                        <span className={`text-xs flex items-center gap-1 ${days <= 5 ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
                          <Clock className="w-3 h-3" /> {days}d left
                        </span>
                      )}
                      {ad.status === "expired" && (
                        <span className="text-xs text-orange-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Reactivate within 10 days or it will be deleted
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {ad.status === "expired" && (
                      <button onClick={() => reactivateAd(ad)} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                        <RefreshCw className="w-3 h-3" /> Reactivate
                      </button>
                    )}
                    <button onClick={() => deleteAd(ad.id)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Messages Tab */}
        {tab === "messages" && (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">No messages yet.</div>
            ) : messages.map(msg => (
              <div key={msg.id} className={`bg-card rounded-2xl border p-4 ${!msg.is_read ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{msg.sender_email?.split("@")[0]}</p>
                  {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                </div>
                <p className="text-sm text-muted-foreground">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(msg.created_date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <XTOXFooter />
    </div>
  );
}
