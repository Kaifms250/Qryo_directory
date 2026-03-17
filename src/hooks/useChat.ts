import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, type Message } from "@/lib/supabase";

export function useChat(community: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    setLoading(true);
    // Fetch existing messages
    supabase
      .from("messages")
      .select("*")
      .eq("community", community)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages(data ?? []);
        setLoading(false);
      });

    // Subscribe to realtime
    const channel = supabase
      .channel(`messages:${community}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `community=eq.${community}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [community]);

  const sendMessage = useCallback(
    async (username: string, content: string) => {
      if (!content.trim()) return;
      await supabase.from("messages").insert({
        community,
        username,
        content: content.trim(),
      });
    },
    [community]
  );

  return { messages, loading, sendMessage };
}
