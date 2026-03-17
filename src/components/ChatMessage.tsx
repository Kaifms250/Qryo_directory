import { type Message } from "@/lib/supabase";
import { useMemo } from "react";

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

const avatarColors = [
  "from-primary to-accent",
  "from-accent to-primary",
  "from-primary/80 to-secondary",
  "from-accent/80 to-primary/60",
];

function getAvatarColor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const colorClass = useMemo(() => getAvatarColor(message.username), [message.username]);

  return (
    <div className={`flex gap-2.5 animate-fade-in ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-xs font-bold text-primary-foreground`}
      >
        {message.username[0].toUpperCase()}
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <span className="text-xs font-medium text-primary mb-0.5 block">{message.username}</span>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-secondary text-secondary-foreground rounded-bl-md"
          }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-muted-foreground mt-0.5 block">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
