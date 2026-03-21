import { useState, useRef } from "react";
import { X, ImageIcon, Video, Loader2, Zap, Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MediaUploader({ images, video, onImagesChange, onVideoChange, onAIGenerated }) {
  const [uploading, setUploading] = useState(false);
  const [analyzingVideo, setAnalyzingVideo] = useState(false);
  const videoRef = useRef(null);

  const handleImages = async (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - images.length;
    if (remaining <= 0) return;
    setUploading(true);
    const toUpload = files.slice(0, remaining);
    const urls = await Promise.all(toUpload.map(f => base44.integrations.Core.UploadFile({ file: f }).then(r => r.file_url)));
    onImagesChange([...images, ...urls]);
    setUploading(false);
  };

  const handleVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onVideoChange(file_url);
    setUploading(false);

    // Auto analyze video with AI if callback provided
    if (onAIGenerated) {
      setAnalyzingVideo(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI listing generator for a classified marketplace. A user has captured/uploaded a video of an item they want to sell. The video URL is: ${file_url}. Based on the video context and URL filename, generate a complete marketplace listing. Detect: category (one of: vehicles, electronics, real_estate, jobs, pets, services, furniture, fashion, sports, books, other), subcategory, title, description, estimated price, currency (USD/EGP/AED/SAR/EUR/GBP based on typical market), and condition.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            subcategory: { type: "string" },
            estimated_price_usd: { type: "number" },
            currency: { type: "string" },
            condition: { type: "string" },
          }
        }
      });
      onAIGenerated(result, file_url);
      setAnalyzingVideo(false);
    }
  };

  const removeImage = (idx) => {
    onImagesChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {/* Photos + Video combined */}
      <div>
        <label className="block text-sm font-semibold mb-2">Photos & Video (up to 5 photos + 1 video)</label>
        <div className="flex flex-wrap gap-3">
          {/* Existing photos */}
          {images.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add photo button */}
          {images.length < 5 && (
            <label className="w-24 h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-all">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : (
                <>
                  <ImageIcon className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground text-center leading-tight">Add photo</span>
                </>
              )}
              <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handleImages} disabled={uploading} />
            </label>
          )}

          {/* Video button */}
          {!video && (
            <label className="w-24 h-24 border-2 border-dashed border-secondary/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all relative">
              {uploading || analyzingVideo ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                  <span className="text-xs text-secondary">{analyzingVideo ? "AI..." : "Upload..."}</span>
                </div>
              ) : (
                <>
                  <Camera className="w-5 h-5 text-secondary mb-1" />
                  <span className="text-xs text-secondary text-center leading-tight">Capture video</span>
                  <span className="text-[9px] text-muted-foreground">30s max</span>
                  <div className="absolute -top-1 -right-1 bg-secondary rounded-full p-0.5">
                    <Zap className="w-2.5 h-2.5 text-secondary-foreground" />
                  </div>
                </>
              )}
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={handleVideo}
                disabled={uploading || analyzingVideo}
              />
            </label>
          )}
        </div>

        {/* Video preview */}
        {video && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl mt-3">
            <Video className="w-5 h-5 text-primary" />
            <span className="text-sm flex-1 truncate">Video captured</span>
            {analyzingVideo && (
              <span className="text-xs text-secondary flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> AI analyzing...
              </span>
            )}
            <button type="button" onClick={() => onVideoChange(null)} className="text-destructive">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {analyzingVideo && (
          <p className="text-xs text-secondary mt-2 flex items-center gap-1">
            <Zap className="w-3 h-3" /> AI is analyzing your video and generating listing details...
          </p>
        )}
      </div>
    </div>
  );
}