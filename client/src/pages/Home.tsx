import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MindwaveAnimation } from "@/components/MindwaveAnimation";
import { ReflectionCard } from "@/components/ReflectionCard";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useEncryption } from "@/components/EncryptionProvider";
import { encrypt } from "@/lib/encryption";
import type { Reflection } from "@shared/schema";

export default function Home() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [wasVoiceInput, setWasVoiceInput] = useState(false);
  const [currentReflection, setCurrentReflection] = useState<Reflection | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useVoiceRecording();
  const { isEnabled: encryptionEnabled, passphrase, hasPassphrase } = useEncryption();

  const intensity = input.length / 100;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (audioBlob) {
      handleVoiceSubmit();
    }
  }, [audioBlob]);

  const handleMicToggle = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      const success = await startRecording();
      if (!success) {
        toast({
          variant: "destructive",
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice input",
        });
      } else {
        toast({
          title: "Recording started",
          description: "Speak your thoughts...",
        });
      }
    }
  };

  const handleVoiceSubmit = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeResponse = await fetch("/api/analyze/voice", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const { text } = await transcribeResponse.json();
      setInput(text);
      setWasVoiceInput(true);
      clearRecording();

      toast({
        title: "Voice transcribed",
        description: "Your voice has been converted to text",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transcription failed",
        description: "Could not transcribe your voice. Please try typing instead.",
      });
      clearRecording();
      setWasVoiceInput(false);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    if (encryptionEnabled && !hasPassphrase) {
      toast({
        variant: "destructive",
        title: "Passphrase required",
        description: "Go to Settings to re-enter your passphrase before creating encrypted reflections.",
      });
      return;
    }

    setIsSubmitting(true);
    setCurrentReflection(null);

    try {
      let inputToSend = input;

      if (encryptionEnabled && passphrase) {
        inputToSend = await encrypt(input, passphrase);
      }

      const response = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText: inputToSend, voice: wasVoiceInput }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create reflection");
      }

      const reflection = await response.json();
      setCurrentReflection(reflection);
      setInput("");
      setWasVoiceInput(false);
      clearRecording();

      toast({
        title: "Reflection created",
        description: encryptionEnabled 
          ? "Your encrypted reflection has been saved" 
          : "Your thoughts have been reflected",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create reflection. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            What's on your mind?
          </h1>
          <p className="text-base text-muted-foreground">
            Share your thoughts and let me help you find clarity
          </p>
        </div>

        <MindwaveAnimation isActive={isRecording || input.length > 0} intensity={intensity} />

        <div className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type or speak what's on your mind..."
              className="min-h-32 md:min-h-40 max-h-96 resize-none rounded-2xl text-base leading-relaxed p-6 pr-20 backdrop-blur-md bg-card/80 border-card-border focus-visible:ring-primary"
              disabled={isSubmitting || isTranscribing}
              data-testid="input-reflection"
            />
            <Button
              size="icon"
              onClick={handleMicToggle}
              disabled={isSubmitting || isTranscribing}
              className={`absolute bottom-4 right-4 w-12 h-12 rounded-full ${
                isRecording 
                  ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                  : "bg-secondary hover:bg-secondary/80"
              }`}
              data-testid="button-mic"
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : isTranscribing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isSubmitting || isTranscribing}
            className="w-full h-12 rounded-xl text-base font-semibold gap-2"
            data-testid="button-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Reflecting...
              </>
            ) : isTranscribing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Transcribing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send
              </>
            )}
          </Button>
        </div>

        {currentReflection && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ReflectionCard reflection={currentReflection} />
          </div>
        )}

        {!currentReflection && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                Your safe space to reflect
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Share your feelings, worries, or wins. I'll help you process them with compassion and clarity.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
