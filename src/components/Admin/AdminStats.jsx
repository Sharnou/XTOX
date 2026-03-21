import { Users, FileText, TrendingUp, Shield, AlertTriangle, Star } from "lucide-react";

export default function AdminStats({ stats }) {
  const cards = [
    { label: "Total Users", value: stats?.total_users || 0, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Ads", value: stats?.total_ads || 0, icon: FileText, color: "bg-green-50 text-green-600" },
    { label: "Active Ads", value: stats?.active_ads || 0, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    { label: "Featured Ads", value: stats?.featured_ads || 0, icon: Star, color: "bg-yellow-50 text-yellow-600" },
    { label: "Blocked Ads", value: stats?.blocked_ads || 0, icon: Shield, color: "bg-red-50 text-red-600" },
    { label: "Pending Review", value: stats?.pending_ads || 0, icon: AlertTriangle, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={`rounded-2xl p-4 border ${card.color} border-current/10`}>
            <Icon className="w-6 h-6 mb-2 opacity-70" />
            <p className="text-2xl font-black">{card.value.toLocaleString()}</p>
            <p className="text-xs font-medium mt-1 opacity-70">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}