import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Shield, UserMinus, VolumeX, Volume2, Copy, Pin } from "lucide-react";
import { toast } from "sonner";
import type { RoomMember } from "@/lib/supabase";

interface RoomAdminControlsProps {
  roomId: string;
  members: RoomMember[];
  currentUsername: string;
  isAdmin: boolean;
  onKick: (username: string) => void;
  onMute: (username: string) => void;
  onUnmute: (username: string) => void;
}

export function RoomAdminControls({ roomId, members, currentUsername, isAdmin, onKick, onMute, onUnmute }: RoomAdminControlsProps) {
  const { t } = useTranslation();

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success(t("rooms.idCopied"));
  };

  if (!isAdmin) {
    return (
      <button onClick={copyRoomId} className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors" title={t("rooms.copyId")}>
        <Copy className="h-4 w-4 text-foreground" />
      </button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors" title={t("rooms.adminControls")}>
          <Shield className="h-4 w-4 text-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-card border-border p-3" align="end">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground">{t("rooms.adminControls")}</p>
          <button onClick={copyRoomId} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Copy className="h-3 w-3" /> {roomId}
          </button>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {members.filter((m) => !m.is_kicked && m.username !== currentUsername).map((member) => (
            <div key={member.username} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-secondary/50">
              <span className="text-sm text-foreground truncate">{member.username}</span>
              <div className="flex gap-1">
                {member.is_muted ? (
                  <button onClick={() => onUnmute(member.username)} className="p-1 rounded text-green-500 hover:bg-green-500/10" title={t("rooms.unmute")}>
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button onClick={() => onMute(member.username)} className="p-1 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title={t("rooms.mute")}>
                    <VolumeX className="h-3.5 w-3.5" />
                  </button>
                )}
                <button onClick={() => onKick(member.username)} className="p-1 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title={t("rooms.kick")}>
                  <UserMinus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
