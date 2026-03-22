import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { XTOX } from "@/api/XTOXClient";

// Simple polling bell with audible chime on new notifications.
const CHIME_SRC =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="; // tiny silent placeholder

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const prevCount = useRef(0);
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio(CHIME_SRC) : null);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const notifications = await XTOX.entities.Notification.list("-created_date", 10);
        if (!mounted) return;
        const nextCount = notifications.length;
        if (nextCount > prevCount.current && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {}); // ignore autoplay block
        }
        prevCount.current = nextCount;
        setCount(nextCount);
        setItems(notifications);
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
      onClick={() => setOpen(o => !o)}
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl z-50">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
            Notifications
          </div>
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 && (
              <div className="p-3 text-xs text-muted-foreground">No notifications</div>
            )}
            {items.map((n) => (
              <div key={n.id} className="p-3 border-b border-border last:border-b-0 text-sm">
                <div className="font-semibold">{n.title || "Update"}</div>
                {n.created_date && (
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_date).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}


