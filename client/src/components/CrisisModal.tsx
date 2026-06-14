import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Phone, ExternalLink, Shield } from "lucide-react";
import { CRISIS_RESOURCES, type CrisisMatch } from "@/lib/crisisDetection";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  crisis: CrisisMatch | null;
}

export function CrisisModal({ isOpen, onClose, onContinue, crisis }: CrisisModalProps) {
  const [showAll, setShowAll] = useState(false);

  if (!crisis) return null;

  const isHigh = crisis.level === "high";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
        <DialogHeader className="text-center space-y-3">
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${
            isHigh ? "bg-red-100 dark:bg-red-950/50" : "bg-amber-100 dark:bg-amber-950/50"
          }`}>
            <Shield className={`w-7 h-7 ${isHigh ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`} />
          </div>
          <DialogTitle className="text-xl font-semibold">
            You're not alone
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground leading-relaxed">
            It sounds like you're going through a really difficult time.
            Your feelings are valid, and there are people who want to help.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Thai hotlines */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {CRISIS_RESOURCES.th.name}
            </p>
            {CRISIS_RESOURCES.th.hotlines.map((line) => (
              <a
                key={line.number}
                href={line.number.startsWith("0") ? `tel:${line.number.replace(/-/g, "")}` : `tel:${line.number}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{line.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{line.description}</p>
                </div>
                <span className="text-sm font-semibold text-primary shrink-0">
                  {line.number}
                </span>
              </a>
            ))}
          </div>

          {/* Show more */}
          {!showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Show international resources
            </button>
          )}

          {showAll && (
            <>
              {/* US hotlines */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {CRISIS_RESOURCES.us.name}
                </p>
                {CRISIS_RESOURCES.us.hotlines.map((line) => (
                  <a
                    key={line.number}
                    href={line.number.match(/^\d/) ? `tel:${line.number}` : undefined}
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{line.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{line.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary shrink-0">
                      {line.number}
                    </span>
                  </a>
                ))}
              </div>

              {/* International */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {CRISIS_RESOURCES.intl.name}
                </p>
                {CRISIS_RESOURCES.intl.hotlines.map((line) => (
                  <a
                    key={line.name}
                    href={line.number}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{line.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{line.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={onContinue}
            variant="default"
            className="w-full h-11 rounded-xl gap-2"
          >
            <Heart className="w-4 h-4" />
            Continue sharing — I still want to reflect
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full h-10 rounded-xl text-muted-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
