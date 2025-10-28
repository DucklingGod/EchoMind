import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import type { Reflection } from "@shared/schema";
import { differenceInDays, isToday, isYesterday, parseISO } from "date-fns";

interface MoodStreakProps {
  reflections: Reflection[];
}

export function MoodStreak({ reflections }: MoodStreakProps) {
  const calculateStreak = () => {
    if (reflections.length === 0) return 0;

    const sortedReflections = [...reflections].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const uniqueDates = new Set<string>();
    sortedReflections.forEach(r => {
      const date = new Date(r.createdAt);
      uniqueDates.add(date.toISOString().split('T')[0]);
    });

    const dates = Array.from(uniqueDates).sort().reverse();
    
    if (dates.length === 0) return 0;

    const mostRecentDate = parseISO(dates[0]);
    if (!isToday(mostRecentDate) && !isYesterday(mostRecentDate)) {
      return 0;
    }

    let streak = 0;
    let expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);

    for (const dateStr of dates) {
      const date = parseISO(dateStr);
      date.setHours(0, 0, 0, 0);
      
      const diff = differenceInDays(expectedDate, date);
      
      if (diff === 0) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (diff > 0) {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  return (
    <Card className="p-6 backdrop-blur-md bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Flame className="w-7 h-7 text-primary" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-foreground" data-testid="text-streak-count">
              {streak}
            </span>
            <span className="text-sm text-muted-foreground">
              {streak === 1 ? "day" : "days"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Current streak
          </p>
        </div>
      </div>
    </Card>
  );
}
