import { useState, useEffect } from "react";

// Client-side country detection without external calls.
let cachedCountry = null;

const TZ_TO_COUNTRY = [
  ["Africa/Cairo", "Egypt"],
  ["Asia/Riyadh", "Saudi Arabia"],
  ["Asia/Dubai", "UAE"],
  ["Asia/Kuwait", "Kuwait"],
  ["Asia/Qatar", "Qatar"],
  ["Asia/Bahrain", "Bahrain"],
  ["Asia/Muscat", "Oman"],
  ["Asia/Amman", "Jordan"],
  ["Europe/London", "UK"],
  ["Europe/Paris", "France"],
  ["Europe/Berlin", "Germany"],
  ["America/New_York", "USA"],
  ["America/Los_Angeles", "USA"],
  ["America/Toronto", "Canada"],
  ["Australia/Sydney", "Australia"],
  ["Europe/Madrid", "Spain"],
  ["Europe/Rome", "Italy"],
];

const LANG_TO_COUNTRY = [
  ["ar", "Egypt"],
  ["ar-AE", "UAE"],
  ["ar-SA", "Saudi Arabia"],
  ["en-US", "USA"],
  ["en-GB", "UK"],
  ["fr", "France"],
  ["de", "Germany"],
  ["es", "Spain"],
  ["it", "Italy"],
];

function detectCountryLocal() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const lang = navigator.language || "";
  const tzHit = TZ_TO_COUNTRY.find(([key]) => tz === key);
  if (tzHit) return tzHit[1];
  const langHit = LANG_TO_COUNTRY.find(([key]) => lang.startsWith(key));
  if (langHit) return langHit[1];
  const region = lang.split("-")[1];
  if (region === "DE") return "Germany";
  if (region === "FR") return "France";
  if (region === "GB") return "UK";
  if (region === "CA") return "Canada";
  if (region === "AU") return "Australia";
  return "USA";
}

export function useUserCountry() {
  const [country, setCountry] = useState(cachedCountry || "");
  const [detected, setDetected] = useState(!!cachedCountry);

  useEffect(() => {
    if (cachedCountry) return;
    const c = detectCountryLocal();
    cachedCountry = c;
    setCountry(c);
    setDetected(true);
  }, []);

  return { country, detected };
}
