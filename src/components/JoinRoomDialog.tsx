import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface JoinRoomDialogProps {
  onJoinRoom: (roomId: string) => void;
}

export function JoinRoomDialog({ onJoinRoom }: JoinRoomDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!roomId.trim()) return;
    setJoining(true);
    const { data } = await supabase.from("rooms").select("*").eq("id", roomId.trim()).maybeSingle();
    if (!data) {
      toast.error(t("rooms.notFound"));
    } else {
      onJoinRoom(roomId.trim());
      setOpen(false);
    }
    setRoomId("");
    setJoining(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <KeyRound className="h-4 w-4" />
          {t("rooms.join")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("rooms.joinTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder={t("rooms.idPlaceholder")}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            maxLength={20}
            className="bg-secondary border-border font-mono"
          />
          <Button onClick={handleJoin} disabled={!roomId.trim() || joining} className="w-full">
            {joining ? "..." : t("rooms.join")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
