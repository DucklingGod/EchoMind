import { Badge } from "@/components/ui/badge";
import type { Emotion } from "@shared/schema";
import { Smile, Sparkles, Heart, Cloud, Frown, HelpCircle, Zap } from "lucide-react";

interface EmotionBadgeProps {
  emotion: Emotion;
  size?: "sm" | "default";
}

const emotionConfig: Record<Emotion, { icon: typeof Smile; color: string }> = {
  Joy: { icon: Smile, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  Calm: { icon: Cloud, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  Anxious: { icon: Zap, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  Sad: { icon: Frown, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
  Angry: { icon: Zap, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
  Confused: { icon: HelpCircle, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  Mixed: { icon: Sparkles, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800" },
};

export function EmotionBadge({ emotion, size = "default" }: EmotionBadgeProps) {
  const { icon: Icon, color } = emotionConfig[emotion];

  return (
    <Badge 
      variant="outline" 
      className={`${color} gap-1.5 ${size === "sm" ? "text-xs px-2 py-0.5" : "px-3 py-1"}`}
      data-testid={`badge-emotion-${emotion.toLowerCase()}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {emotion}
    </Badge>
  );
}
