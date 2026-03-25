import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Plus, Globe, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserProfile, AVATAR_STYLES, BUBBLE_COLORS } from "@/hooks/useUserProfile";
import { getAccounts, addAccount, switchAccount, removeAccount, type Account } from "@/lib/accounts";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Check, Plus as PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface AppNavbarProps {
  username: string;
  onCreateId: () => void;
}

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

type Panel = "language" | "profile" | null;

export function AppNavbar({ username, onCreateId }: AppNavbarProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile } = useUserProfile(username);
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Account state
  const [accounts, setAccounts] = useState<Account[]>(getAccounts);
  const [newName, setNewName] = useState("");
  const [addingAccount, setAddingAccount] = useState(false);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const togglePanel = (panel: Panel) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  const handleAccountSwitch = (name: string) => {
    switchAccount(name);
    localStorage.setItem("chat-username", name);
    window.location.reload();
  };

  const handleAccountAdd = () => {
    if (!newName.trim() || newName.trim().length < 2) return;
    const updated = addAccount(newName.trim());
    setAccounts(updated);
    handleAccountSwitch(newName.trim());
    setNewName("");
    setAddingAccount(false);
  };

  const handleAccountRemove = (name: string) => {
    const updated = removeAccount(name);
    setAccounts(updated);
    if (name === username && updated.length > 0) {
      handleAccountSwitch(updated[0].username);
    }
  };

  const navItems = [
    { id: "home", icon: Home, label: t("nav.home", "Home"), onClick: () => navigate("/rooms"), active: location.pathname === "/rooms" },
    { id: "create", icon: Plus, label: t("nav.createId", "Create ID"), onClick: onCreateId, active: false, popped: true },
    { id: "language", icon: Globe, label: t("nav.language", "Language"), onClick: () => togglePanel("language"), active: openPanel === "language" },
    { id: "profile", icon: User, label: t("nav.profile", "Profile"), onClick: () => togglePanel("profile"), active: openPanel === "profile" },
  ];

  // Language panel content
  const LanguagePanel = () => (
    <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
      <p className="text-xs font-medium text-muted-foreground px-4 pt-3 pb-2">{t("language.label", "Language")}</p>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => { i18n.changeLanguage(lang.code); setOpenPanel(null); }}
          className={cn(
            "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary/80 transition-colors",
            i18n.language === lang.code ? "text-primary bg-primary/5" : "text-foreground"
          )}
        >
          <span className="text-base">{lang.flag}</span>
          <span>{lang.label}</span>
          {i18n.language === lang.code && <Check className="h-3.5 w-3.5 ms-auto text-primary" />}
        </button>
      ))}
    </div>
  );

  // Profile panel content (merged with accounts)
  const ProfilePanel = () => (
    <div className="bg-card border border-border rounded-xl shadow-2xl min-w-[260px] max-w-[300px] max-h-[70vh] overflow-y-auto scrollbar-thin">
      {/* Current user header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
            {username[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{username}</p>
            <p className="text-[10px] text-muted-foreground">{profile?.bio || t("profile.bioPlaceholder")}</p>
          </div>
        </div>
      </div>

      {profile && (
        <div className="px-4 py-3 space-y-4 border-b border-border">
          {/* Avatar style */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{t("profile.avatarStyle")}</p>
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => updateProfile({ avatar_style: style.id })}
                  className={cn(
                    "w-8 h-8 rounded-full bg-gradient-to-br transition-all",
                    style.gradient,
                    profile.avatar_style === style.id ? "ring-2 ring-primary ring-offset-1 ring-offset-card scale-110" : "hover:scale-105"
                  )}
                >
                  <span className="text-[10px] font-bold text-white">{username[0]?.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bubble color */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{t("profile.bubbleColor")}</p>
            <div className="flex flex-wrap gap-1.5">
              {BUBBLE_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => updateProfile({ chat_bubble_color: color.id })}
                  className={cn(
                    "w-7 h-7 rounded-lg transition-all",
                    color.class,
                    profile.chat_bubble_color === color.id ? "ring-2 ring-primary ring-offset-1 ring-offset-card scale-110" : "hover:scale-105"
                  )}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{t("profile.bio")}</p>
            <Input
              value={profile.bio || ""}
              onChange={(e) => updateProfile({ bio: e.target.value })}
              placeholder={t("profile.bioPlaceholder")}
              maxLength={160}
              className="h-8 text-xs bg-secondary border-border"
            />
          </div>
        </div>
      )}

      {/* Account switcher */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{t("accounts.title")}</p>
        <div className="space-y-1 mb-2">
          {accounts.map((acc) => (
            <div key={acc.username} className={cn("flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors", acc.username === username ? "bg-primary/10" : "hover:bg-secondary")}>
              <button onClick={() => handleAccountSwitch(acc.username)} className="flex items-center gap-2 flex-1 text-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                  {acc.username[0].toUpperCase()}
                </div>
                <span className="text-xs text-foreground truncate">{acc.username}</span>
                {acc.username === username && <Check className="h-3 w-3 text-primary" />}
              </button>
              {accounts.length > 1 && (
                <button onClick={() => handleAccountRemove(acc.username)} className="p-1 text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        {addingAccount ? (
          <div className="flex gap-1.5">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("accounts.newPlaceholder")}
              maxLength={20}
              className="h-7 text-xs bg-secondary border-border"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAccountAdd()}
            />
            <Button size="sm" className="h-7 px-2" onClick={handleAccountAdd} disabled={newName.trim().length < 2}>
              <PlusIcon className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="w-full gap-1 text-[10px] h-7" onClick={() => setAddingAccount(true)}>
            <PlusIcon className="h-3 w-3" /> {t("accounts.add")}
          </Button>
        )}
      </div>
    </div>
  );

  // Mobile: bottom bar
  if (isMobile) {
    return (
      <div ref={panelRef}>
        {/* Floating panel above bottom nav */}
        <AnimatePresence>
          {openPanel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-20 right-3 z-[60]"
            >
              {openPanel === "language" ? <LanguagePanel /> : <ProfilePanel />}
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-end justify-around py-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[56px]",
                  item.popped && "-mt-4",
                  item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.popped ? (
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                    <item.icon className="h-5 w-5" />
                  </span>
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  // Desktop: right sidebar
  return (
    <div ref={panelRef}>
      {/* Floating panel next to navbar */}
      <AnimatePresence>
        {openPanel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed right-[72px] z-[60]",
              openPanel === "language" ? "top-[120px]" : "top-[180px]"
            )}
          >
            {openPanel === "language" ? <LanguagePanel /> : <ProfilePanel />}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed right-0 top-0 h-screen w-16 z-50 bg-card/95 backdrop-blur-lg border-s border-border flex flex-col items-center py-6 gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl transition-colors w-14",
              item.active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            {item.popped ? (
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <item.icon className="h-4 w-4" />
              </span>
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            <span className="text-[9px] font-medium leading-none">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
