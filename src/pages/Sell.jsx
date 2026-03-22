import { useState, useEffect } from "react";
import { base44 } from "@/api/XTOXClient";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import AIListingGenerator from "@/components/sell/AIListingGenerator";
import MediaUploader from "@/components/sell/MediaUploader";
import AIAdImprover from "@/components/ai/AIAdImprover";
import AIFraudAlert from "@/components/ai/AIFraudAlert";
import AIAssistant from "@/components/ai/AIAssistant";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

const CATEGORIES = [
  {
    value: "vehicles", label: "ðŸš— Vehicles",
    subs: ["Cars", "Motorcycles", "Trucks", "Buses", "Boats", "Spare Parts", "Caravans", "Heavy Equipment"]
  },
  {
    value: "electronics", label: "ðŸ“± Electronics",
    subs: ["Mobile Phones", "Tablets", "Laptops & Computers", "Cameras", "Gaming Consoles", "TV & Audio", "Smart Watches", "Accessories"]
  },
  {
    value: "real_estate", label: "ðŸ  Real Estate",
    subs: ["Apartments for Sale", "Apartments for Rent", "Villas", "Commercial Property", "Land", "Warehouses", "Vacation Homes", "Offices"]
  },
  {
    value: "jobs", label: "ðŸ’¼ Jobs",
    subs: ["Full-Time Jobs", "Part-Time Jobs", "Freelance", "Internships", "Job Vacancies (Employers)", "CVs & Resumes", "Remote Work", "Training & Courses"]
  },
  {
    value: "pets", label: "ðŸ¾ Pets",
    subs: ["Cats", "Dogs", "Birds", "Fish & Aquariums", "Rabbits", "Reptiles", "Pet Accessories", "Pet Services", "Other Pets"]
  },
  {
    value: "services", label: "ðŸ”§ Services",
    subs: ["Home Repair", "Cleaning", "Plumbing", "Electrical", "Painting", "Moving & Delivery", "IT Services", "Beauty & Wellness", "Legal & Financial"]
  },
  {
    value: "furniture", label: "ðŸ›‹ Furniture",
    subs: ["Sofas & Chairs", "Beds & Mattresses", "Tables & Desks", "Wardrobes", "Kitchen Furniture", "Office Furniture", "Outdoor Furniture", "Kids Furniture"]
  },
  {
    value: "fashion", label: "ðŸ‘— Fashion",
    subs: ["Men's Clothing", "Women's Clothing", "Kids' Clothing", "Shoes", "Bags & Accessories", "Watches & Jewelry", "Sportswear", "Traditional Clothing"]
  },
  {
    value: "sports", label: "âš½ Sports",
    subs: ["Gym Equipment", "Bicycles", "Football", "Swimming", "Martial Arts", "Outdoor Sports", "Water Sports", "Sports Clothing"]
  },
  {
    value: "books", label: "ðŸ“š Books & Education",
    subs: ["Textbooks", "Novels", "Children's Books", "Religious Books", "Magazines", "Courses & Certificates", "Musical Instruments", "Art Supplies"]
  },
  {
    value: "other", label: "ðŸ“¦ Other",
    subs: ["Collectibles", "Baby Items", "Garden & Plants", "Food & Beverages", "Medical Equipment", "Industrial Equipment", "Free Items", "Miscellaneous"]
  },
];

const CURRENCIES = ["USD", "EGP", "AED", "SAR", "KWD", "QAR", "EUR", "GBP", "CAD", "AUD"];

