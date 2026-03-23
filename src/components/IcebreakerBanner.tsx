import { useState, useCallback } from "react";
import { getRandomIcebreaker } from "@/lib/icebreakers";
import { RefreshCw, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface IcebreakerBannerProps {
  community: string;
  onUse: (text: string) => void;
}

export function IcebreakerBanner({ community, onUse }: IcebreakerBannerProps) {
  const { t } = useTranslation();
  const [icebreaker, setIcebreaker] = useState(() => getRandomIcebreaker(community));
  const [fading, setFading] = useState(false);

  const refresh = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setIcebreaker(getRandomIcebreaker(community));
      setFading(false);
    }, 200);
  }, [community]);

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in">
      <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
      <p
        className={`flex-1 text-sm text-foreground cursor-pointer hover:text-primary transition-all ${fading ? "opacity-0" : "opacity-100"}`}
        onClick={() => onUse(icebreaker)}
        title={t("icebreaker.click")}
      >
        {icebreaker}
      </p>
      <button onClick={refresh} className="p-1 rounded-md hover:bg-primary/20 transition-colors">
        <RefreshCw className="h-3.5 w-3.5 text-primary" />
      </button>
    </div>
  );
}
