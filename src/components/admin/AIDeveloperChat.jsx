import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Bot, Loader2, Code2, RefreshCw, BookOpen, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SYSTEM_PROMPT = `You are an elite AI Software Developer and Architect embedded in the XTOX classified marketplace platform (React + Tailwind CSS + Base44 backend-as-a-service).

PLATFORM KNOWLEDGE:
- Frontend: React 18, Tailwind CSS, shadcn/ui, Lucide icons, Framer Motion, React Router v6, React Query
- Backend: Base44 SDK — base44.entities.EntityName.create/update/delete/filter/list/subscribe, base44.integrations.Core.InvokeLLM/UploadFile/SendEmail
- Auth: useAuth() hook from @/lib/AuthContext, base44.auth.me/updateMe/logout/redirectToLogin
- File structure: pages/, components/, entities/ (JSON schemas), hooks/, lib/

CAPABILITIES:
- Write complete, production-ready React components
- Design entity schemas and database architecture  
- Implement real-time features using .subscribe()
- Optimize performance, accessibility, and UX
- Debug and fix bugs with root cause analysis
- Implement AI features using InvokeLLM
- Design responsive mobile-first layouts
- Refactor code for maintainability

LEARNING MODE (Silent Background):
- You continuously analyze the admin's requests to learn their coding style preferences
- You adapt your code style, variable naming, and patterns to match what you observe
- You proactively suggest improvements based on patterns you've learned
- You remember context from earlier in this conversation

RESPONSE FORMAT:
1. 🎯 Understanding — restate what was asked
2. 🏗️ Plan — technical approach
3. 💻 Code — complete, ready-to-paste code snippets with file paths
4. ⚠️ Notes — warnings, dependencies, or follow-ups needed

Always write COMPLETE code, never partial. Include all imports. Be opinionated and suggest best practices.`;

export default function AIDeveloperChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 **AI Developer Console — Maximum Intelligence Mode**\n\nI'm your elite developer with full knowledge of the XTOX codebase.\n\n**What I can do:**\n- 🔧 Fix any bug with root-cause analysis\n- ✨ Build new features end-to-end\n- 🎨 Redesign UI components\n- 🧠 Learn your coding style silently\n- 📊 Analyze & optimize performance\n- 🔐 Security & fraud detection improvements\n- 🤖 AI feature enhancements\n\nGive me any order — I'll deliver production-ready code."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeStyle, setCodeStyle] = useState({ patterns: [], preferences: [] });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Silent learning: analyze messages to build code style profile
  const learnFromConversation = (userMsg) => {
    const patterns = [];
    if (userMsg.includes("async/await")) patterns.push("prefers async/await");
    if (userMsg.includes("arrow")) patterns.push("prefers arrow functions");
    if (userMsg.includes("TypeScript") || userMsg.includes("tsx")) patterns.push("TypeScript preference noted");
    if (patterns.length > 0) {
      setCodeStyle(prev => ({
        patterns: [...new Set([...prev.patterns, ...patterns])],
        preferences: prev.preferences
      }));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    learnFromConversation(input);
    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);

    const history = [...messages, userMsg]
      .slice(-12)
      .map(m => `${m.role === "user" ? "Admin" : "AI Dev"}: ${m.content}`)
      .join("\n\n");

    const styleCtx = codeStyle.patterns.length > 0
      ? `\nLearned style preferences: ${codeStyle.patterns.join(", ")}.`
      : "";

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}${styleCtx}

Full conversation:
${history}

Respond as the AI Developer with production-ready code:`,
      model: "claude_sonnet_4_6"
    });

    setMessages(p => [...p, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const QUICK_ORDERS = [
    { label: "Fix all current bugs", icon: "🔧" },
    { label: "Improve mobile UX", icon: "📱" },
    { label: "Optimize performance", icon: "⚡" },
    { label: "Add dark mode toggle", icon: "🌙" },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <Code2 className="w-4 h-4 text-secondary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm">AI Developer — Maximum Intelligence</p>
          <p className="text-xs text-primary-foreground/60">Elite mode • Silent learning • Production-grade code</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {codeStyle.patterns.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-primary-foreground/60" title="AI has learned your style">
              <BookOpen className="w-3 h-3" />
              <span>{codeStyle.patterns.length} styles learned</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-primary-foreground/70">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
              {msg.role === "assistant" ? (
                <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_code]:text-xs">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-muted rounded-2xl px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">AI Developer is thinking deeply...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Orders */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {QUICK_ORDERS.map(o => (
            <button key={o.label} onClick={() => { setInput(o.label); }}
              className="text-xs bg-muted hover:bg-primary hover:text-primary-foreground px-2.5 py-1.5 rounded-lg transition-colors border border-border flex items-center gap-1">
              {o.icon} {o.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Give development orders to AI..."
          className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}