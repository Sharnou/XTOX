import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function AdMediaViewer({ images = [], video, onClose }) {
  const [index, setIndex] = useState(0);
  const allMedia = [...images, ...(video ? [{ type: "video", url: video }] : [])];

  if (allMedia.length === 0) return null;

  const current = allMedia[index];
  const isVideo = current?.type === "video" || typeof current === "object";

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
        {isVideo ? (
          <video
            src={current.url || current}
            controls
            autoPlay
            className="w-full max-h-[80vh] rounded-xl object-contain"
          />
        ) : (
          <img
            src={current}
            alt=""
            className="w-full max-h-[80vh] rounded-xl object-contain"
          />
        )}

        {allMedia.length > 1 && (
          <>
            <button
              onClick={() => setIndex(i => (i - 1 + allMedia.length) % allMedia.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIndex(i => (i + 1) % allMedia.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex justify-center gap-1.5 mt-3">
              {allMedia.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === index ? "bg-white scale-125" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
