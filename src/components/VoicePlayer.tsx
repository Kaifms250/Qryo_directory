import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

interface VoicePlayerProps {
  audioUrl: string;
  duration: number;
}

export function VoicePlayer({ audioUrl, duration }: VoicePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <button onClick={toggle} className="flex items-center gap-2 text-sm">
      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      <div className="flex gap-0.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all ${playing ? "bg-primary-foreground animate-pulse" : "bg-primary-foreground/60"}`}
            style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
      <span className="text-xs opacity-70">{duration}s</span>
    </button>
  );
}
