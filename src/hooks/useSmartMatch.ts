import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MatchedUser {
  username: string;
  score: number;
  sharedCommunities: string[];
  badges: number;
  messageCount: number;
}

export function useSmartMatch(username: string, community: string) {
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username || !community) return;

    const findMatches = async () => {
      setLoading(true);

      // Get active users in this community (recent messages)
      const { data: recentMessages } = await supabase
        .from("messages")
        .select("username")
        .eq("community", community)
        .neq("username", username)
        .order("created_at", { ascending: false })
        .limit(200);

      if (!recentMessages) {
        setLoading(false);
        return;
      }

      // Count message frequency per user
      const userMessageCount: Record<string, number> = {};
      recentMessages.forEach((m) => {
        userMessageCount[m.username] = (userMessageCount[m.username] || 0) + 1;
      });

      const uniqueUsers = Object.keys(userMessageCount);

      // Get badge counts for these users
      const { data: badges } = await supabase
        .from("user_badges")
        .select("username")
        .eq("community", community)
        .in("username", uniqueUsers.slice(0, 50));

      const userBadgeCount: Record<string, number> = {};
      badges?.forEach((b) => {
        userBadgeCount[b.username] = (userBadgeCount[b.username] || 0) + 1;
      });

      // Score users: activity + badges
      const scored: MatchedUser[] = uniqueUsers.slice(0, 10).map((u) => ({
        username: u,
        messageCount: userMessageCount[u] || 0,
        badges: userBadgeCount[u] || 0,
        sharedCommunities: [community],
        score: (userMessageCount[u] || 0) * 2 + (userBadgeCount[u] || 0) * 5,
      }));

      scored.sort((a, b) => b.score - a.score);
      setMatches(scored.slice(0, 5));
      setLoading(false);
    };

    findMatches();
  }, [username, community]);

  return { matches, loading };
}
