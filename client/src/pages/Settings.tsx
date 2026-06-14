import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import { useEncryption } from "@/components/EncryptionProvider";
import { Download, Moon, Sun, Shield, Info, Lock, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Reflection } from "@shared/schema";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { isEnabled, hasPassphrase, enableEncryption, disableEncryption, updatePassphrase } = useEncryption();
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [aiModel, setAiModel] = useState(() => localStorage.getItem("echomind-model") || "gpt-4o-mini");

  const { data: reflections = [] } = useQuery<Reflection[]>({
    queryKey: ["/api/reflections"],
  });

  const handleExport = () => {
    const dataStr = JSON.stringify(reflections, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `echomind-reflections-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your reflections have been downloaded",
    });
  };

  const handleEncryptionToggle = (checked: boolean) => {
    if (checked) {
      if (!passphrase || passphrase.length < 8) {
        toast({
          title: "Passphrase required",
          description: "Please enter a passphrase (minimum 8 characters)",
          variant: "destructive",
        });
        return;
      }
      enableEncryption(passphrase);
      toast({
        title: "Encryption enabled",
        description: "New reflections will be encrypted on this device",
      });
    } else {
      disableEncryption();
      setPassphrase("");
      toast({
        title: "Encryption disabled",
        description: "New reflections will not be encrypted",
      });
    }
  };

  const handlePassphraseSubmit = () => {
    if (!passphrase || passphrase.length < 8) {
      toast({
        title: "Invalid passphrase",
        description: "Passphrase must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    updatePassphrase(passphrase);
    toast({
      title: "Passphrase updated",
      description: "You can now create encrypted reflections",
    });
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your preferences and privacy
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">AI Model</h2>
              <p className="text-sm text-muted-foreground">
                Choose the AI model for reflections
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "Fast & affordable — great for daily check-ins", cost: "$" },
                { id: "gpt-4o", name: "GPT-4o", desc: "Most capable — deeper emotional analysis", cost: "$$$" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setAiModel(m.id); localStorage.setItem("echomind-model", m.id); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                    aiModel === m.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    aiModel === m.id ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <span className="text-sm font-bold">{m.cost}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  {aiModel === m.id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Customize how EchoMind looks
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "light" ? (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="theme-toggle" className="text-base font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === "light" ? "Switch to dark theme" : "Currently active"}
                  </p>
                </div>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="switch-theme"
              />
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">Client-Side Encryption</h2>
              <p className="text-sm text-muted-foreground">
                Encrypt your reflections before they leave this device
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Important Security Notice
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your passphrase is stored in this browser's session storage. If you forget it or clear your browser data, you will not be able to decrypt your reflections. Keep a secure backup of your passphrase.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="encryption-toggle" className="text-base font-medium">
                      Enable Encryption
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isEnabled ? "Encryption is active" : "Encryption is disabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="encryption-toggle"
                  checked={isEnabled}
                  onCheckedChange={handleEncryptionToggle}
                  data-testid="switch-encryption"
                />
              </div>

              {!isEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="passphrase" className="text-sm font-medium">
                    Passphrase (minimum 8 characters)
                  </Label>
                  <Input
                    id="passphrase"
                    type={showPassphrase ? "text" : "password"}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter a strong passphrase"
                    className="h-11"
                    data-testid="input-passphrase"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="text-xs"
                    data-testid="button-show-passphrase"
                  >
                    {showPassphrase ? "Hide" : "Show"} passphrase
                  </Button>
                </div>
              )}

              {isEnabled && !hasPassphrase && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Passphrase Required
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Encryption is enabled but your passphrase was cleared when you closed the browser. Re-enter your passphrase to create encrypted reflections.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passphrase-reenter" className="text-sm font-medium">
                      Re-enter your passphrase
                    </Label>
                    <Input
                      id="passphrase-reenter"
                      type={showPassphrase ? "text" : "password"}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter your passphrase"
                      className="h-11"
                      data-testid="input-passphrase-reenter"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassphrase(!showPassphrase)}
                        className="text-xs"
                        data-testid="button-show-passphrase"
                      >
                        {showPassphrase ? "Hide" : "Show"} passphrase
                      </Button>
                      <Button
                        size="sm"
                        onClick={handlePassphraseSubmit}
                        data-testid="button-submit-passphrase"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isEnabled && hasPassphrase && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Your reflections are encrypted
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All new reflections are encrypted with AES-256-GCM before being sent to the server. Only you can decrypt them with your passphrase.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">Privacy & Data</h2>
              <p className="text-sm text-muted-foreground">
                Control your data and privacy settings
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Your data is private
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All reflections are stored locally on this device. We don't send your personal thoughts to external servers except for AI analysis via OpenAI's API.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 h-12"
                onClick={handleExport}
                disabled={reflections.length === 0}
                data-testid="button-export"
              >
                <Download className="w-4 h-4" />
                Export Reflections as JSON
              </Button>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">About EchoMind</h2>
              <p className="text-sm text-muted-foreground">
                Version 1.0.0 (MVP)
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  AI-Powered Emotional Reflection
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  EchoMind uses advanced AI to help you process emotions, gain clarity, and grow consistently. Your trusted companion for mental wellness.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
