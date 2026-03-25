import { useState, useEffect, useCallback } from "react";
import { supabase, type Room, type RoomMember } from "@/lib/supabase";

export function useRooms(community: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!community) return;
    setLoading(true);
    supabase
      .from("rooms")
      .select("*")
      .eq("community", community)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRooms((data as Room[]) ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel(`rooms:${community}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "rooms",
        filter: `community=eq.${community}`,
      }, (payload) => {
        setRooms((prev) => [payload.new as Room, ...prev]);
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [community]);

  const createRoom = useCallback(async (name: string, description: string, creator: string, isPrivate: boolean) => {
    const { data, error } = await supabase
      .from("rooms")
      .insert({ name, description, community, creator_username: creator, is_private: isPrivate })
      .select()
      .single();
    if (data) {
      // Add creator as admin member
      await supabase.from("room_members").insert({
        room_id: data.id,
        username: creator,
        role: "admin",
      });
    }
    return { data: data as Room | null, error };
  }, [community]);

  return { rooms, loading, createRoom };
}

export function useRoomMembers(roomId: string) {
  const [members, setMembers] = useState<RoomMember[]>([]);

  useEffect(() => {
    if (!roomId) return;
    supabase.from("room_members").select("*").eq("room_id", roomId)
      .then(({ data }) => setMembers((data as RoomMember[]) ?? []));
  }, [roomId]);

  const joinRoom = useCallback(async (username: string) => {
    await supabase.from("room_members").insert({ room_id: roomId, username, role: "member" });
    setMembers((prev) => [...prev, { id: "", room_id: roomId, username, role: "member", is_muted: false, is_kicked: false, joined_at: new Date().toISOString() }]);
  }, [roomId]);

  const kickUser = useCallback(async (username: string) => {
    await supabase.from("room_members").update({ is_kicked: true }).eq("room_id", roomId).eq("username", username);
    setMembers((prev) => prev.map((m) => m.username === username ? { ...m, is_kicked: true } : m));
  }, [roomId]);

  const muteUser = useCallback(async (username: string) => {
    await supabase.from("room_members").update({ is_muted: true }).eq("room_id", roomId).eq("username", username);
    setMembers((prev) => prev.map((m) => m.username === username ? { ...m, is_muted: true } : m));
  }, [roomId]);

  const unmuteUser = useCallback(async (username: string) => {
    await supabase.from("room_members").update({ is_muted: false }).eq("room_id", roomId).eq("username", username);
    setMembers((prev) => prev.map((m) => m.username === username ? { ...m, is_muted: false } : m));
  }, [roomId]);

  return { members, joinRoom, kickUser, muteUser, unmuteUser };
}
