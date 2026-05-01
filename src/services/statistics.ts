import type { Session } from "../types";

export interface TagStat {
  tag: string;
  minutes: number;
}

export interface DayStat {
  date: string;
  label: string;
  minutes: number;
}

export interface DashboardStats {
  focusTodayMinutes: number;
  completedToday: number;
  completionRate: number;
  totalCompleted: number;
  totalSessions: number;
  bestDayLabel: string;
  tagStats: TagStat[];
  weeklyStats: DayStat[];
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}

export function getDashboardStats(sessions: Session[], now = new Date()): DashboardStats {
  const focusSessions = sessions.filter((session) => session.mode === "focus");
  const completedFocusSessions = focusSessions.filter((session) => session.completed);
  const today = dateKey(now);

  const todaySessions = completedFocusSessions.filter((session) => session.startedAt.slice(0, 10) === today);
  const focusTodayMinutes = todaySessions.reduce((total, session) => total + session.durationMinutes, 0);

  const totalSessions = focusSessions.length;
  const totalCompleted = completedFocusSessions.length;
  const completionRate = totalSessions === 0 ? 0 : Math.round((totalCompleted / totalSessions) * 100);

  const tagTotals = completedFocusSessions.reduce<Record<string, number>>((totals, session) => {
    const tag = session.tag || "No tag";
    totals[tag] = (totals[tag] ?? 0) + session.durationMinutes;
    return totals;
  }, {});

  const tagStats = Object.entries(tagTotals)
    .map(([tag, minutes]) => ({ tag, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  const weekStart = startOfDay(now);
  weekStart.setDate(weekStart.getDate() - 6);

  const weeklyStats = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    const key = dateKey(day);
    const minutes = completedFocusSessions
      .filter((session) => session.startedAt.slice(0, 10) === key)
      .reduce((total, session) => total + session.durationMinutes, 0);

    return {
      date: key,
      label: formatDayLabel(day),
      minutes
    };
  });

  const bestDay = weeklyStats.reduce((best, day) => (day.minutes > best.minutes ? day : best), weeklyStats[0]);

  return {
    focusTodayMinutes,
    completedToday: todaySessions.length,
    completionRate,
    totalCompleted,
    totalSessions,
    bestDayLabel: bestDay.minutes > 0 ? `${bestDay.label} (${bestDay.minutes} min)` : "No focus yet",
    tagStats,
    weeklyStats
  };
}
