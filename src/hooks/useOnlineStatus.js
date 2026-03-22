import { useState, useEffect } from "react";
import { base44 } from "@/api/XTOXClient";
import { useAuth } from "@/lib/AuthContext";

// Simple online presence: tracks last_seen on User entity
// Users seen within last 5 minutes = online

export function useOnlineStatus(targetEmail) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!targetEmail) return;
    checkStatus(targetEmail);
    const interval = setInterval(() => checkStatus(targetEmail), 60000);
    return () => clearInterval(interval);
  }, [targetEmail]);

  const checkStatus = async (email) => {
    const users = await base44.entities.User.filter ? 
      await base44.entities.User.list("-updated_date", 100).then(all => all.filter(u => u.email === email)) :
      [];
    if (users[0]?.last_seen) {
      const diff = Date.now() - new Date(users[0].last_seen).getTime();
      setIsOnline(diff < 5 * 60 * 1000); // 5 min
    }
  };

  return isOnline;
}

export function useUpdatePresence() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const update = () => base44.auth.updateMe({ last_seen: new Date().toISOString() }).catch(() => {});
    update();
    const interval = setInterval(update, 3 * 60 * 1000); // every 3 min
    return () => clearInterval(interval);
  }, [user]);
}
