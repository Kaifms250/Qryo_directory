import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Plus, X } from "lucide-react";

interface CreatePollDialogProps {
  onCreatePoll: (question: string, options: string[]) => Promise<void>;
}

export function CreatePollDialog({ onCreatePoll }: CreatePollDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);

  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const removeOption = (i: number) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  };

  const handleCreate = async () => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) return;
    setCreating(true);
    await onCreatePoll(question.trim(), validOptions);
    setQuestion("");
    setOptions(["", ""]);
    setCreating(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors" title={t("polls.create")}>
          <BarChart3 className="h-4 w-4 text-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("polls.createTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Input
            placeholder={t("polls.questionPlaceholder")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
            className="bg-secondary border-border"
          />
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder={`${t("polls.option")} ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                maxLength={100}
                className="bg-secondary border-border"
              />
              {options.length > 2 && (
                <button onClick={() => removeOption(i)} className="p-2 text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <Button variant="ghost" size="sm" onClick={addOption} className="gap-1">
              <Plus className="h-3 w-3" /> {t("polls.addOption")}
            </Button>
          )}
          <Button onClick={handleCreate} disabled={creating || !question.trim() || options.filter((o) => o.trim()).length < 2} className="w-full">
            {creating ? "..." : t("polls.create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
