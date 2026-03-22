import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/XTOXClient";
import { useAuth } from "@/lib/AuthContext";
import { X, Send, Mic, MicOff, Image, Phone, Loader2, MessageSquare, Play } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function AdChatWindow({ ad, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    const msgs = await base44.entities.Message.filter({ ad_id: ad.id }, "created_date", 100);
    const mine = msgs.filter(m => m.sender_email === user.email || m.receiver_email === user.email);
    setMessages(mine.map(m => ({
      id: m.id,
      from: m.sender_email === user.email ? "me" : "them",
      content: m.content,
      type: m.type || (m.content?.startsWith("data:audio") ? "audio" : m.content?.startsWith("http") ? "image" : "text"),
      time: new Date(m.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })));
  };

  const sendMsg = async (text, type = "text") => {
    if (!text.trim()) return;
    if (!user) { base44.auth.redirectToLogin(); return; }
    setSending(true);
    const newMsg = { from: "me", content: text, type, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(p => [...p, newMsg]);
    await base44.entities.Message.create({
      ad_id: ad.id,
      sender_email: user.email,
      receiver_email: ad.created_by,
      content: text,
      type,
      is_read: false,
    });
    setInput("");
    setSending(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await sendMsg(file_url, "image");
    setUploading(false);
  };

  const toggleVoiceMessage = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Voice recording not supported");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result.toString();
        await sendMsg(dataUrl, "audio");
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t => t.stop());
      setRecording(false);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.lang = "auto";
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput(t);
      setListening(false);
    };
    rec.onerror = rec.onend = () => setListening(false);
  };

  const startVoiceCall = () => {
    setInCall(true);
    setTimeout(() => setInCall(false), 10000); // simulate call UI
  };

  const sellerName = ad.created_by?.split("@")[0] || "Seller";
  const sellerOnline = useOnlineStatus(ad.created_by);

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 md:w-96 h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">
            {sellerName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{sellerName}</p>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${sellerOnline ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
              <p className="text-xs text-primary-foreground/70">{sellerOnline ? "Online" : "Offline"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={startVoiceCall} title="Voice call" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Call UI */}
      {inCall && (
        <div className="bg-primary/95 text-primary-foreground flex flex-col items-center justify-center py-6 gap-3 flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center animate-pulse">
            <Phone className="w-6 h-6 text-secondary-foreground" />
          </div>
          <p className="text-sm font-semibold">Calling {sellerName}...</p>
          <button onClick={() => setInCall(false)} className="text-xs bg-red-500 text-white px-4 py-1.5 rounded-full hover:bg-red-600">
            End Call
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-xs py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Start a conversation about this listing</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${msg.from === "me" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
              {msg.type === "image" ? (
                <img src={msg.content} alt="sent" className="rounded-lg max-w-full max-h-32 object-cover" />
              ) : msg.type === "audio" ? (
                <audio controls className="w-full">
                  <source src={msg.content} type="audio/webm" />
                  <source src={msg.content} type="audio/ogg" />
                </audio>
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
              <p className={`text-[10px] mt-1 ${msg.from === "me" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex items-center gap-2 flex-shrink-0">
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors" disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
        </button>
        <button onClick={toggleVoice} className={`p-2 rounded-xl transition-colors ${listening ? "bg-red-100 text-red-500 animate-pulse" : "hover:bg-muted text-muted-foreground"}`}>
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button onClick={toggleVoiceMessage} className={`p-2 rounded-xl transition-colors ${recording ? "bg-red-100 text-red-500 animate-pulse" : "hover:bg-muted text-muted-foreground"}`}>
          {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMsg(input)}
          placeholder="Type a message..."
          className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={sending}
        />
        <button
          onClick={() => sendMsg(input)}
          disabled={sending || !input.trim()}
          className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

