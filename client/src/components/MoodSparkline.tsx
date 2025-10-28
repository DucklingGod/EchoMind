import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Reflection, Emotion } from "@shared/schema";
import { subDays, format, startOfDay } from "date-fns";

interface MoodSparklineProps {
  reflections: Reflection[];
}

const emotionScore: Record<Emotion, number> = {
  Joy: 5,
  Calm: 4,
  Mixed: 3,
  Confused: 2.5,
  Anxious: 2,
  Sad: 1.5,
  Angry: 1,
};

export function MoodSparkline({ reflections }: MoodSparklineProps) {
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      days.push({
        date: startOfDay(date),
        label: format(date, "EEE"),
        fullDate: format(date, "MMM d"),
      });
    }
    return days;
  };

  const calculateData = () => {
    const days = getLast7Days();
    
    return days.map(day => {
      const dayReflections = reflections.filter(r => {
        const reflectionDate = startOfDay(new Date(r.createdAt));
        return reflectionDate.getTime() === day.date.getTime();
      });

      if (dayReflections.length === 0) {
        return { ...day, score: null, count: 0 };
      }

      const avgScore = dayReflections.reduce((sum, r) => {
        return sum + emotionScore[r.emotion as Emotion];
      }, 0) / dayReflections.length;

      return {
        ...day,
        score: avgScore,
        count: dayReflections.length,
      };
    });
  };

  const data = calculateData();
  const hasData = data.some(d => d.score !== null);

  return (
    <Card className="p-6 backdrop-blur-md bg-card/80 border-card-border">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
        7-Day Mood Trend
      </h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={96}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide domain={[0, 6]} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
          Start reflecting to see your mood trends
        </div>
      )}
    </Card>
  );
}
