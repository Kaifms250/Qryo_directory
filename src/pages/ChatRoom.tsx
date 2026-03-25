import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { communities } from "@/lib/communities";
import { useChat } from "@/hooks/useChat";
import { usePresence } from "@/hooks/usePresence";
import { usePolls } from "@/hooks/usePolls";
import { useBadges } from "@/hooks/useBadges";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRoomMembers } from "@/hooks/useRooms";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ChatMessage } from "@/components/ChatMessage";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { IcebreakerBanner } from "@/components/IcebreakerBanner";
import { PollCard } from "@/components/PollCard";
import { CreatePollDialog } from "@/components/CreatePollDialog";
import { BadgePopover } from "@/components/BadgePopover";
import { ProfileCustomizer } from "@/components/ProfileCustomizer";
import { VoiceMessageButton } from "@/components/VoiceMessageButton";
import { RoomAdminControls } from "@/components/RoomAdminControls";
import { TypingIndicator } from "@/components/TypingIndicator";
import { SmartMatchPanel } from "@/components/SmartMatchPanel";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { sanitizeInput, createRateLimiter } from "@/lib/sanitize";
import { addAccount } from "@/lib/accounts";
import { ArrowLeft, Send, Loader2, Pin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const messageRateLimiter = createRateLimiter(1500);

export default function ChatRoom() {
  const { t } = useTranslation();
  const { communityId } = useParams<{ communityId: string }>();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room") || null;
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [username, setUsername] = useState(() => localStorage.getItem("chat-username") || "");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  const community = useMemo(
    () => communities.find((c) => c.id === communityId),
    [communityId]
  );

  const { messages, loading, sendMessage } = useChat(communityId || "", roomId);
  const onlineCount = usePresence(communityId || "", username);
  const { polls, votes, createPoll, vote } = usePolls(communityId || "", roomId);
  const { giveBadge, getBadgeCounts } = useBadges(communityId || "");
  const { profile, updateProfile } = useUserProfile(username);
  const { members, joinRoom, kickUser, muteUser, unmuteUser } = useRoomMembers(roomId || "");
  const { typingUsers, setTyping } = useTypingIndicator(communityId || "", roomId, username);
  const { track } = useAnalytics(username);

  const isAdmin = useMemo(
    () => members.some((m) => m.username === username && m.role === "admin"),
    [members, username]
  );
  const isMuted = useMemo(
    () => members.some((m) => m.username === username && m.is_muted),
    [members, username]
  );

  // Load pinned messages
  useEffect(() => {
    if (!communityId) return;
    let query = supabase.from("pinned_messages").select("message_id").eq("community", communityId);
    if (roomId) query = query.eq("room_id", roomId);
    query.then(({ data }) => {
      if (data) setPinnedIds(new Set(data.map((d: { message_id: string }) => d.message_id)));
    });
  }, [communityId, roomId]);

  // Auto-join room
  useEffect(() => {
    if (roomId && username && !members.some((m) => m.username === username)) {
      joinRoom(username);
    }
  }, [roomId, username, members, joinRoom]);

  useEffect(() => {
    if (!username) navigate("/", { replace: true });
  }, [username, navigate]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Track room entry
  useEffect(() => {
    if (communityId && username) {
      track("room_entered", { community: communityId, room: roomId || "main" });
    }
  }, [communityId, roomId, username, track]);

  if (!community) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSend = async () => {
    const sanitized = sanitizeInput(input);
    if (!sanitized) return;
    if (isMuted) { toast.error(t("rooms.youAreMuted")); return; }
    if (!messageRateLimiter.canProceed()) { toast.error(t("chat.rateLimited")); return; }
    setInput("");
    setTyping(false);
    await sendMessage(username, sanitized);
    track("message_sent", { community: communityId || "", type: "text" });
    inputRef.current?.focus();
  };

  const handleVoice = async (blob: Blob, duration: number) => {
    if (isMuted) { toast.error(t("rooms.youAreMuted")); return; }
    const audioUrl = URL.createObjectURL(blob);
    await sendMessage(username, "🎤 Voice message", "voice", { audioUrl, duration });
    track("message_sent", { community: communityId || "", type: "voice" });
  };

  const handlePin = async (messageId: string) => {
    if (!isAdmin) return;
    if (pinnedIds.has(messageId)) {
      await supabase.from("pinned_messages").delete().eq("message_id", messageId);
      setPinnedIds((prev) => { const n = new Set(prev); n.delete(messageId); return n; });
    } else {
      await supabase.from("pinned_messages").insert({
        message_id: messageId,
        community: communityId,
        room_id: roomId,
        pinned_by: username,
      });
      setPinnedIds((prev) => new Set(prev).add(messageId));
    }
    track("message_pinned", { community: communityId || "" });
  };

  const handleAccountSwitch = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem("chat-username", newUsername);
    track("account_switched", { to: newUsername });
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setTyping(value.length > 0);
  };

  return (
    <div className={`h-screen flex flex-col relative ${community.theme}`}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={community.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.5)' }} />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex-shrink-0"
      >
        <div className="relative flex items-center gap-2 px-4 py-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-lg bg-secondary/80 backdrop-blur hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground truncate text-sm">
              {roomId ? members.find((m) => m.role === "admin")?.username + "'s Room" : t(`communities.${community.id}`)}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <motion.span
                className={`h-2 w-2 rounded-full ${onlineCount > 0 ? "bg-green-500" : "bg-muted-foreground/40"}`}
                animate={onlineCount > 0 ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>{onlineCount} {t("chat.online")}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <AnalyticsDashboard community={communityId || ""} />
            <CreatePollDialog onCreatePoll={async (q, o) => { await createPoll(q, o, username); track("poll_created", { community: communityId || "" }); }} />
            <ProfileCustomizer profile={profile} onUpdate={updateProfile} />
            {roomId && (
              <RoomAdminControls
                roomId={roomId}
                members={members}
                currentUsername={username}
                isAdmin={isAdmin}
                onKick={kickUser}
                onMute={muteUser}
                onUnmute={unmuteUser}
              />
            )}
            <AccountSwitcher activeUsername={username} onSwitch={handleAccountSwitch} />
            <LanguageSwitcher />
          </div>
        </div>
      </motion.div>

      {/* Messages area */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        {/* Smart Match */}
        {!loading && (
          <SmartMatchPanel username={username} community={communityId || ""} />
        )}

        {/* Icebreaker */}
        {!loading && messages.length === 0 && (
          <IcebreakerBanner community={communityId || "gaming"} onUse={(text) => setInput(text)} />
        )}

        {/* Active polls */}
        {polls.slice(0, 3).map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            votes={votes[poll.id] || []}
            username={username}
            onVote={(pid, idx) => { vote(pid, idx, username); track("poll_voted", { community: communityId || "" }); }}
          />
        ))}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground text-sm">
              {t("chat.beFirst", { name: t(`communities.${community.id}`) })}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="group relative"
              >
                {pinnedIds.has(msg.id) && (
                  <div className="flex items-center gap-1 mb-1 text-xs text-primary">
                    <Pin className="h-3 w-3" /> {t("chat.pinned")}
                  </div>
                )}
                <ChatMessage
                  message={msg}
                  isOwn={msg.username === username}
                  profile={profile}
                  badgeSlot={
                    msg.username !== username ? (
                      <BadgePopover
                        targetUsername={msg.username}
                        currentUsername={username}
                        badgeCounts={getBadgeCounts(msg.username)}
                        onGiveBadge={async (type) => { const result = await giveBadge(msg.username, type, username); track("badge_given", { community: communityId || "", type }); return result; }}
                      >
                        <span className="text-xs font-medium text-primary">{msg.username}</span>
                      </BadgePopover>
                    ) : undefined
                  }
                />
                {isAdmin && (
                  <button
                    onClick={() => handlePin(msg.id)}
                    className="absolute top-0 end-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-secondary/80 hover:bg-secondary"
                    title={pinnedIds.has(msg.id) ? "Unpin" : "Pin"}
                  >
                    <Pin className={`h-3 w-3 ${pinnedIds.has(msg.id) ? "text-primary" : "text-muted-foreground"}`} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Typing indicator */}
      <div className="relative z-10">
        <TypingIndicator typingUsers={typingUsers} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex-shrink-0 px-4 pb-4 pt-2"
      >
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
          <VoiceMessageButton onSend={handleVoice} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isMuted ? t("rooms.youAreMuted") : t("chat.messagePlaceholder", { name: t(`communities.${community.id}`) })}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            maxLength={500}
            disabled={isMuted}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isMuted}
            className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:brightness-110 transition-all active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
