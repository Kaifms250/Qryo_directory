import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { communities } from "@/lib/communities";
import { useChat } from "@/hooks/useChat";
import { usePresence } from "@/hooks/usePresence";
import { ChatMessage } from "@/components/ChatMessage";
import { ArrowLeft, Send, Users, Loader2 } from "lucide-react";

export default function ChatRoom() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const username = sessionStorage.getItem("chat-username") || "";
  const community = useMemo(
    () => communities.find((c) => c.id === communityId),
    [communityId]
  );

  const { messages, loading, sendMessage } = useChat(communityId || "");
  const onlineCount = usePresence(communityId || "", username);

  // Redirect if no username
  useEffect(() => {
    if (!username) navigate("/", { replace: true });
  }, [username, navigate]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  if (!community) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    await sendMessage(username, msg);
    inputRef.current?.focus();
  };

  return (
    <div className={`h-screen flex flex-col bg-background ${community.theme}`}>
      {/* Header with background image */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 h-28">
          <img
            src={community.image}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg bg-secondary/80 backdrop-blur hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{community.emoji}</span>
              <h1 className="font-bold text-foreground truncate">{community.name}</h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{community.memberCount.toLocaleString()} online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-3">{community.emoji}</span>
            <p className="text-muted-foreground text-sm">
              Be the first to say something in {community.name}!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} isOwn={msg.username === username} />
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Message ${community.name}...`}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            maxLength={500}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:brightness-110 transition-all active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
