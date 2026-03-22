import { useState } from "react";
import { Zap, Loader2, CheckCircle, Camera } from "lucide-react";
import { base44 } from "@/api/XTOXClient";

export default function AIListingGenerator({ onGenerated }) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [result, setResult] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const supported = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!supported.includes(file.type)) {
      alert("Unsupported file type. Please upload a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedImageUrl(file_url);
    setUploading(false);
    await analyzeImage(file_url);
  };

  const analyzeImage = async (imageUrl) => {
    setAnalyzing(true);
    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI listing generator for a classified marketplace called XTOX.
Analyze this product image and generate a complete marketplace listing.
Return JSON with: title (catchy, SEO-friendly), description (3-4 sentences, highlight key features), 
category (one of: vehicles, electronics, real_estate), subcategory (specific type),
estimated_price_usd (number), condition (new/like_new/good/fair/poor), key_features (array of 3-5 strings).
Be specific and professional.`,
      file_urls: [imageUrl],
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          subcategory: { type: "string" },
          estimated_price_usd: { type: "number" },
          condition: { type: "string" },
          key_features: { type: "array", items: { type: "string" } }
        }
      }
    });
    setResult(data);
    setAnalyzing(false);
    onGenerated?.({ ...data, images: [imageUrl], ai_generated: true });
  };

  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-secondary-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI Listing Generator</h3>
          <p className="text-primary-foreground/70 text-sm">Upload a photo â€” AI creates your listing instantly</p>
        </div>
      </div>

      {!result && !analyzing && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-xl p-8 cursor-pointer hover:border-secondary/60 hover:bg-white/5 transition-all">
          <Camera className="w-10 h-10 text-primary-foreground/50 mb-3" />
          <span className="text-sm font-medium">{uploading ? "Uploading..." : "Click to upload photo"}</span>
          <span className="text-xs text-primary-foreground/50 mt-1">JPG, PNG, WEBP up to 10MB</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      )}

      {analyzing && (
        <div className="flex flex-col items-center py-8 gap-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <div className="text-center">
            <p className="font-semibold">AI is analyzing your image...</p>
            <p className="text-sm text-primary-foreground/60 mt-1">Detecting object, generating title, estimating price</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-secondary font-semibold">
            <CheckCircle className="w-5 h-5" />
            <span>Listing generated successfully!</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 space-y-2 text-sm">
            <p><span className="text-secondary font-medium">Title:</span> {result.title}</p>
            <p><span className="text-secondary font-medium">Category:</span> {result.category} â†’ {result.subcategory}</p>
            <p><span className="text-secondary font-medium">Estimated Price:</span> ${result.estimated_price_usd?.toLocaleString()} USD</p>
            <p><span className="text-secondary font-medium">Condition:</span> {result.condition}</p>
          </div>
          {uploadedImageUrl && (
            <img src={uploadedImageUrl} alt="Uploaded" className="w-24 h-24 object-cover rounded-xl border-2 border-secondary" />
          )}
          <button
            onClick={() => { setResult(null); setUploadedImageUrl(null); }}
            className="text-xs text-primary-foreground/60 hover:text-primary-foreground underline"
          >
            Re-upload different photo
          </button>
        </div>
      )}
    </div>
  );
}
