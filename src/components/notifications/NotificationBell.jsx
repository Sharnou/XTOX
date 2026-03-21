import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Minimal, non-recursive notification bell that works with the local mock backend.
export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const notifications = await base44.entities.Notification.list("-created_date", 10);
        if (active) setCount(notifications.length);
      } catch {
        /* ignore in mock mode */
      }
    })();
    return () => { active = false; };
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
