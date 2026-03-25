import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Lock, Globe } from "lucide-react";

interface CreateIdBannerProps {
  open: boolean;
  onClose: () => void;
  onCreateRoom: (name: string, description: string, isPrivate: boolean) => void;
  onJoinRoom: (roomId: string) => void;
}

export function CreateIdBanner({ open, onClose, onCreateRoom, onJoinRoom }: CreateIdBannerProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomId, setRoomId] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateRoom(name.trim(), description.trim(), isPrivate);
    setName("");
    setDescription("");
    onClose();
  };

  const handleJoin = () => {
    if (!roomId.trim()) return;
    onJoinRoom(roomId.trim());
    setRoomId("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 relative">
            <button
              onClick={onClose}
              className="absolute top-3 end-3 p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-foreground mb-4">
              {t("nav.createId", "Create ID")}
            </h3>

            {/* Tab toggle */}
            <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5 mb-4">
              <button
                onClick={() => setTab("create")}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
                  tab === "create" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("rooms.createRoom", "Create Room")}
              </button>
              <button
                onClick={() => setTab("join")}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
                  tab === "join" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("rooms.joinRoom", "Join Room")}
              </button>
            </div>

            {tab === "create" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={t("rooms.roomName", "Room name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  placeholder={t("rooms.description", "Description (optional)")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                    {isPrivate ? t("rooms.private", "Private") : t("rooms.public", "Public")}
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-30 hover:brightness-110 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t("rooms.create", "Create")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("rooms.enterRoomId", "Enter Room ID")}
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                />
                <button
                  onClick={handleJoin}
                  disabled={!roomId.trim()}
                  className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-xs font-semibold disabled:opacity-30 hover:brightness-110 transition-all"
                >
                  {t("rooms.join", "Join")}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
