import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/XTOXClient";
import { useAuth } from "@/lib/AuthContext";
import { MessageSquare, X, Send, Minimize2, Maximize2, Zap, Loader2, Mic } from "lucide-react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const COUNTRY_HINTS = {
  EG: { country: "Egypt", currency: "EGP", lang: "ar", flag: "ðŸ‡ªðŸ‡¬" },
  AE: { country: "UAE", currency: "AED", lang: "en", flag: "ðŸ‡¦ðŸ‡ª" },
  SA: { country: "Saudi Arabia", currency: "SAR", lang: "ar", flag: "ðŸ‡¸ðŸ‡¦" },
  US: { country: "USA", currency: "USD", lang: "en", flag: "ðŸ‡ºðŸ‡¸" },
  GB: { country: "UK", currency: "GBP", lang: "en", flag: "ðŸ‡¬ðŸ‡§" },
  FR: { country: "France", currency: "EUR", lang: "fr", flag: "ðŸ‡«ðŸ‡·" },
  DE: { country: "Germany", currency: "EUR", lang: "de", flag: "ðŸ‡©ðŸ‡ª" },
};

const PAGE_CONTEXT = {
  "/Home": "The user is on the XTOX homepage browsing listings.",
  "/Sell": "The user is on the Sell page trying to post a new ad listing.",
  "/Vehicles": "The user is browsing vehicle listings.",
  "/Electronics": "The user is browsing electronics listings.",
  "/RealEstate": "The user is browsing real estate listings.",
  "/Dashboard": "The user is on their personal dashboard managing their ads.",
  "/Admin": "The user is on the admin panel managing the platform.",
  "/Search": "The user is searching for listings.",
};

export default function AIAssistant({ detectedCountry }) {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && !hasGreeted) {
      sendGreeting();
      setHasGreeted(true);
    }
  }, [open]);

  const sendGreeting = async () => {
    setLoading(true);
    const pageCtx = PAGE_CONTEXT[location.pathname] || "The user is browsing XTOX marketplace.";
    const userCtx = user ? `User is logged in as ${user.full_name} (${user.email}).` : "User is not logged in.";
    const countryCtx = detectedCountry ? `Detected country: ${detectedCountry}.` : "";

    const greeting = await base44.integrations.Core.InvokeLLM({
      prompt: `You are XTOX AI Assistant â€” a friendly, smart co-pilot for the XTOX international classified marketplace.
${pageCtx} ${userCtx} ${countryCtx}
Generate a short, warm, helpful greeting message (2-3 sentences max).
Mention what you can help with based on the current page. Use emojis. Be concise and friendly.
Do NOT introduce yourself as Claude or any AI model â€” you are "XTOX AI".`,
    });

    setMessages([{ role: "assistant", content: greeting }]);
    setLoading(false);
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const pageCtx = PAGE_CONTEXT[location.pathname] || "XTOX marketplace.";
    const userCtx = user ? `User: ${user.full_name}, Email: ${user.email}` : "Not logged in.";
    const history = messages.slice(-6).map(m => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n");

    const boostKeywords = ["boost", "featured", "feature my ad", "promote", "Ø±ÙØ¹", "Ù…Ù…ÙŠØ²", "ØªØ±ÙˆÙŠØ¬"];
    const isBoostRequest = boostKeywords.some(k => userMsg.toLowerCase().includes(k));

    const boostInstructions = isBoostRequest ? `
SPECIAL BOOST FLOW: The user wants to boost/feature their ad.
Guide them through these steps:
1. Ask which ad they want to boost (by title)
2. Explain: Ad Boost (Featured status) costs $2 USD or equivalent per ad for 1 week
3. Payment is via Vodafone Cash to number: +201020326953 (Vodafone Egypt)
4. They can pay in any currency equal to $2 USD (e.g. ~100 EGP, ~7.5 AED, etc.)
5. After they send payment, tell them to reply "done" or "paid" and confirm the ad title
6. Once they confirm payment ("done"/"paid"), tell them the admin will activate Featured within a few hours
7. IMPORTANT: If user says "done" or "paid", respond with a confirmation message that starts exactly with: "BOOST_CONFIRMED:" followed by the ad title they mentioned
` : "";

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are XTOX AI Assistant â€” a smart co-pilot for XTOX international classified marketplace.
Context: ${pageCtx}
User info: ${userCtx}
Country: ${detectedCountry || "Unknown"}
${boostInstructions}

Conversation history:
${history}

User message: "${userMsg}"

You help users with:
- Registering and logging in
- Posting and improving their ads (suggest better titles, descriptions, pricing)
- Navigating the marketplace
- Ad Boost / Featured promotion ($2 USD via Vodafone Cash +201020326953)
- Answering questions about buying and selling safely
- Fraud awareness and safety tips

Reply in the SAME LANGUAGE the user is using. Be concise, friendly, helpful. Use markdown for lists. Max 200 words.
NEVER say you are Claude or any AI model â€” you are "XTOX AI".`,
    });

    // If boost confirmed, create a notification for admin
    if (response.startsWith("BOOST_CONFIRMED:")) {
      const adTitle = response.replace("BOOST_CONFIRMED:", "").trim().split("\n")[0];
      if (user) {
        await base44.entities.Notification.create({
          user_email: "Ahmed_sharnou@yahoo.com",
          title: "âš¡ Boost Payment Confirmed",
          message: `User ${user.email} confirmed payment for boosting ad: "${adTitle}"`,
          type: "boost",
        });
        await base44.entities.Notification.create({
          user_email: user.email,
          title: "Boost request received!",
          message: `Your boost request for "${adTitle}" has been received. Admin will activate Featured status within a few hours.`,
          type: "boost",
        });
      }
    }

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice not supported in this browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "auto";
    recognition.start();
    setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const QUICK_ACTIONS = [
    { label: "How to post an ad?", icon: "ðŸ“‹" },
    { label: "Boost my ad to Featured", icon: "âš¡" },
    { label: "Is this price fair?", icon: "ðŸ’°" },
    { label: "Safety tips", icon: "ðŸ›¡ï¸" },
  ];

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-pulse" />
          <Zap className="w-6 h-6 text-secondary" />
          <span className="absolute right-16 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            XTOX AI Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-card border border-border rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${minimized ? "w-72 h-14" : "w-80 md:w-96 h-[520px]"}`}
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">XTOX AI</p>
                <p className="text-xs text-primary-foreground/60">Your smart marketplace co-pilot</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(!minimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && loading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>XTOX AI is thinking...</span>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                        <Zap className="w-3 h-3 text-secondary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ul]:my-1 [&_li]:my-0">
                          {msg.content}
                        </ReactMarkdown>
                      ) : msg.content}
                    </div>
                  </div>
                ))}

                {loading && messages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                      <Zap className="w-3 h-3 text-secondary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && !loading && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map(a => (
                    <button
                      key={a.label}
                      onClick={() => sendMessage(a.label)}
                      className="text-xs bg-muted hover:bg-primary hover:text-primary-foreground px-2.5 py-1.5 rounded-lg transition-colors border border-border"
                    >
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2 flex-shrink-0">
                <button
                  onClick={handleVoice}
                  className={`p-2 rounded-xl transition-colors flex-shrink-0 ${listening ? "bg-red-100 text-red-500 animate-pulse" : "hover:bg-muted text-muted-foreground"}`}
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
