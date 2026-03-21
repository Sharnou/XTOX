import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export default function AIFraudAlert({ title, description, price, category }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const check = async () => {
    if (!title) return;
    setLoading(true);
    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a fraud detection AI for XTOX classified marketplace.
Analyze this listing for potential fraud, scams, or policy violations:

Title: "${title}"
Description: "${description || ""}"
Price: ${price || "not set"}
Category: ${category || "unknown"}

Common fraud patterns: unrealistically low prices, advance payment requests, duplicate content, illegal items, misleading descriptions, spam keywords.

Return JSON with:
- risk_level: "low", "medium", or "high"
- is_suspicious: boolean
- flags: array of specific concerns (max 3, empty if clean)
- verdict: one sentence summary`,
      response_json_schema: {
        type: "object",
        properties: {
          risk_level: { type: "string" },
          is_suspicious: { type: "boolean" },
          flags: { type: "array", items: { type: "string" } },
          verdict: { type: "string" }
        }
      }
    });
    setResult(data);
    setLoading(false);
  };

  const riskStyles = {
    low: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: CheckCircle, iconColor: "text-green-600", label: "Low Risk" },
    medium: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", icon: AlertTriangle, iconColor: "text-yellow-600", label: "Medium Risk" },
    high: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: AlertTriangle, iconColor: "text-red-600", label: "High Risk" },
  };

  const style = result ? (riskStyles[result.risk_level] || riskStyles.low) : null;

  if (!title) return null;

  return (
    <div className="mt-2">
      {!result && !loading && (
        <button
          type="button"
          onClick={check}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
        >
          <Shield className="w-3.5 h-3.5" />
          Run AI Fraud Check
        </button>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Scanning for issues...
        </div>
      )}
      {result && style && (
        <div className={`rounded-xl border p-3 ${style.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            <style.icon className={`w-4 h-4 ${style.iconColor}`} />
            <span className={`text-xs font-bold ${style.text}`}>{style.label}</span>
          </div>
          <p className={`text-xs ${style.text} mb-1`}>{result.verdict}</p>
          {result.flags?.map((f, i) => (
            <p key={i} className={`text-xs ${style.text}`}>• {f}</p>
          ))}
        </div>
      )}
    </div>
  );
}