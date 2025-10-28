import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ReflectionCard } from "@/components/ReflectionCard";
import { MoodStreak } from "@/components/MoodStreak";
import { MoodSparkline } from "@/components/MoodSparkline";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Reflection } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function Timeline() {
  const { toast } = useToast();
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);

  const { data: reflections = [], isLoading } = useQuery<Reflection[]>({
    queryKey: ["/api/reflections"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/reflections/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      toast({
        title: "Reflection deleted",
        description: "Your reflection has been removed",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete reflection",
      });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/reflections/all", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete all");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      toast({
        title: "All reflections deleted",
        description: "Your timeline has been cleared",
      });
      setDeleteAllDialogOpen(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete all reflections",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-8 md:pt-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Timeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {reflections.length} {reflections.length === 1 ? "reflection" : "reflections"}
            </p>
          </div>
          {reflections.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteAllDialogOpen(true)}
              className="text-muted-foreground hover:text-destructive gap-2"
              data-testid="button-delete-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>

        {reflections.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <MoodStreak reflections={reflections} />
              <MoodSparkline reflections={reflections} />
            </div>

            <div className="space-y-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Recent Reflections
              </h2>
              {reflections.map((reflection) => (
                <ReflectionCard
                  key={reflection.id}
                  reflection={reflection}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          </>
        )}

        {reflections.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium text-foreground">
                No reflections yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Start your journey by sharing what's on your mind. Your reflections will appear here.
              </p>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all reflections?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all of your reflections. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAllMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
