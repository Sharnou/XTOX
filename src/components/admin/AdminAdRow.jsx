import { Shield, Star, Trash2, Eye, Check, X } from "lucide-react";
import { base44 } from "@/api/XTOXClient";

export default function AdminAdRow({ ad, onUpdate }) {
  const updateAd = async (data) => {
    await base44.entities.Ad.update(ad.id, data);
    onUpdate();
  };

  const deleteAd = async () => {
    if (confirm("Delete this ad permanently?")) {
      await base44.entities.Ad.delete(ad.id);
      onUpdate();
    }
  };

  const statusColors = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    blocked: "bg-red-100 text-red-700",
    sold: "bg-gray-100 text-gray-700",
  };

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {ad.images?.[0] && (
            <img src={ad.images[0]} alt="" className="w-12 h-10 object-cover rounded-lg border border-border" />
          )}
          <div>
            <p className="font-medium text-sm line-clamp-1">{ad.title}</p>
            <p className="text-xs text-muted-foreground">{ad.city}, {ad.country}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm capitalize">{ad.category?.replace("_", " ")}</td>
      <td className="py-3 px-4 text-sm font-semibold">{ad.price?.toLocaleString()} {ad.currency}</td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[ad.status] || "bg-gray-100 text-gray-600"}`}>
          {ad.status}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-1 rounded-full ${ad.is_featured ? "bg-yellow-100 text-yellow-700" : "bg-muted text-muted-foreground"}`}>
          {ad.is_featured ? "â­ Featured" : "Standard"}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateAd({ is_featured: !ad.is_featured })}
            title={ad.is_featured ? "Remove featured" : "Set featured"}
            className="p-1.5 rounded-lg hover:bg-yellow-100 text-yellow-600 transition-colors"
          >
            <Star className="w-4 h-4" />
          </button>
          <button
            onClick={() => updateAd({ status: ad.status === "blocked" ? "active" : "blocked" })}
            title={ad.status === "blocked" ? "Unblock" : "Block"}
            className={`p-1.5 rounded-lg transition-colors ${ad.status === "blocked" ? "hover:bg-green-100 text-green-600" : "hover:bg-red-100 text-red-500"}`}
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={deleteAd}
            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
