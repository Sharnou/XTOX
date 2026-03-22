import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { XTOX } from "@/api/XTOXClient";
import { useAuth } from "@/lib/AuthContext";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import AdminStats from "@/components/admin/AdminStats";
import AdminAdRow from "@/components/admin/AdminAdRow";
import { Shield, Users, FileText, Search, Zap, AlertTriangle, Send, Code2, ArrowLeft, MessageSquare } from "lucide-react";
import AdminBroadcast from "@/components/admin/AdminBroadcast";
import AIDeveloperChat from "@/components/admin/AIDeveloperChat";
import AdminChatInbox from "@/components/admin/AdminChatInbox";

const SUPER_ADMIN = "Ahmed_sharnou@yahoo.com";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ads");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  useEffect(() => {
    if (!user) { XTOX.auth.redirectToLogin("/Admin"); return; }
    if (user.email !== SUPER_ADMIN && user.role !== "admin") { navigate("/"); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const [allAds, allUsers] = await Promise.all([
      XTOX.entities.Ad.list("-created_date", 100),
      XTOX.entities.User.list("-created_date", 50),
    ]);
    setAds(allAds);
    setUsers(allUsers);
    setLoading(false);
  };

  const runAIModeration = async () => {
    setAiAnalyzing(true);
    const pendingAds = ads.filter(a => a.status === "pending" || a.status === "active").slice(0, 10);
    const report = await XTOX.integrations.Core.InvokeLLM({
      prompt: `You are an AI content moderator for XTOX marketplace.
Review these ${pendingAds.length} ad listings and identify any that are suspicious, fraudulent, or policy-violating.
Ads: ${JSON.stringify(pendingAds.map(a => ({ id: a.id, title: a.title, description: a.description, price: a.price, category: a.category })))}
Return JSON with: summary (string), suspicious_ids (array of ad IDs), recommendations (array of strings).`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          suspicious_ids: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });
    setAiReport(report);
    setAiAnalyzing(false);
  };

  const stats = {
    total_users: users.length,
    total_ads: ads.length,
    active_ads: ads.filter(a => a.status === "active").length,
    featured_ads: ads.filter(a => a.is_featured).length,
    blocked_ads: ads.filter(a => a.status === "blocked").length,
    pending_ads: ads.filter(a => a.status === "pending").length,
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = !search || ad.title?.toLowerCase().includes(search.toLowerCase()) || ad.country?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user || (user.email !== SUPER_ADMIN && user.role !== "admin")) return null;

  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Super Admin Panel</h1>
              <p className="text-muted-foreground text-sm">Full platform control â€” {user?.email}</p>
            </div>
          </div>
          <button
            onClick={runAIModeration}
            disabled={aiAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-semibold hover:bg-secondary/90 disabled:opacity-60"
          >
            <Zap className="w-4 h-4" />
            {aiAnalyzing ? "Running AI Scan..." : "Run AI Moderation"}
          </button>
        </div>

        {/* Stats */}
        <AdminStats stats={stats} />

        {/* AI Report */}
        {aiReport && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-orange-800">AI Moderation Report</h3>
            </div>
            <p className="text-sm text-orange-700 mb-3">{aiReport.summary}</p>
            {aiReport.suspicious_ids?.length > 0 && (
              <p className="text-sm font-semibold text-orange-800 mb-2">Suspicious Ad IDs: {aiReport.suspicious_ids.join(", ")}</p>
            )}
            {aiReport.recommendations?.map((r, i) => (
              <p key={i} className="text-xs text-orange-600 mb-1">â€¢ {r}</p>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-8 mb-6 bg-muted p-1 rounded-xl w-fit">
          {[
            { key: "ads", label: "Manage Ads", icon: FileText },
            { key: "users", label: "Manage Users", icon: Users },
            { key: "broadcast", label: "Broadcast", icon: Send },
            { key: "chat", label: "User Chats", icon: MessageSquare },
            { key: "ai_dev", label: "AI Developer", icon: Code2 },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Ads Tab */}
        {tab === "ads" && (
          <div>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ads..."
                  className="w-full border border-input rounded-xl pl-9 pr-4 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="border border-input rounded-xl px-3 py-2 text-sm bg-card">
                <option value="">All Status</option>
                {["active", "pending", "blocked", "sold"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted text-muted-foreground border-b border-border">
                      <th className="text-left py-3 px-4">Ad</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Featured</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="py-4 px-4"><div className="h-8 bg-muted rounded animate-pulse" /></td></tr>
                      ))
                    ) : filteredAds.map(ad => (
                      <AdminAdRow key={ad.id} ad={ad} onUpdate={load} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {tab === "broadcast" && <AdminBroadcast users={users} />}

        {/* User Chats Tab */}
        {tab === "chat" && <AdminChatInbox />}

        {/* AI Developer Tab */}
        {tab === "ai_dev" && <AIDeveloperChat />}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground border-b border-border">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {u.full_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium">{u.full_name}</span>
                          {u.email === SUPER_ADMIN && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-bold">SUPER ADMIN</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(u.created_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {u.email !== SUPER_ADMIN && (
                          <button
                            onClick={async () => {
                              await XTOX.entities.User.update(u.id, { role: u.role === "admin" ? "user" : "admin" });
                              load();
                            }}
                            className="text-xs px-3 py-1 border border-border rounded-lg hover:bg-muted transition-colors"
                          >
                            {u.role === "admin" ? "Demote" : "Make Admin"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <XTOXFooter />
    </div>
  );
}

