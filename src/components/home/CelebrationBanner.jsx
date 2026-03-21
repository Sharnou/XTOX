import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";

export default function CelebrationBanner({ country }) {
  const [celebration, setCelebration] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!country) return;
    checkCelebration(country);
  }, [country]);

  const checkCelebration = async (c) => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    // Exclude Jewish holidays for Arabic-speaking Middle East countries
    const arabicCountries = ["Egypt", "UAE", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman", "Jordan"];
    const excludeJewish = arabicCountries.includes(c);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Today is ${today}. Is there a national, cultural, religious, or public holiday/celebration in ${c} that:
- Starts within the next 3 days OR ended within the last 1 day from today?
${excludeJewish ? "- EXCLUDE any Jewish religious holidays." : ""}
- Include national days, independence days, Eid, Christmas, New Year, major religious holidays relevant to ${c}.
If yes, return celebration details. If no celebration active in this window, return active: false.
Return JSON only.`,
      response_json_schema: {
        type: "object",
        properties: {
          active: { type: "boolean" },
          name: { type: "string" },
          emoji: { type: "string" },
          message: { type: "string" },
          color_scheme: { type: "string", description: "e.g. green-white, red-gold, blue-white" },
          starts: { type: "string" },
          ends: { type: "string" }
        }
      }
    });
    if (result.active) setCelebration(result);
    setLoading(false);
  };

  if (!country || loading || !celebration) return null;

  // Map color schemes to Tailwind gradient classes
  const colorMap = {
    "green-white": "from-green-700 via-green-600 to-green-500",
    "red-gold": "from-red-700 via-red-600 to-yellow-500",
    "blue-white": "from-blue-700 via-blue-600 to-blue-400",
    "green-red": "from-green-700 via-red-600 to-green-700",
    "red-white": "from-red-700 via-red-500 to-white",
    "gold-green": "from-yellow-600 via-green-600 to-yellow-600",
    "black-red-green": "from-black via-red-700 to-green-700",
  };
  const gradient = colorMap[celebration.color_scheme] || "from-primary via-secondary to-primary";

  return (
    <div className={`bg-gradient-to-r ${gradient} text-white py-3 px-4 text-center`}>
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 flex-wrap">
        <Sparkles className="w-5 h-5 opacity-80" />
        <span className="text-2xl">{celebration.emoji}</span>
        <div>
          <span className="font-black text-lg">{celebration.name}</span>
          <span className="mx-3 opacity-60">•</span>
          <span className="text-sm opacity-90">{celebration.message}</span>
        </div>
        <span className="text-2xl">{celebration.emoji}</span>
        <Sparkles className="w-5 h-5 opacity-80" />
      </div>
    </div>
  );
}