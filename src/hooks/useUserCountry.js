import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Detects and locks user to their region — cannot be changed by regular users
let cachedCountry = null;

export function useUserCountry() {
  const [country, setCountry] = useState(cachedCountry || "");
  const [detected, setDetected] = useState(!!cachedCountry);

  useEffect(() => {
    if (cachedCountry) return;
    detect();
  }, []);

  const detect = async () => {
    // Try IP-based detection via AI
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on the browser's timezone "${Intl.DateTimeFormat().resolvedOptions().timeZone}" and language "${navigator.language}", what country is this user most likely from? Return only the country name, matching one of: Egypt, UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, Oman, Jordan, USA, UK, France, Germany, Canada, Australia, Italy, Spain, Morocco, Tunisia, Libya, Iraq, Lebanon, Syria, Palestine, Sudan. Return JSON only.`,
      response_json_schema: {
        type: "object",
        properties: {
          country: { type: "string" }
        }
      }
    });
    const c = result.country || "";
    cachedCountry = c;
    setCountry(c);
    setDetected(true);
  };

  return { country, detected };
}