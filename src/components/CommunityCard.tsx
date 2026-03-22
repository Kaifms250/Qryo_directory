import { type Community } from "@/lib/communities";
import { Users } from "lucide-react";

interface CommunityCardProps {
  community: Community;
  index: number;
  onlineCount: number;
  onClick: () => void;
}

export function CommunityCard({ community, index, onlineCount, onClick }: CommunityCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-border/50 opacity-0 animate-fade-in-up focus:outline-none focus-visible:ring-2 focus-visible:ring-primary card-shimmer"
      style={{ animationDelay: `${index * 80 + 200}ms`, animationFillMode: "forwards" }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={community.image}
          alt={community.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <span className="absolute top-3 right-3 text-2xl opacity-80 group-hover:animate-float transition-all">
          {community.emoji}
        </span>
      </div>

      {/* Content */}
      <div className="relative px-4 pb-4 -mt-8">
        <h3 className="text-lg font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">
          {community.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">{community.description}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${onlineCount > 0 ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"}`} />
          <Users className="h-3 w-3" />
          <span>{onlineCount} online</span>
        </div>
      </div>

      <div className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/40 transition-all duration-300 pointer-events-none" />
    </button>
  );
}
