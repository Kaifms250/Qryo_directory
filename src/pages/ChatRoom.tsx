import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { communities } from "@/lib/communities";
import { useChat } from "@/hooks/useChat";
import { usePresence } from "@/hooks/usePresence";
import { ChatMessage } from "@/components/ChatMessage";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { sanitizeInput, createRateLimiter } from "@/lib/sanitize";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const messageRateLimiter = createRateLimiter(1500);

export default function ChatRoom() {
  const { t } = useTranslation();
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const username = localStorage.getItem("chat-username") || "";
  const community = useMemo(
    () => communities.find((c) => c.id === communityId),
    [communityId]
  );

  const { messages, loading, sendMessage } = useChat(communityId || "");
  const onlineCount = usePresence(communityId || "", username);

  useEffect(() => {
    if (!username) navigate("/", { replace: true });
  }, [username, navigate]);

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
    const sanitized = sanitizeInput(input);
    if (!sanitized) return;

    if (!messageRateLimiter.canProceed()) {
      toast.error(t("chat.rateLimited"));
      return;
    }

    setInput("");
    await sendMessage(username, sanitized);
    inputRef.current?.focus();
  };

  return (
    <div className={`h-screen flex flex-col relative ${community.theme}`}>
      {/* Full-screen background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={community.image}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.5)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex-shrink-0">
        <div className="relative flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg bg-secondary/80 backdrop-blur hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h1 className="font-bold text-foreground truncate">
                {t(`communities.${community.id}`)}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${onlineCount > 0 ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"}`} />
              <span>{onlineCount} {t("chat.online")}</span>
            </div>
          </div>

          <LanguageSwitcher />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">
              {t("chat.beFirst", { name: t(`communities.${community.id}`) })}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} isOwn={msg.username === username} />
          ))
        )}
      </div>

      {/* Input */}
      <div className="relative z-10 flex-shrink-0 px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("chat.messagePlaceholder", { name: t(`communities.${community.id}`) })}
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
