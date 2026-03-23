import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccounts, addAccount, switchAccount, removeAccount, type Account } from "@/lib/accounts";
import { UserCircle, Plus, X, Check } from "lucide-react";

interface AccountSwitcherProps {
  activeUsername: string;
  onSwitch: (username: string) => void;
}

export function AccountSwitcher({ activeUsername, onSwitch }: AccountSwitcherProps) {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>(getAccounts);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSwitch = (username: string) => {
    switchAccount(username);
    onSwitch(username);
  };

  const handleAdd = () => {
    if (!newName.trim() || newName.trim().length < 2) return;
    const updated = addAccount(newName.trim());
    setAccounts(updated);
    onSwitch(newName.trim());
    setNewName("");
    setAdding(false);
  };

  const handleRemove = (username: string) => {
    const updated = removeAccount(username);
    setAccounts(updated);
    if (username === activeUsername && updated.length > 0) {
      onSwitch(updated[0].username);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 bg-secondary/80 backdrop-blur rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors">
          <UserCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground truncate max-w-[100px]">{activeUsername}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-card border-border p-3" align="end">
        <p className="text-xs font-medium text-muted-foreground mb-2">{t("accounts.title")}</p>
        <div className="space-y-1 mb-3">
          {accounts.map((acc) => (
            <div key={acc.username} className={`flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors ${acc.username === activeUsername ? "bg-primary/10" : "hover:bg-secondary"}`}>
              <button onClick={() => handleSwitch(acc.username)} className="flex items-center gap-2 flex-1 text-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                  {acc.username[0].toUpperCase()}
                </div>
                <span className="text-sm text-foreground truncate">{acc.username}</span>
                {acc.username === activeUsername && <Check className="h-3 w-3 text-primary" />}
              </button>
              {accounts.length > 1 && (
                <button onClick={() => handleRemove(acc.username)} className="p-1 text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        {adding ? (
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("accounts.newPlaceholder")}
              maxLength={20}
              className="h-8 text-xs bg-secondary border-border"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button size="sm" className="h-8 px-2" onClick={handleAdd} disabled={newName.trim().length < 2}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="w-full gap-1 text-xs" onClick={() => setAdding(true)}>
            <Plus className="h-3 w-3" /> {t("accounts.add")}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
