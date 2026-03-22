import { useState, useEffect } from "react";
import { base44 } from "@/api/XTOXClient";
import { useAuth } from "@/lib/AuthContext";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import { MessageSquare, Send } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { base44.auth.redirectToLogin("/Messages"); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const msgs = await base44.entities.Message.filter({ receiver_email: user.email }, "-created_date", 50);
    setMessages(msgs);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Messages</h1>
            <p className="text-muted-foreground text-sm">{messages.filter(m => !m.is_read).length} unread</p>
          </div>
        </div>

        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse mb-3" />)
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`bg-card rounded-2xl border p-4 ${!msg.is_read ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold">{msg.sender_email}</p>
                    <p className="text-sm text-muted-foreground mt-1">{msg.content}</p>
                  </div>
                  {!msg.is_read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <XTOXFooter />
    </div>
  );
}