export default function Sell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", price: "", currency: "USD",
    category: "", subcategory: "", city: "",
    condition: "good", contact_phone: "", images: [], video_url: null, ai_generated: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [translation, setTranslation] = useState({
    title: "",
    description: "",
    enabled: false,
    loading: false,
    target: "ar",
  });

  useEffect(() => {
    if (!user) base44.auth.redirectToLogin("/Sell");
  }, [user]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleAIGenerated = (data, videoUrl) => {
    setForm(f => ({
      ...f,
      title: data.title || f.title,
      description: data.description || f.description,
      category: data.category || f.category,
      subcategory: data.subcategory || f.subcategory,
      price: data.estimated_price_usd || f.price,
      currency: data.currency || f.currency,
      condition: data.condition || f.condition,
      images: data.images?.length ? data.images : f.images,
      video_url: videoUrl || f.video_url,
      ai_generated: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category) return;
    setSubmitting(true);

    // AI moderation check
    const moderation = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderator for a classified marketplace. Check if this ad listing is appropriate:
Title: ${form.title}
Description: ${form.description}
Price: ${form.price}
Category: ${form.category}
Return JSON with: approved (boolean), reason (string if rejected).`,
      response_json_schema: {
        type: "object",
        properties: {
          approved: { type: "boolean" },
          reason: { type: "string" }
        }
      }
    });

    const status = moderation.approved ? "active" : "blocked";

    // Set expiry date: 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Generate hidden AI keywords for better visibility
    const kwResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 20 hidden SEO keywords for this classified ad listing to improve search visibility. Category: ${form.category}, Title: ${form.title}, Description: ${form.description}. Return as a comma-separated string of relevant keywords, synonyms, and related terms.`,
      response_json_schema: { type: "object", properties: { keywords: { type: "string" } } }
    });

    await base44.entities.Ad.create({
      ...form,
      price: parseFloat(form.price) || 0,
      status,
      expires_at: expiresAt.toISOString(),
      ai_keywords: kwResult.keywords || "",
      translated_title: translation.title,
      translated_description: translation.description,
    });

    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => navigate("/Dashboard"), 2000);
  };

  const selectedCategory = CATEGORIES.find(c => c.value === form.category);

  // Live translation sync
  useEffect(() => {
    if (!translation.enabled) return;
    const hasText = form.title || form.description;
    if (!hasText) {
      setTranslation(t => ({ ...t, title: "", description: "" }));
      return;
    }
    const timer = setTimeout(async () => {
      setTranslation(t => ({ ...t, loading: true }));
      const result = await base44.integrations.Core.InvokeLLM({
        task: "translate",
        title: form.title,
        description: form.description,
        target_lang: translation.target,
      });
      setTranslation(t => ({
        ...t,
        loading: false,
        title: result.translated_title || "",
        description: result.translated_description || "",
      }));
    }, 350);
    return () => clearTimeout(timer);
  }, [form.title, form.description, translation.enabled, translation.target]);

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ad Posted Successfully!</h2>
          <p className="text-muted-foreground">Your ad is live for 30 days. Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl font-black mb-2">Post Your Ad</h1>
        <p className="text-muted-foreground mb-2">Fill in the details or let AI do it for you.</p>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-2 rounded-xl mb-6">
          ðŸ“… Your ad will be active for <strong>30 days</strong>. You can renew it from your Dashboard before it expires.
        </div>

        <AIListingGenerator onGenerated={handleAIGenerated} />

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. Persian Cat for Sale â€” 3 months old, vaccinated"
              className="w-full border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card"
              required
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Category *</label>
              <select
                value={form.category}
                onChange={e => { set("category", e.target.value); set("subcategory", ""); }}
                className="w-full border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card"
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Subcategory</label>
              <select
                value={form.subcategory}
                onChange={e => set("subcategory", e.target.value)}
                className="w-full border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card"
              >
                <option value="">Select Subcategory</option>
                {(selectedCategory?.subs || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Jobs-specific notice */}
          {form.category === "jobs" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
              ðŸ’¼ <strong>Job Posting:</strong> Employers â€” select "Job Vacancies (Employers)" as subcategory. Job seekers â€” select "CVs & Resumes".
            </div>
          )}

          {/* Pets-specific notice */}
          {form.category === "pets" && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
              ðŸ¾ <strong>Pets:</strong> You can list cats, dogs, birds and more. Please provide health info in the description.
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder={
                form.category === "jobs"
                  ? "Describe the job role, requirements, salary range, company name..."
                  : form.category === "pets"
                  ? "Breed, age, health status, vaccinations, temperament..."
                  : "Describe your item in detail..."
              }
              rows={4}
              className="w-full border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card resize-none"
            />
          </div>

          {/* Live Translation */}
          <div className="border border-blue-100 bg-blue-50/70 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">Live translation (keeps in sync)</p>
                <p className="text-xs text-blue-700">Edits to title/description update the translated copy; clearing originals clears translation automatically.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={translation.target}
                  onChange={e => setTranslation(t => ({ ...t, target: e.target.value }))}
                  className="text-xs border border-blue-200 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="ar">Arabic</option>
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
                <button
                  type="button"
                  onClick={() => setTranslation(t => ({ ...t, enabled: !t.enabled }))}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${translation.enabled ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-200"}`}
                >
                  {translation.enabled ? (translation.loading ? "Syncing..." : "Auto-sync On") : "Start"}
                </button>
              </div>
            </div>
            {translation.enabled && (
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Translated Title</p>
                  <div className="bg-white border border-blue-200 rounded-lg px-3 py-2 min-h-[44px]">
                    {translation.title || <span className="text-muted-foreground text-xs">Waiting for text...</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Translated Description</p>
                  <div className="bg-white border border-blue-200 rounded-lg px-3 py-2 min-h-[64px] whitespace-pre-wrap">
                    {translation.description || <span className="text-muted-foreground text-xs">Waiting for text...</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price & Condition â€” hide price for CVs */}
          {form.subcategory !== "CVs & Resumes" && (
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  {form.category === "jobs" ? "Salary / Budget" : "Price"}
                </label>
                <div className="flex">
                  <select
                    value={form.currency}
                    onChange={e => set("currency", e.target.value)}
                    className="border border-input rounded-l-xl px-3 py-3 text-sm bg-muted focus:outline-none"
                  >
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => set("price", e.target.value)}
                    placeholder="0"
                    className="flex-1 border border-l-0 border-input rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card"
                  />
                </div>
              </div>
              {form.category !== "jobs" && form.category !== "pets" && form.category !== "services" && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Condition</label>
                  <select
                    value={form.condition}
                    onChange={e => set("condition", e.target.value)}
                    className="w-full border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card"
                  >
                    {["new","like_new","good","fair","poor"].map(c => (
                      <option key={c} value={c}>{c.replace("_"," ")}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2">City</label>
            <input
              value={form.city}
              onChange={e => set("city", e.target.value)}
              placeholder="e.g. Cairo, Dubai, London..."
              className="w-full border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold mb-2">Contact Phone</label>
            <input
              value={form.contact_phone}
              onChange={e => set("contact_phone", e.target.value)}
              placeholder="+1 234 567 890"
              className="w-full border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card"
            />
          </div>

          {/* AI Improver */}
          <AIAdImprover
            title={form.title}
            description={form.description}
            price={form.price}
            category={form.category}
            onApply={(data) => setForm(f => ({ ...f, ...data }))}
          />

          {/* AI Fraud Check */}
          <AIFraudAlert
            title={form.title}
            description={form.description}
            price={form.price}
            category={form.category}
          />

          {/* Media */}
          <div>
            <MediaUploader
              images={form.images}
              video={form.video_url}
              onImagesChange={imgs => set("images", imgs)}
              onVideoChange={vid => set("video_url", vid)}
              onAIGenerated={handleAIGenerated}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:bg-primary/90 transition-colors text-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</> : "Publish Ad (30 Days)"}
          </button>
        </form>
      </div>

      <XTOXFooter />
      <AIAssistant detectedCountry="" />
    </div>
  );
}

