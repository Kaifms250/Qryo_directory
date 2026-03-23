import { useState, useEffect, useCallback } from "react";
import { supabase, type Poll, type PollVote } from "@/lib/supabase";

export function usePolls(community: string, roomId?: string | null) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<Record<string, PollVote[]>>({});

  useEffect(() => {
    if (!community) return;

    let query = supabase.from("polls").select("*").eq("community", community).order("created_at", { ascending: false }).limit(20);
    if (roomId) query = query.eq("room_id", roomId);
    else query = query.is("room_id", null);

    query.then(({ data }) => {
      const pollData = (data as Poll[]) ?? [];
      setPolls(pollData);
      // Fetch votes for all polls
      if (pollData.length > 0) {
        const ids = pollData.map((p) => p.id);
        supabase.from("poll_votes").select("*").in("poll_id", ids)
          .then(({ data: voteData }) => {
            const grouped: Record<string, PollVote[]> = {};
            (voteData as PollVote[] ?? []).forEach((v) => {
              if (!grouped[v.poll_id]) grouped[v.poll_id] = [];
              grouped[v.poll_id].push(v);
            });
            setVotes(grouped);
          });
      }
    });

    const channel = supabase
      .channel(`polls:${community}:${roomId || "main"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "polls", filter: `community=eq.${community}` }, (payload) => {
        setPolls((prev) => [payload.new as Poll, ...prev]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "poll_votes" }, (payload) => {
        const vote = payload.new as PollVote;
        setVotes((prev) => ({
          ...prev,
          [vote.poll_id]: [...(prev[vote.poll_id] || []), vote],
        }));
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [community, roomId]);

  const createPoll = useCallback(async (question: string, options: string[], creator: string) => {
    await supabase.from("polls").insert({
      community,
      room_id: roomId || null,
      creator_username: creator,
      question,
      options: JSON.stringify(options),
    });
  }, [community, roomId]);

  const vote = useCallback(async (pollId: string, optionIndex: number, username: string) => {
    await supabase.from("poll_votes").insert({ poll_id: pollId, username, option_index: optionIndex });
  }, []);

  return { polls, votes, createPoll, vote };
}
