import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BADGE_TYPES } from "@/hooks/useBadges";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface BadgePopoverProps {
  targetUsername: string;
  currentUsername: string;
  badgeCounts: Record<string, number>;
  onGiveBadge: (badgeType: string) => Promise<{ error: unknown } | undefined>;
  children: React.ReactNode;
}

export function BadgePopover({ targetUsername, currentUsername, badgeCounts, onGiveBadge, children }: BadgePopoverProps) {
  const { t } = useTranslation();

  if (targetUsername === currentUsername) {
    return (
      <div className="flex items-center gap-1">
        {children}
        <BadgeDisplay counts={badgeCounts} />
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          {children}
          <BadgeDisplay counts={badgeCounts} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto bg-card border-border p-2" align="start">
        <p className="text-xs text-muted-foreground mb-2">{t("badges.giveToUser", { user: targetUsername })}</p>
        <div className="flex gap-1">
          {BADGE_TYPES.map((badge) => (
            <button
              key={badge.type}
              onClick={async () => {
                const result = await onGiveBadge(badge.type);
                if (result?.error) toast.error(t("badges.alreadyGiven"));
                else toast.success(t("badges.given", { badge: badge.label }));
              }}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors text-lg"
              title={badge.label}
            >
              {badge.emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function BadgeDisplay({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).filter(([, c]) => c > 0);
  if (entries.length === 0) return null;

  return (
    <span className="flex gap-0.5 ms-1">
      {entries.slice(0, 3).map(([type, count]) => {
        const badge = BADGE_TYPES.find((b) => b.type === type);
        return badge ? (
          <span key={type} className="text-[10px] flex items-center gap-0.5 bg-secondary/60 rounded-full px-1 py-0.5">
            {badge.emoji}{count > 1 && <span className="text-muted-foreground">{count}</span>}
          </span>
        ) : null;
      })}
    </span>
  );
}
