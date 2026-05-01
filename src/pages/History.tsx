import { CalendarDays, CheckCircle2, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Session } from "../types";

interface HistoryPageProps {
  sessions: Session[];
  tags: string[];
  onClear: () => void;
}

export function HistoryPage({ sessions, tags, onClear }: HistoryPageProps) {
  const [dateFilter, setDateFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("all");

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
        const matchesDate = dateFilter ? session.startedAt.slice(0, 10) === dateFilter : true;
        const matchesTag = tagFilter === "all" ? true : session.tag === tagFilter;

        return matchesDate && matchesTag;
      }),
    [dateFilter, sessions, tagFilter]
  );

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-5 px-5 pb-5">
      <section className="rounded-lg border border-forge-line bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#191a17]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#746f63] dark:text-[#b8b1a4]">Completed focus sessions</p>
            <h2 className="mt-1 text-2xl font-semibold">History</h2>
          </div>

          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-forge-line px-3 text-sm font-semibold text-[#746f63] transition hover:bg-forge-paper hover:text-forge-ink disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-[#b8b1a4] dark:hover:bg-white/10 dark:hover:text-white"
            disabled={sessions.length === 0}
            onClick={onClear}
            type="button"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="flex h-11 items-center gap-2 rounded-lg border border-forge-line bg-forge-paper px-3 dark:border-white/10 dark:bg-black/20">
            <CalendarDays size={16} className="text-[#746f63] dark:text-[#b8b1a4]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              onChange={(event) => setDateFilter(event.target.value)}
              type="date"
              value={dateFilter}
            />
          </label>

          <label className="flex h-11 items-center gap-2 rounded-lg border border-forge-line bg-forge-paper px-3 dark:border-white/10 dark:bg-black/20">
            <Search size={16} className="text-[#746f63] dark:text-[#b8b1a4]" />
            <select
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              onChange={(event) => setTagFilter(event.target.value)}
              value={tagFilter}
            >
              <option value="all">All tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="min-h-0 overflow-hidden rounded-lg border border-forge-line bg-white shadow-soft dark:border-white/10 dark:bg-[#191a17]">
        {filteredSessions.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="border-b border-forge-line bg-forge-paper text-xs uppercase tracking-[0.12em] text-[#746f63] dark:border-white/10 dark:bg-black/20 dark:text-[#b8b1a4]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Tag</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Mode</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b border-forge-line/70 last:border-0 dark:border-white/10">
                    <td className="px-4 py-4">{formatDateTime(session.startedAt)}</td>
                    <td className="px-4 py-4 font-semibold">{session.tag || "No tag"}</td>
                    <td className="px-4 py-4">{session.durationMinutes} min</td>
                    <td className="px-4 py-4 capitalize">{session.mode.replace("_", " ")}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-forge-accent/10 px-2.5 py-1 font-medium text-forge-accent dark:bg-forge-accent/20">
                        <CheckCircle2 size={15} />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-[320px] place-items-center px-5 text-center">
            <div>
              <p className="text-lg font-semibold">No sessions yet</p>
              <p className="mt-2 max-w-sm text-sm text-[#746f63] dark:text-[#b8b1a4]">
                Completed focus sessions will appear here with their tag, duration, and start time.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
