import { Star, Trash2 } from "lucide-react";
import { base44 } from "@/api/XTOXClient";

export default function AdminAdRow({ ad, onUpdate }) {
  const updateAd = async (data) => {
    const updated = await base44.entities.Ad.update(ad.id, data);
    onUpdate(updated);
  };

  return (
    <tr>
      <td className="py-2 px-3">{ad.title}</td>
      <td className="py-2 px-3">{ad.status}</td>
      <td className="py-2 px-3 flex gap-2">
        <button
          onClick={() => updateAd({ status: ad.status === "blocked" ? "active" : "blocked" })}
          className="text-sm text-blue-600 hover:underline"
        >
          {ad.status === "blocked" ? "Unblock" : "Block"}
        </button>
        <button
          onClick={() => updateAd({ is_featured: !ad.is_featured })}
          className="text-sm text-amber-600 hover:underline flex items-center gap-1"
        >
          <Star className="w-4 h-4" />
          {ad.is_featured ? "Unfeature" : "Feature"}
        </button>
        <button
          onClick={() => updateAd({ status: "deleted" })}
          className="text-sm text-red-600 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </td>
    </tr>
  );
}
