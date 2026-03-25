import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceMessageButtonProps {
  onSend: (audioBlob: Blob, duration: number) => void;
}

export function VoiceMessageButton({ onSend }: VoiceMessageButtonProps) {
  const { t } = useTranslation();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        if (duration > 0 && duration <= 60) {
          onSend(blob, duration);
        } else if (duration > 60) {
          toast.error(t("voice.tooLong"));
        }
        setProcessing(false);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      toast.error(t("voice.noPermission"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      setProcessing(true);
      setRecording(false);
      mediaRecorderRef.current.stop();
    }
  };

  if (processing) {
    return (
      <button className="p-2 rounded-lg bg-secondary" disabled>
        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
      </button>
    );
  }

  return (
    <button
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      className={`p-2 rounded-lg transition-all ${
        recording
          ? "bg-destructive text-destructive-foreground animate-pulse"
          : "bg-secondary/80 hover:bg-secondary text-foreground"
      }`}
      title={recording ? t("voice.stop") : t("voice.hold")}
    >
      {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}
