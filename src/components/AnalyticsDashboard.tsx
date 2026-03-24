import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, X, MessageCircle, Users, Vote, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Stats {
  totalMessages: number;
  totalPolls: number;
  totalBadges: number;
  totalRooms: number;
  topUsers: { username: string; count: number }[];
}

export function AnalyticsDashboard({ community }: { community: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!open || !community) return;

    const fetchStats = async () => {
      const [msgs, polls, badges, rooms] = await Promise.all([
        supabase.from("messages").select("username", { count: "exact" }).eq("community", community),
        supabase.from("polls").select("id", { count: "exact" }).eq("community", community),
        supabase.from("user_badges").select("id", { count: "exact" }).eq("community", community),
        supabase.from("rooms").select("id", { count: "exact" }).eq("community", community),
      ]);

      // Get top users from messages
      const userCounts: Record<string, number> = {};
      msgs.data?.forEach((m) => {
        userCounts[m.username] = (userCounts[m.username] || 0) + 1;
      });
      const topUsers = Object.entries(userCounts)
        .map(([username, count]) => ({ username, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalMessages: msgs.count || 0,
        totalPolls: polls.count || 0,
        totalBadges: badges.count || 0,
        totalRooms: rooms.count || 0,
        topUsers,
      });
    };

    fetchStats();
  }, [open, community]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg bg-secondary/80 backdrop-blur hover:bg-secondary transition-colors"
        title={t("analytics.title")}
      >
        <BarChart3 className="h-4 w-4 text-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-6 mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">{t("analytics.title")}</h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-secondary">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {stats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: MessageCircle, label: t("analytics.messages"), value: stats.totalMessages, color: "text-primary" },
                      { icon: Vote, label: t("analytics.polls"), value: stats.totalPolls, color: "text-accent" },
                      { icon: Award, label: t("analytics.badges"), value: stats.totalBadges, color: "text-primary" },
                      { icon: Users, label: t("analytics.rooms"), value: stats.totalRooms, color: "text-accent" },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="bg-secondary/50 rounded-xl p-3 text-center"
                      >
                        <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {stats.topUsers.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {t("analytics.topUsers")}
                      </h4>
                      <div className="space-y-1.5">
                        {stats.topUsers.map((user, i) => (
                          <div key={user.username} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary w-4">{i + 1}</span>
                            <div className="flex-1 bg-secondary/30 rounded-full h-5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${(user.count / (stats.topUsers[0]?.count || 1)) * 100}%`,
                                }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="h-full bg-primary/30 rounded-full flex items-center px-2"
                              >
                                <span className="text-[10px] font-medium text-foreground truncate">
                                  {user.username}
                                </span>
                              </motion.div>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{user.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
