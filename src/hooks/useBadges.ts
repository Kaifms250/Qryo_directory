import { useState, useEffect, useCallback } from "react";
import { supabase, type UserBadge } from "@/lib/supabase";

export const BADGE_TYPES = [
  { type: "helpful", emoji: "🤝", label: "Helpful" },
  { type: "funny", emoji: "😂", label: "Funny" },
  { type: "insightful", emoji: "💡", label: "Insightful" },
  { type: "creative", emoji: "🎨", label: "Creative" },
  { type: "supportive", emoji: "💪", label: "Supportive" },
] as const;

export function useBadges(community: string) {
  const [badges, setBadges] = useState<Record<string, UserBadge[]>>({});

  useEffect(() => {
    if (!community) return;
    supabase
      .from("user_badges")
      .select("*")
      .eq("community", community)
      .then(({ data }) => {
        const grouped: Record<string, UserBadge[]> = {};
        ((data as UserBadge[]) ?? []).forEach((b) => {
          if (!grouped[b.username]) grouped[b.username] = [];
          grouped[b.username].push(b);
        });
        setBadges(grouped);
      });
  }, [community]);

  const giveBadge = useCallback(async (toUsername: string, badgeType: string, fromUsername: string) => {
    if (toUsername === fromUsername) return;
    const { error } = await supabase.from("user_badges").insert({
      username: toUsername,
      badge_type: badgeType,
      given_by: fromUsername,
      community,
    });
    if (!error) {
      setBadges((prev) => ({
        ...prev,
        [toUsername]: [...(prev[toUsername] || []), {
          id: "", username: toUsername, badge_type: badgeType,
          given_by: fromUsername, community, created_at: new Date().toISOString(),
        }],
      }));
    }
    return { error };
  }, [community]);

  const getBadgeCounts = useCallback((username: string) => {
    const userBadges = badges[username] || [];
    const counts: Record<string, number> = {};
    userBadges.forEach((b) => {
      counts[b.badge_type] = (counts[b.badge_type] || 0) + 1;
    });
    return counts;
  }, [badges]);

  return { badges, giveBadge, getBadgeCounts };
}
