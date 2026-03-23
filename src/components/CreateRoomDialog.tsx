import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

interface CreateRoomDialogProps {
  onCreateRoom: (name: string, description: string, isPrivate: boolean) => Promise<void>;
}

export function CreateRoomDialog({ onCreateRoom }: CreateRoomDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    await onCreateRoom(name.trim(), description.trim(), isPrivate);
    setName("");
    setDescription("");
    setIsPrivate(false);
    setCreating(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t("rooms.create")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("rooms.createTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder={t("rooms.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="bg-secondary border-border"
          />
          <Input
            placeholder={t("rooms.descPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            className="bg-secondary border-border"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("rooms.private")}</span>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>
          <Button onClick={handleCreate} disabled={!name.trim() || creating} className="w-full">
            {creating ? t("rooms.creating") : t("rooms.create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
