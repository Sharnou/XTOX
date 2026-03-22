import { useState, useEffect, useRef } from "react";
import { XTOX } from "@/api/XTOXClient";
import { Send, Loader2, MessageSquare, User } from "lucide-react";

export default function AdminChatInbox() {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadThreads();
    const unsub = XTOX.entities.AdminChat.subscribe(() => loadThreads());
    return unsub;
  }, []);

  useEffect(() => {
    if (selected) loadThread(selected);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadThreads = async () => {
    const all = await XTOX.entities.AdminChat.list("-created_date", 200);
    // Group by user_email
    const map = {};
    all.forEach(m => {
      if (!map[m.user_email]) map[m.user_email] = { email: m.user_email, last: m, unread: 0 };
      if (m.sender === "user" && !m.is_read) map[m.user_email].unread++;
    });
    setThreads(Object.values(map).sort((a, b) => new Date(b.last.created_date) - new Date(a.last.created_date)));
  };

  const loadThread = async (email) => {
    const msgs = await XTOX.entities.AdminChat.filter({ user_email: email }, "created_date", 100);
    setMessages(msgs);
    // mark user messages read
    msgs.filter(m => m.sender === "user" && !m.is_read).forEach(m =>
      XTOX.entities.AdminChat.update(m.id, { is_read: true })
    );
    loadThreads();
  };

  const sendReply = async () => {
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    await XTOX.entities.AdminChat.create({
      user_email: selected,
      sender: "admin",
      content: input.trim(),
      is_read: false,
    });
    // Send notification to user
    await XTOX.entities.Notification.create({
      user_email: selected,
      title: "New message from Admin",
      message: input.trim().slice(0, 100),
      type: "message",
      link: "/ContactAdmin",
    });
    setInput("");
    setSending(false);
    loadThread(selected);
  };

  return (
    <div className="flex gap-4 h-[500px]">
      {/* Thread list */}
      <div className="w-64 bg-card border border-border rounded-xl overflow-hidden flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h3 className="font-bold text-sm">User Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-xs">No messages yet</div>
          )}
          {threads.map(t => (
            <div key={t.email} onClick={() => setSelected(t.email)}
              className={`px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${selected === t.email ? "bg-primary/10" : ""}`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{t.email.split("@")[0]}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t.last.content}</p>
                </div>
                {t.unread > 0 && (
                  <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {t.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-border bg-muted/50">
              <p className="font-semibold text-sm">{selected}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.sender === "admin" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-0.5 ${msg.sender === "admin" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                      {new Date(msg.created_date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendReply()}
                placeholder="Reply to user..."
                className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={sending} />
              <button onClick={sendReply} disabled={sending || !input.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

