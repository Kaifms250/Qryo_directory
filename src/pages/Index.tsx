import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { communities } from "@/lib/communities";
import { CommunityCard } from "@/components/CommunityCard";
import { MessageCircle, Zap } from "lucide-react";

export default function Index() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleJoin = (communityId: string) => {
    const name = username.trim();
    if (!name) return;
    sessionStorage.setItem("chat-username", name);
    navigate(`/chat/${communityId}`);
  };

  const isReady = username.trim().length >= 2;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-10 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
            <Zap className="h-3.5 w-3.5" />
            Real-time communities
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-3">
            Find Your{" "}
            <span className="text-primary text-glow">Tribe</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Jump into themed chat rooms and connect with people who share your passions.
          </p>
        </div>

        {/* Username input */}
        <div
          className="max-w-sm mx-auto mb-12 opacity-0 animate-fade-in"
          style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
        >
          <div className="relative">
            <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Choose a username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          {!isReady && username.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1.5 ml-1">At least 2 characters</p>
          )}
        </div>

        {/* Communities grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          {communities.map((community, i) => (
            <CommunityCard
              key={community.id}
              community={community}
              index={i}
              onClick={() => handleJoin(community.id)}
            />
          ))}
        </div>

        {!isReady && (
          <p className="text-center text-sm text-muted-foreground mt-6 animate-pulse-glow">
            Enter a username to unlock communities
          </p>
        )}
      </div>
    </div>
  );
}
