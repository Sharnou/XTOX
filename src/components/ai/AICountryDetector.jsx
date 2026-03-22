import { useEffect, useState } from "react";
import { Globe, X } from "lucide-react";

const BROWSER_LANG_MAP = {
  ar: { country: "Egypt", currency: "EGP", flag: "ðŸ‡ªðŸ‡¬" },
  "ar-AE": { country: "UAE", currency: "AED", flag: "ðŸ‡¦ðŸ‡ª" },
  "ar-SA": { country: "Saudi Arabia", currency: "SAR", flag: "ðŸ‡¸ðŸ‡¦" },
  en: { country: "USA", currency: "USD", flag: "ðŸ‡ºðŸ‡¸" },
  "en-GB": { country: "UK", currency: "GBP", flag: "ðŸ‡¬ðŸ‡§" },
  fr: { country: "France", currency: "EUR", flag: "ðŸ‡«ðŸ‡·" },
  de: { country: "Germany", currency: "EUR", flag: "ðŸ‡©ðŸ‡ª" },
};

export default function AICountryDetector({ onDetected }) {
  const [detected, setDetected] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Use browser language as a proxy for country detection
    const lang = navigator.language || navigator.languages?.[0] || "en";
    const match = BROWSER_LANG_MAP[lang] || BROWSER_LANG_MAP[lang.split("-")[0]];

    if (match) {
      setDetected(match);
      onDetected?.(match.country);
    }
  }, []);

  if (!detected || dismissed) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 max-w-7xl mx-auto mt-3 mx-4">
      <div className="flex items-center gap-3">
        <Globe className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-sm">
          <span className="mr-1">{detected.flag}</span>
          <span className="font-medium">Detected location: {detected.country}</span>
          <span className="text-muted-foreground ml-1">â€” showing listings in {detected.currency}</span>
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="p-1 hover:bg-muted rounded-lg flex-shrink-0">
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

