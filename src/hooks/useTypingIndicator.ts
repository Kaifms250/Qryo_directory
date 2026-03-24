import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useTypingIndicator(community: string, roomId: string | null, username: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!community || !username) return;

    const channelName = `typing:${community}:${roomId || "main"}`;
    const channel = supabase.channel(channelName, {
      config: { presence: { key: username } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).filter(
          (u) => u !== username && state[u]?.some((s: Record<string, unknown>) => s.is_typing)
        );
        setTypingUsers(users);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [community, roomId, username]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current) return;
      channelRef.current.track({ is_typing: isTyping });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (isTyping) {
        timeoutRef.current = setTimeout(() => {
          channelRef.current?.track({ is_typing: false });
        }, 3000);
      }
    },
    []
  );

  return { typingUsers, setTyping };
}
