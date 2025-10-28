import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
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

function App() {
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

export default App;
