import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Simple polling bell with audible chime on new notifications.
const CHIME_SRC =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="; // tiny silent placeholder

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const prevCount = useRef(0);
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio(CHIME_SRC) : null);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const notifications = await base44.entities.Notification.list("-created_date", 10);
        if (!mounted) return;
        const nextCount = notifications.length;
        if (nextCount > prevCount.current && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {}); // ignore autoplay block
        }
        prevCount.current = nextCount;
        setCount(nextCount);
      } catch {
        /* ignore errors in mock mode */
      }
    };
    poll();
    const interval = setInterval(poll, 15000); // 15s poll
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <button
      className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      aria-label="Notifications"
      type="button"
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}
