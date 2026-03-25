import { type Message } from "@/lib/supabase";
import { useMemo } from "react";
import { VoicePlayer } from "@/components/VoicePlayer";
import { AVATAR_STYLES, BUBBLE_COLORS } from "@/hooks/useUserProfile";
import type { UserProfile } from "@/lib/supabase";

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  profile?: UserProfile | null;
  badgeSlot?: React.ReactNode;
}

function getAvatarGradient(username: string, avatarStyle?: string) {
  if (avatarStyle && avatarStyle !== "default") {
    const style = AVATAR_STYLES.find((s) => s.id === avatarStyle);
    if (style) return style.gradient;
  }
  const colors = ["from-primary to-accent", "from-accent to-primary", "from-primary/80 to-secondary", "from-accent/80 to-primary/60"];
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getBubbleClass(bubbleColor?: string) {
  if (bubbleColor && bubbleColor !== "default") {
    const color = BUBBLE_COLORS.find((c) => c.id === bubbleColor);
    if (color) return `${color.class} text-white`;
  }
  return "bg-primary text-primary-foreground";
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessage({ message, isOwn, profile, badgeSlot }: ChatMessageProps) {
  const colorClass = useMemo(() => getAvatarGradient(message.username, profile?.avatar_style), [message.username, profile?.avatar_style]);
  const isVoice = message.message_type === "voice";
  const bubbleClass = isOwn ? getBubbleClass(profile?.chat_bubble_color) : "bg-secondary text-secondary-foreground";

  return (
    <div className={`flex gap-2.5 animate-fade-in ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-xs font-bold text-white`}>
        {message.username[0].toUpperCase()}
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <div className="flex items-center gap-1 mb-0.5">
            {badgeSlot || <span className="text-xs font-medium text-primary">{message.username}</span>}
          </div>
        )}
        <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${bubbleClass} ${isOwn ? "rounded-br-md" : "rounded-bl-md"}`}>
          {isVoice ? (
            <VoicePlayer
              audioUrl={message.metadata?.audioUrl || ""}
              duration={message.metadata?.duration || 0}
            />
          ) : (
            message.content
          )}
        </div>
        <span className="text-[10px] text-muted-foreground mt-0.5 block">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
