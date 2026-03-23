import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { communities } from "@/lib/communities";
import { CommunityCard } from "@/components/CommunityCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { CreateRoomDialog } from "@/components/CreateRoomDialog";
import { JoinRoomDialog } from "@/components/JoinRoomDialog";
import { usePresenceCounts } from "@/hooks/usePresence";
import { useRooms } from "@/hooks/useRooms";
import { addAccount, getActiveUsername } from "@/lib/accounts";
import { MessageCircle, Zap, Lock, Globe } from "lucide-react";

export default function Index() {
  const { t } = useTranslation();
  const [username, setUsername] = useState(() => getActiveUsername() || localStorage.getItem("chat-username") || "");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("gaming");
  const navigate = useNavigate();

  const communityIds = useMemo(() => communities.map((c) => c.id), []);
  const onlineCounts = usePresenceCounts(communityIds, username.trim());
  const { rooms, createRoom } = useRooms(selectedCommunity);

  const handleJoin = (communityId: string) => {
    const name = username.trim();
    if (!name) return;
    localStorage.setItem("chat-username", name);
    addAccount(name);
    navigate(`/chat/${communityId}`);
  };

  const handleJoinRoom = (roomId: string) => {
    const name = username.trim();
    if (!name) return;
    localStorage.setItem("chat-username", name);
    addAccount(name);
    navigate(`/chat/${selectedCommunity}?room=${roomId}`);
  };

  const handleCreateRoom = async (name: string, description: string, isPrivate: boolean) => {
    const un = username.trim();
    if (!un) return;
    const { data } = await createRoom(name, description, un, isPrivate);
    if (data) {
      navigate(`/chat/${selectedCommunity}?room=${data.id}`);
    }
  };

  const handleAccountSwitch = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem("chat-username", newUsername);
  };

  const isReady = username.trim().length >= 2;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-4 end-4 z-20 flex items-center gap-2">
        {isReady && <AccountSwitcher activeUsername={username} onSwitch={handleAccountSwitch} />}
        <LanguageSwitcher />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-10 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
            <Zap className="h-3.5 w-3.5" />
            {t("header.tagline")}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-3">
            {t("header.title")}{" "}
            <span className="text-primary text-glow">{t("header.titleHighlight")}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {t("header.subtitle")}
          </p>
        </div>

        {/* Username input */}
        <div className="max-w-sm mx-auto mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          <p className="text-sm font-medium text-primary mb-3 text-center tracking-wide">
            {t("username.prompt")}
          </p>
          <div className="relative">
            <MessageCircle className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("username.placeholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              className="w-full rounded-xl border border-border bg-card ps-10 pe-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          {!isReady && username.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1.5 ms-1">{t("username.minChars")}</p>
          )}
        </div>

        {/* Communities grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          {communities.map((community, i) => (
            <CommunityCard
              key={community.id}
              community={community}
              index={i}
              onlineCount={onlineCounts[community.id] || 0}
              onClick={() => handleJoin(community.id)}
            />
          ))}
        </div>

        {/* Custom Rooms Section */}
        {isReady && (
          <div className="mt-12 opacity-0 animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{t("rooms.title")}</h2>
              <div className="flex gap-2">
                <JoinRoomDialog onJoinRoom={handleJoinRoom} />
                <CreateRoomDialog onCreateRoom={handleCreateRoom} />
              </div>
            </div>

            {/* Community selector for rooms */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {communities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCommunity(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCommunity === c.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {c.emoji} {t(`communities.${c.id}`)}
                </button>
              ))}
            </div>

            {/* Rooms list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleJoinRoom(room.id)}
                  className="bg-card border border-border rounded-xl p-4 text-start hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {room.is_private ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {room.name}
                    </span>
                  </div>
                  {room.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{room.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground font-mono">{t("rooms.id")}: {room.id}</span>
                    <span className="text-[10px] text-muted-foreground">{t("rooms.by")} {room.creator_username}</span>
                  </div>
                </button>
              ))}
              {rooms.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full text-center py-8">{t("rooms.noRooms")}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
