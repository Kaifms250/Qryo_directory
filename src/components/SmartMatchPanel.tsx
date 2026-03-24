import { motion, AnimatePresence } from "framer-motion";
import { useSmartMatch } from "@/hooks/useSmartMatch";
import { Users, Star, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SmartMatchPanelProps {
  username: string;
  community: string;
}

export function SmartMatchPanel({ username, community }: SmartMatchPanelProps) {
  const { t } = useTranslation();
  const { matches, loading } = useSmartMatch(username, community);
  const [expanded, setExpanded] = useState(false);

  if (loading || matches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card/90 backdrop-blur border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary hover:bg-secondary/50 transition-colors"
      >
        <Users className="h-3.5 w-3.5" />
        <span>{t("match.suggested", { count: matches.length })}</span>
        <span className="ms-auto">
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5">
              {matches.map((match, i) => (
                <motion.div
                  key={match.username}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white">
                    {match.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate block">{match.username}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="h-2.5 w-2.5" /> {match.messageCount}
                      </span>
                      {match.badges > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5" /> {match.badges}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
