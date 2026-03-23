import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Poll, PollVote } from "@/lib/supabase";

interface PollCardProps {
  poll: Poll;
  votes: PollVote[];
  username: string;
  onVote: (pollId: string, optionIndex: number) => void;
}

export function PollCard({ poll, votes, username, onVote }: PollCardProps) {
  const { t } = useTranslation();
  const options: string[] = useMemo(() => {
    try {
      return typeof poll.options === "string" ? JSON.parse(poll.options) : poll.options;
    } catch {
      return [];
    }
  }, [poll.options]);

  const hasVoted = votes.some((v) => v.username === username);
  const totalVotes = votes.length;

  return (
    <div className="bg-card/80 backdrop-blur border border-border rounded-xl p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📊</span>
        <span className="text-xs font-medium text-muted-foreground">{t("polls.poll")} • {poll.creator_username}</span>
      </div>
      <p className="text-sm font-semibold text-foreground mb-3">{poll.question}</p>
      <div className="space-y-2">
        {options.map((option, i) => {
          const count = votes.filter((v) => v.option_index === i).length;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

          return (
            <button
              key={i}
              onClick={() => !hasVoted && onVote(poll.id, i)}
              disabled={hasVoted}
              className={`w-full text-start relative overflow-hidden rounded-lg border px-3 py-2 text-sm transition-all ${
                hasVoted
                  ? "border-border cursor-default"
                  : "border-primary/30 hover:border-primary cursor-pointer"
              }`}
            >
              {hasVoted && (
                <div
                  className="absolute inset-y-0 start-0 bg-primary/20 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative z-10 flex justify-between">
                <span className="text-foreground">{option}</span>
                {hasVoted && <span className="text-muted-foreground text-xs">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
      {hasVoted && (
        <p className="text-xs text-muted-foreground mt-2">{totalVotes} {t("polls.votes")}</p>
      )}
    </div>
  );
}
