import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addAccount, getActiveUsername } from "@/lib/accounts";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export default function Index() {
  const { t } = useTranslation();
  const [username, setUsername] = useState(() => getActiveUsername() || localStorage.getItem("chat-username") || "");
  const navigate = useNavigate();

  const handleEnter = () => {
    const name = username.trim();
    if (name.length < 2) return;
    localStorage.setItem("chat-username", name);
    addAccount(name);
    navigate("/rooms");
  };

  const isReady = username.trim().length >= 2;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6 text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-foreground">
            Q<span className="text-primary text-glow">yro</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs text-primary font-medium mt-4">
            <Zap className="h-3 w-3" />
            {t("header.tagline")}
          </div>
        </motion.div>

        {/* Username input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            {t("username.prompt")}
          </p>

          <input
            type="text"
            placeholder={t("username.placeholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
            maxLength={20}
            className="w-full rounded-xl border border-border bg-card px-5 py-3.5 text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-lg font-medium"
          />

          {!isReady && username.length > 0 && (
            <p className="text-xs text-muted-foreground">{t("username.minChars")}</p>
          )}

          <motion.button
            onClick={handleEnter}
            disabled={!isReady}
            whileHover={isReady ? { scale: 1.02 } : {}}
            whileTap={isReady ? { scale: 0.98 } : {}}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3.5 font-semibold text-sm disabled:opacity-30 hover:brightness-110 transition-all"
          >
            {t("header.subtitle")}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
