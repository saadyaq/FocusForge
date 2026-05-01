import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Settings, TimerMode } from "../../types";
import type { useTimer } from "../../hooks/useTimer";

type Timer = ReturnType<typeof useTimer>;

interface TimerPanelProps {
  timer: Timer;
  settings: Settings;
  tag: string;
  onTagChange: (tag: string) => void;
}

const modes: Array<{ mode: TimerMode; label: string }> = [
  { mode: "focus", label: "Focus" },
  { mode: "short_break", label: "Short" },
  { mode: "long_break", label: "Long" }
];

export function TimerPanel({ timer, settings, tag, onTagChange }: TimerPanelProps) {
  const circumference = 2 * Math.PI * 148;
  const dashOffset = circumference * (1 - timer.progress);

  return (
    <section className="flex min-h-[560px] flex-col rounded-lg border border-forge-line bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#191a17]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#746f63] dark:text-[#b8b1a4]">Current mode</p>
          <h2 className="mt-1 text-2xl font-semibold">{timer.modeLabel}</h2>
        </div>

        <div className="flex rounded-lg border border-forge-line bg-forge-paper p-1 dark:border-white/10 dark:bg-black/20">
          {modes.map((item) => (
            <button
              key={item.mode}
              className={`h-9 rounded-md px-4 text-sm font-medium transition ${
                timer.mode === item.mode
                  ? "bg-white text-forge-ink shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-[#6f6b60] hover:text-forge-ink dark:text-[#aaa397] dark:hover:text-white"
              }`}
              onClick={() => timer.moveToMode(item.mode)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid flex-1 place-items-center py-5">
        <div className="relative grid aspect-square w-full max-w-[320px] place-items-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 320 320" aria-hidden="true">
            <circle
              cx="160"
              cy="160"
              r="148"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-forge-line dark:text-white/10"
            />
            <circle
              cx="160"
              cy="160"
              r="148"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="text-forge-accent transition-all duration-500"
            />
          </svg>

          <div className="text-center">
            <div className="font-mono text-[clamp(3.5rem,9vw,5.75rem)] font-semibold leading-none tracking-normal">
              {timer.formattedTime}
            </div>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.16em] text-[#746f63] dark:text-[#b8b1a4]">
              {timer.status}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <label className="mx-auto flex h-11 w-full max-w-md items-center rounded-lg border border-forge-line bg-forge-paper px-3 dark:border-white/10 dark:bg-black/20">
          <span className="mr-3 shrink-0 text-sm font-medium text-[#746f63] dark:text-[#b8b1a4]">Tag</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#a8a194]"
            onChange={(event) => onTagChange(event.target.value)}
            placeholder="Deep work"
            type="text"
            value={tag}
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Cycles completed" value={timer.completedFocusCycles.toString()} />
          <Stat label="Next break" value={timer.nextBreakLabel} />
          <Stat label="Focus length" value={`${settings.focusDuration} min`} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {timer.status === "running" ? (
            <IconButton label="Pause" icon={Pause} onClick={timer.pause} tone="primary" />
          ) : (
            <IconButton label="Start" icon={Play} onClick={timer.start} tone="primary" />
          )}
          <IconButton label="Reset" icon={RotateCcw} onClick={timer.reset} />
          <IconButton label="Skip" icon={SkipForward} onClick={timer.skip} />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-forge-line bg-forge-paper px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#817a6c] dark:text-[#aaa397]">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  tone = "neutral"
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone?: "primary" | "neutral";
}) {
  return (
    <button
      className={`inline-flex h-12 min-w-32 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition ${
        tone === "primary"
          ? "bg-forge-accent text-white shadow-soft hover:bg-[#316b63]"
          : "border border-forge-line bg-white text-forge-ink hover:bg-forge-paper dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon size={18} />
      {label}
    </button>
  );
}
