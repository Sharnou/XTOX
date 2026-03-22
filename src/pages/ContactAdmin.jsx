import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/XTOXClient";
import { useAuth } from "@/lib/AuthContext";
import XTOXHeader from "@/components/layout/XTOXHeader";
import XTOXFooter from "@/components/layout/XTOXFooter";
import { ArrowLeft, Send, MessageSquare, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContactAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) { base44.auth.redirectToLogin("/ContactAdmin"); return; }
    loadMessages();
    const unsub = base44.entities.AdminChat.subscribe((event) => {
      if (event.data?.user_email === user.email) {
        setMessages(prev => {
          if (event.type === "create") return [...prev, event.data];
          if (event.type === "update") return prev.map(m => m.id === event.id ? event.data : m);
          return prev;
        });
      }
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    const msgs = await base44.entities.AdminChat.filter({ user_email: user.email }, "created_date", 100);
    setMessages(msgs);
    // mark admin messages as read
    msgs.filter(m => m.sender === "admin" && !m.is_read).forEach(m =>
      base44.entities.AdminChat.update(m.id, { is_read: true })
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await base44.entities.AdminChat.create({
      user_email: user.email,
      sender: "user",
      content: input.trim(),
      is_read: false,
    });
    setInput("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background font-inter flex flex-col">
      <XTOXHeader selectedCountry="" onCountryChange={() => {}} />
      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-black">Contact Admin</h1>
            <p className="text-sm text-muted-foreground">Private & secure chat with XTOX administration</p>
          </div>
        </div>

        {!user ? (
          <div className="text-center py-16 text-muted-foreground">Please log in to contact admin.</div>
        ) : (
          <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px]">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Send a message to the admin. We'll reply as soon as possible.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "admin" && (
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                      {msg.sender === "admin" ? "Admin" : "You"} â€¢ {new Date(msg.created_date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type your message to admin..."
                className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
      <XTOXFooter />
    </div>
  );
}
