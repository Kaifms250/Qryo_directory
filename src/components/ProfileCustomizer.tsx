import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AVATAR_STYLES, BUBBLE_COLORS, type useUserProfile } from "@/hooks/useUserProfile";
import { Settings } from "lucide-react";
import type { UserProfile } from "@/lib/supabase";

interface ProfileCustomizerProps {
  profile: UserProfile | null;
  onUpdate: ReturnType<typeof useUserProfile>["updateProfile"];
}

export function ProfileCustomizer({ profile, onUpdate }: ProfileCustomizerProps) {
  const { t } = useTranslation();
  if (!profile) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors" title={t("profile.customize")}>
          <Settings className="h-4 w-4 text-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("profile.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          {/* Avatar style */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("profile.avatarStyle")}</p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onUpdate({ avatar_style: style.id })}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.gradient} transition-all ${profile.avatar_style === style.id ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110" : "hover:scale-105"}`}
                >
                  <span className="text-xs font-bold text-white">{profile.username[0]?.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat bubble color */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("profile.bubbleColor")}</p>
            <div className="flex flex-wrap gap-2">
              {BUBBLE_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdate({ chat_bubble_color: color.id })}
                  className={`w-8 h-8 rounded-lg ${color.class} transition-all ${profile.chat_bubble_color === color.id ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110" : "hover:scale-105"}`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("profile.bio")}</p>
            <Input
              value={profile.bio || ""}
              onChange={(e) => onUpdate({ bio: e.target.value })}
              placeholder={t("profile.bioPlaceholder")}
              maxLength={160}
              className="bg-secondary border-border text-sm"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
