import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePresence(community: string, username: string) {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!community || !username) return;

    const channel = supabase.channel(`presence:${community}`, {
      config: { presence: { key: username } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ username, joined_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [community, username]);

  return onlineCount;
}

/** Hook to get online counts for multiple communities at once */
export function usePresenceCounts(communityIds: string[], username: string) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!username) return;

    const channels = communityIds.map((id) => {
      const channel = supabase.channel(`presence:${id}`, {
        config: { presence: { key: `${username}-lobby` } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          setCounts((prev) => ({ ...prev, [id]: Object.keys(state).length }));
        })
        .subscribe();

      return channel;
    });

    return () => {
      channels.forEach((ch) => ch.unsubscribe());
    };
  }, [communityIds.join(","), username]);

  return counts;
}
