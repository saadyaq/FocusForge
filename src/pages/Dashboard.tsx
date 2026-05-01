import { BarChart3, CalendarCheck2, CheckCircle2, Flame, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";
import { getDashboardStats } from "../services/statistics";
import type { Session } from "../types";

interface DashboardPageProps {
  sessions: Session[];
}

export function DashboardPage({ sessions }: DashboardPageProps) {
  const stats = useMemo(() => getDashboardStats(sessions), [sessions]);
  const topTag = stats.tagStats[0];

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-5 px-5 pb-5">
      <section className="rounded-lg border border-forge-line bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#191a17]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-[#746f63] dark:text-[#b8b1a4]">Focus analytics</p>
            <h2 className="mt-1 text-2xl font-semibold">Dashboard</h2>
          </div>
          <div className="rounded-lg border border-forge-line bg-forge-paper px-3 py-2 text-sm font-semibold text-[#746f63] dark:border-white/10 dark:bg-black/20 dark:text-[#b8b1a4]">
            Last 7 days
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Flame} label="Focus today" value={formatMinutes(stats.focusTodayMinutes)} />
        <MetricCard icon={CheckCircle2} label="Sessions today" value={stats.completedToday.toString()} />
        <MetricCard icon={BarChart3} label="Completion rate" value={`${stats.completionRate}%`} />
        <MetricCard icon={CalendarCheck2} label="Best day" value={stats.bestDayLabel} />
      </section>

      <section className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-forge-line bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#191a17]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[#746f63] dark:text-[#b8b1a4]">Weekly focus trend</p>
              <h3 className="mt-1 text-xl font-semibold">Focus minutes</h3>
            </div>
            <p className="text-sm font-semibold text-forge-accent">{stats.totalCompleted} completed</p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyStats} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-forge-line dark:text-white/10" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(59, 127, 117, 0.08)" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #dedbd2",
                    boxShadow: "0 18px 60px rgba(30, 29, 25, 0.09)"
                  }}
                  formatter={(value) => [`${value} min`, "Focus"]}
                />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {stats.weeklyStats.map((day) => (
                    <Cell key={day.date} fill={day.minutes > 0 ? "#3b7f75" : "#dedbd2"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-forge-line bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#191a17]">
          <div className="mb-5 flex items-center gap-2">
            <Tags size={18} className="text-forge-accent" />
            <h3 className="text-xl font-semibold">Time by tag</h3>
          </div>

          {stats.tagStats.length > 0 ? (
            <div className="space-y-4">
              {stats.tagStats.slice(0, 6).map((tagStat) => {
                const maxMinutes = topTag?.minutes || 1;
                const width = Math.max(8, Math.round((tagStat.minutes / maxMinutes) * 100));

                return (
                  <div key={tagStat.tag}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate font-semibold">{tagStat.tag}</span>
                      <span className="shrink-0 text-[#746f63] dark:text-[#b8b1a4]">{formatMinutes(tagStat.minutes)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-forge-line dark:bg-white/10">
                      <div className="h-2 rounded-full bg-forge-accent" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-[260px] place-items-center text-center">
              <div>
                <p className="font-semibold">No tag data yet</p>
                <p className="mt-2 text-sm text-[#746f63] dark:text-[#b8b1a4]">
                  Complete focus sessions with tags to see where your time goes.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-forge-line bg-white p-4 shadow-soft dark:border-white/10 dark:bg-[#191a17]">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-forge-accent/10 text-forge-accent dark:bg-forge-accent/20">
        <Icon size={18} />
      </div>
      <p className="text-sm text-[#746f63] dark:text-[#b8b1a4]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function formatMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes === 0 ? `${hours} h` : `${hours} h ${remainingMinutes} min`;
}
