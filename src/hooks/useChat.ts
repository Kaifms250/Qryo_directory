import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, type Message } from "@/lib/supabase";

export function useChat(community: string, roomId?: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from("messages")
      .select("*")
      .eq("community", community)
      .order("created_at", { ascending: true })
      .limit(100);

    if (roomId) query = query.eq("room_id", roomId);
    else query = query.is("room_id", null);

    query.then(({ data }) => {
      setMessages((data as Message[]) ?? []);
      setLoading(false);
    });

    const channelName = `messages:${community}:${roomId || "main"}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `community=eq.${community}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          // Only add if matching room
          if ((roomId && msg.room_id === roomId) || (!roomId && !msg.room_id)) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [community, roomId]);

  const sendMessage = useCallback(
    async (username: string, content: string, messageType = "text", metadata = {}) => {
      if (!content.trim() && messageType === "text") return;
      await supabase.from("messages").insert({
        community,
        room_id: roomId || null,
        username,
        content: content.trim(),
        message_type: messageType,
        metadata,
      });
    },
    [community, roomId]
  );

  return { messages, loading, sendMessage };
}
