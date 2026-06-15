import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { ClerkProvider, SignedIn, SignedOut, SignIn, useAuth } from "@clerk/clerk-react";
import { queryClient, setClerkTokenGetter } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { EncryptionProvider } from "@/components/EncryptionProvider";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import Home from "@/pages/Home";
import Timeline from "@/pages/Timeline";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Bridge component: registers Clerk's getToken with queryClient
function ClerkTokenBridge() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      setClerkTokenGetter(async () => {
        try {
          return await getToken();
        } catch {
          return null;
        }
      });
    } else {
      setClerkTokenGetter(null);
    }
  }, [getToken, isSignedIn]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">EchoMind</h1>
          <p className="text-muted-foreground">Sign in to access your reflections</p>
        </div>
        <SignIn
          routing="hash"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-card-border shadow-xl rounded-2xl",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "bg-secondary border-secondary-border text-foreground hover:bg-secondary/80",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/80",
              identityPreviewText: "text-foreground",
              formFieldInput: "bg-background border-input text-foreground",
              formFieldLabel: "text-foreground",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
            },
          }}
        />
      </div>
    </div>
  );
}

function App() {
  if (!CLERK_KEY) {
    console.warn("VITE_CLERK_PUBLISHABLE_KEY not set — running without auth");
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <EncryptionProvider>
            <TooltipProvider>
              <div className="min-h-screen bg-background text-foreground">
                <DesktopNav />
                <Router />
                <BottomNav />
              </div>
              <Toaster />
            </TooltipProvider>
          </EncryptionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <QueryClientProvider client={queryClient}>
        <ClerkTokenBridge />
        <ThemeProvider>
          <SignedOut>
            <SignInPage />
          </SignedOut>
          <SignedIn>
            <EncryptionProvider>
              <TooltipProvider>
                <div className="min-h-screen bg-background text-foreground">
                  <DesktopNav />
                  <Router />
                  <BottomNav />
                </div>
                <Toaster />
              </TooltipProvider>
            </EncryptionProvider>
          </SignedIn>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
