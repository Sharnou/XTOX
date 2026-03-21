import { Link } from "react-router-dom";
import { Car, Smartphone, Home, Briefcase, Shirt, Sofa, Wrench, MoreHorizontal } from "lucide-react";

const CATEGORIES = [
  {
    label: "Vehicles",
    icon: Car,
    path: "/Vehicles",
    subcats: ["Cars", "Motorcycles", "Trucks", "Spare Parts", "Boats"],
    color: "bg-blue-50 text-blue-600 border-blue-100",
    iconColor: "text-blue-500"
  },
  {
    label: "Electronics",
    icon: Smartphone,
    path: "/Electronics",
    subcats: ["Mobile Phones", "Computers", "Cameras", "Gaming", "TV & Audio"],
    color: "bg-purple-50 text-purple-600 border-purple-100",
    iconColor: "text-purple-500"
  },
  {
    label: "Real Estate",
    icon: Home,
    path: "/RealEstate",
    subcats: ["Apartments", "Villas", "Commercial", "Land", "Vacation Homes"],
    color: "bg-green-50 text-green-600 border-green-100",
    iconColor: "text-green-500"
  },
  {
    label: "Jobs",
    icon: Briefcase,
    path: "/Search?category=jobs",
    subcats: ["Full Time", "Part Time", "Remote", "Freelance"],
    color: "bg-orange-50 text-orange-600 border-orange-100",
    iconColor: "text-orange-500"
  },
  {
    label: "Fashion",
    icon: Shirt,
    path: "/Search?category=fashion",
    subcats: ["Men's", "Women's", "Kids", "Accessories", "Shoes"],
    color: "bg-pink-50 text-pink-600 border-pink-100",
    iconColor: "text-pink-500"
  },
  {
    label: "Furniture",
    icon: Sofa,
    path: "/Search?category=furniture",
    subcats: ["Living Room", "Bedroom", "Office", "Kitchen", "Outdoor"],
    color: "bg-amber-50 text-amber-600 border-amber-100",
    iconColor: "text-amber-500"
  },
  {
    label: "Services",
    icon: Wrench,
    path: "/Search?category=services",
    subcats: ["Cleaning", "Repairs", "Tutoring", "Beauty", "Delivery"],
    color: "bg-teal-50 text-teal-600 border-teal-100",
    iconColor: "text-teal-500"
  },
  {
    label: "More",
    icon: MoreHorizontal,
    path: "/Search",
    subcats: ["Sports", "Books", "Pets", "Garden", "Baby Items"],
    color: "bg-gray-50 text-gray-600 border-gray-100",
    iconColor: "text-gray-500"
  },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.label}
              to={cat.path}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border hover:shadow-md transition-all group ${cat.color}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
                <Icon className={`w-5 h-5 ${cat.iconColor}`} />
              </div>
              <span className="text-xs font-semibold text-center">{cat.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Detailed subcategories for main 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {CATEGORIES.slice(0, 3).map(cat => {
          const Icon = cat.icon;
          return (
            <div key={cat.label} className={`rounded-2xl border p-5 ${cat.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                <h3 className="font-bold">{cat.label}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.subcats.map(s => (
                  <Link
                    key={s}
                    to={`${cat.path}?sub=${encodeURIComponent(s)}`}
                    className="text-xs bg-white/70 hover:bg-white px-3 py-1 rounded-full transition-colors font-medium"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}