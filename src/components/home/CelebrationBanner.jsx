import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

// Local holiday schedule (month-day). Excludes Jewish holidays for Arabic-speaking Middle East countries.
const SCHEDULE = {
  Egypt: [
    { name: "Armed Forces Day", emoji: "🇪🇬", start: "10-06", end: "10-06", colors: "red-white" },
    { name: "Revolution Day", emoji: "🇪🇬", start: "07-23", end: "07-23", colors: "red-white" },
  ],
  UAE: [{ name: "National Day", emoji: "🇦🇪", start: "12-02", end: "12-03", colors: "green-red" }],
  "Saudi Arabia": [{ name: "National Day", emoji: "🇸🇦", start: "09-23", end: "09-23", colors: "green-white" }],
  Kuwait: [{ name: "National Day", emoji: "🇰🇼", start: "02-25", end: "02-26", colors: "green-red" }],
  Qatar: [{ name: "National Day", emoji: "🇶🇦", start: "12-18", end: "12-18", colors: "red-white" }],
  Bahrain: [{ name: "National Day", emoji: "🇧🇭", start: "12-16", end: "12-17", colors: "red-white" }],
  Oman: [{ name: "National Day", emoji: "🇴🇲", start: "11-18", end: "11-19", colors: "green-red" }],
  Jordan: [{ name: "Independence Day", emoji: "🇯🇴", start: "05-25", end: "05-25", colors: "green-red" }],
  USA: [{ name: "Independence Day", emoji: "🇺🇸", start: "07-04", end: "07-04", colors: "blue-white" }],
  UK: [{ name: "New Year", emoji: "🎆", start: "01-01", end: "01-01", colors: "blue-white" }],
  France: [{ name: "Bastille Day", emoji: "🇫🇷", start: "07-14", end: "07-14", colors: "blue-white" }],
  Germany: [{ name: "Unity Day", emoji: "🇩🇪", start: "10-03", end: "10-03", colors: "black-red-green" }],
  Canada: [{ name: "Canada Day", emoji: "🇨🇦", start: "07-01", end: "07-01", colors: "red-white" }],
  Australia: [{ name: "Australia Day", emoji: "🇦🇺", start: "01-26", end: "01-26", colors: "blue-white" }],
};

const arabicCountries = ["Egypt", "UAE", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman", "Jordan"];

function isActiveToday(event, today) {
  const year = today.getFullYear();
  const start = new Date(`${year}-${event.start}`);
  const end = new Date(`${year}-${event.end}`);
  // window: 3 days before start through 1 day after end
  const windowStart = new Date(start);
  windowStart.setDate(windowStart.getDate() - 3);
  const windowEnd = new Date(end);
  windowEnd.setDate(windowEnd.getDate() + 1);
  return today >= windowStart && today <= windowEnd;
}

export default function CelebrationBanner({ country }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!country) { setActive(null); return; }
    const today = new Date();
    const events = SCHEDULE[country] || [];
    const filtered = arabicCountries.includes(country)
      ? events.filter(e => !(e.type === "jewish")) // none marked jewish currently
      : events;
    const current = filtered.find(ev => isActiveToday(ev, today));
    setActive(current || null);
  }, [country]);

  if (!active) return null;

  const colorMap = {
    "green-white": "from-green-700 via-green-600 to-green-500",
    "red-gold": "from-red-700 via-red-600 to-yellow-500",
    "blue-white": "from-blue-700 via-blue-600 to-blue-400",
    "green-red": "from-green-700 via-red-600 to-green-700",
    "red-white": "from-red-700 via-red-500 to-white",
    "gold-green": "from-yellow-600 via-green-600 to-yellow-600",
    "black-red-green": "from-black via-red-700 to-green-700",
  };
  const gradient = colorMap[active.colors] || "from-primary via-secondary to-primary";

  return (
    <div className={`bg-gradient-to-r ${gradient} text-white py-3 px-4 text-center`}>
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 flex-wrap">
        <Sparkles className="w-5 h-5 opacity-80" />
        <span className="text-2xl">{active.emoji}</span>
        <div>
          <span className="font-black text-lg">{active.name}</span>
          <span className="mx-3 opacity-60">•</span>
          <span className="text-sm opacity-90">Celebrating in {country}</span>
        </div>
        <span className="text-2xl">{active.emoji}</span>
        <Sparkles className="w-5 h-5 opacity-80" />
      </div>
    </div>
  );
}
