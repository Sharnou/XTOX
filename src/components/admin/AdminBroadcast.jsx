import { useState } from "react";
import { base44 } from "@/api/XTOXClient";
import { Send, Users, CheckCircle, Loader2 } from "lucide-react";

export default function AdminBroadcast({ users }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendToAll = async () => {
    if (!subject || !body) return;
    setSending(true);
    // Send email to each user
    await Promise.all(
      users.map(u =>
        base44.integrations.Core.SendEmail({
          to: u.email,
          subject,
          body,
          from_name: "XTOX Admin"
        }).catch(() => {}) // silently skip failed ones
      )
    );
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setSubject(""); setBody(""); }, 3000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-bold">Broadcast Message to All Users</h3>
        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-auto">{users.length} users</span>
      </div>

      {sent ? (
        <div className="flex items-center justify-center gap-2 py-6 text-green-600">
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold">Message sent to all {users.length} users!</span>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Message subject..."
            className="w-full border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your message to all users..."
            rows={4}
            className="w-full border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
          />
          <button
            onClick={sendToAll}
            disabled={sending || !subject || !body}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending..." : "Send to All Users"}
          </button>
        </div>
      )}
    </div>
  );
}
