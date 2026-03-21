import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Wand2, Loader2, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function AIAdImprover({ title, description, price, category, onApply }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const analyze = async () => {
    if (!title && !description) return;
    setLoading(true);
    setExpanded(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert marketplace listing optimizer for XTOX classified marketplace.
Analyze this listing and provide concrete improvements:

Title: "${title || "Not provided"}"
Description: "${description || "Not provided"}"
Price: ${price || "Not provided"}
Category: ${category || "Not provided"}

Return JSON with:
- improved_title: a better, more specific, SEO-friendly title (max 80 chars)
- improved_description: a more compelling, detailed description (3-4 sentences)
- issues: array of specific problems found (max 4 items)
- price_feedback: brief comment on the price (1 sentence)
- score: listing quality score 1-10`,
      response_json_schema: {
        type: "object",
        properties: {
          improved_title: { type: "string" },
          improved_description: { type: "string" },
          issues: { type: "array", items: { type: "string" } },
          price_feedback: { type: "string" },
          score: { type: "number" }
        }
      }
    });

    setSuggestions(result);
    setLoading(false);
  };

  const scoreColor = (s) => {
    if (s >= 8) return "text-green-600 bg-green-50";
    if (s >= 5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={suggestions ? () => setExpanded(!expanded) : analyze}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">AI Ad Improver</span>
          {suggestions && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${scoreColor(suggestions.score)}`}>
              Score: {suggestions.score}/10
            </span>
          )}
        </div>
        {loading ? <Loader2 className="w-4 h-4 text-purple-600 animate-spin" /> :
          expanded ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-purple-600" />}
      </button>

      {expanded && suggestions && (
        <div className="p-4 space-y-4 bg-white">
          {/* Issues */}
          {suggestions.issues?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Issues Found</p>
              <ul className="space-y-1">
                {suggestions.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-700">
                    <span className="text-orange-500 mt-0.5">⚠</span> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improved Title */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Suggested Title</p>
            <div className="flex items-center gap-2">
              <p className="text-sm bg-muted rounded-lg px-3 py-2 flex-1 font-medium">{suggestions.improved_title}</p>
              <button
                type="button"
                onClick={() => onApply?.({ title: suggestions.improved_title })}
                className="text-xs bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 whitespace-nowrap"
              >
                Use
              </button>
            </div>
          </div>

          {/* Improved Description */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Suggested Description</p>
            <div className="flex flex-col gap-2">
              <p className="text-sm bg-muted rounded-lg px-3 py-2 leading-relaxed">{suggestions.improved_description}</p>
              <button
                type="button"
                onClick={() => onApply?.({ description: suggestions.improved_description })}
                className="self-end text-xs bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90"
              >
                Use This Description
              </button>
            </div>
          </div>

          {/* Price Feedback */}
          {suggestions.price_feedback && (
            <div className="bg-blue-50 rounded-xl px-3 py-2 text-sm text-blue-700">
              💰 {suggestions.price_feedback}
            </div>
          )}

          <button
            type="button"
            onClick={() => { onApply?.({ title: suggestions.improved_title, description: suggestions.improved_description }); }}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-xl hover:bg-purple-700 transition-colors text-sm font-semibold"
          >
            <CheckCircle className="w-4 h-4" />
            Apply All Improvements
          </button>
        </div>
      )}

      {expanded && loading && (
        <div className="p-6 flex flex-col items-center gap-3 bg-white">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm text-muted-foreground">AI is analyzing your listing...</p>
        </div>
      )}
    </div>
  );
}