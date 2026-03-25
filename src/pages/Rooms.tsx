import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { communities } from "@/lib/communities";
import { CommunityCard } from "@/components/CommunityCard";
import { AppNavbar } from "@/components/AppNavbar";
import { CreateIdBanner } from "@/components/CreateIdBanner";

import { usePresenceCounts } from "@/hooks/usePresence";
import { useRooms } from "@/hooks/useRooms";
import { addAccount } from "@/lib/accounts";
import { Lock, Globe } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Rooms() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [username] = useState(() => {
    const name = localStorage.getItem("chat-username") || "";
    if (!name) return "";
    return name;
  });
  const [selectedCommunity, setSelectedCommunity] = useState<string>("gaming");
  const [showCreateBanner, setShowCreateBanner] = useState(false);

  const communityIds = useMemo(() => communities.map((c) => c.id), []);
  const onlineCounts = usePresenceCounts(communityIds, username);
  const { rooms, createRoom } = useRooms(selectedCommunity);

  // Redirect if no username
  if (!username) {
    navigate("/", { replace: true });
    return null;
  }

  const handleJoin = (communityId: string) => {
    addAccount(username);
    navigate(`/chat/${communityId}`);
  };

  const handleJoinRoom = (roomId: string) => {
    addAccount(username);
    navigate(`/chat/${selectedCommunity}?room=${roomId}`);
  };

  const handleCreateRoom = async (name: string, description: string, isPrivate: boolean) => {
    const { data } = await createRoom(name, description, username, isPrivate);
    if (data) {
      navigate(`/chat/${selectedCommunity}?room=${data.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AppNavbar username={username} onCreateId={() => setShowCreateBanner((v) => !v)} />

      {/* Main content - offset for navbar */}
      <div className={`${isMobile ? "pb-20" : "pr-16"}`}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("header.title", "Explore")} <span className="text-primary text-glow">{t("header.titleHighlight", "Communities")}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("rooms.welcome", "Welcome")}, <span className="text-primary font-medium">{username}</span>
              </p>
            </div>
            <AccountSwitcher activeUsername={username} onSwitch={(newName) => {
              localStorage.setItem("chat-username", newName);
              window.location.reload();
            }} />
          </div>

          {/* Create ID Banner */}
          <CreateIdBanner
            open={showCreateBanner}
            onClose={() => setShowCreateBanner(false)}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />

          {/* Communities grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
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

          {/* Custom Rooms */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">{t("rooms.title", "Custom Rooms")}</h2>

            {/* Community filter */}
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
        </div>
      </div>
    </div>
  );
}
