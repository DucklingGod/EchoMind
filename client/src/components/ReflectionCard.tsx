import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmotionBadge } from "./EmotionBadge";
import type { Reflection, Emotion } from "@shared/schema";
import { Trash2, CheckCircle2, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { useEncryption } from "./EncryptionProvider";
import { decrypt, isEncrypted } from "@/lib/encryption";

interface ReflectionCardProps {
  reflection: Reflection;
  onDelete?: (id: string) => void;
}

export function ReflectionCard({ reflection, onDelete }: ReflectionCardProps) {
  const timestamp = new Date(reflection.createdAt);
  const { passphrase } = useEncryption();
  const [decryptedSummary, setDecryptedSummary] = useState(reflection.summary);
  const [decryptedReframe, setDecryptedReframe] = useState(reflection.reframe);
  const [decryptedActions, setDecryptedActions] = useState(reflection.actions);
  const [decryptionFailed, setDecryptionFailed] = useState(false);

  useEffect(() => {
    async function decryptFields() {
      if (!passphrase) {
        setDecryptionFailed(isEncrypted(reflection.summary));
        return;
      }

      try {
        if (isEncrypted(reflection.summary)) {
          const summary = await decrypt(reflection.summary, passphrase);
          setDecryptedSummary(summary);
        }

        if (isEncrypted(reflection.reframe)) {
          const reframe = await decrypt(reflection.reframe, passphrase);
          setDecryptedReframe(reframe);
        }

        if (reflection.actions && reflection.actions.length > 0 && isEncrypted(reflection.actions[0])) {
          const actions = await Promise.all(
            reflection.actions.map(action => decrypt(action, passphrase))
          );
          setDecryptedActions(actions);
        }

        setDecryptionFailed(false);
      } catch (error) {
        setDecryptionFailed(true);
      }
    }

    decryptFields();
  }, [reflection, passphrase]);

  if (decryptionFailed) {
    return (
      <Card 
        className="p-6 md:p-8 space-y-4 backdrop-blur-md bg-card/80 border-card-border"
        data-testid={`card-reflection-${reflection.id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground" data-testid="text-timestamp">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
            <EmotionBadge emotion={reflection.emotion as Emotion} />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <Lock className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-muted-foreground">
            This reflection is encrypted. Go to Settings to enter your passphrase.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="p-6 md:p-8 space-y-4 backdrop-blur-md bg-card/80 border-card-border hover-elevate transition-all duration-200"
      data-testid={`card-reflection-${reflection.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground" data-testid="text-timestamp">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
          <EmotionBadge emotion={reflection.emotion as Emotion} />
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(reflection.id)}
            className="text-muted-foreground hover:text-destructive shrink-0"
            data-testid={`button-delete-${reflection.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium leading-relaxed text-foreground" data-testid="text-summary">
            {decryptedSummary}
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-base leading-relaxed text-foreground" data-testid="text-reframe">
            {decryptedReframe}
          </p>
        </div>

        {decryptedActions && decryptedActions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Suggested Actions
            </h4>
            <div className="flex flex-wrap gap-3">
              {decryptedActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2 hover-elevate whitespace-normal text-left items-start"
                  data-testid={`button-action-${idx}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
