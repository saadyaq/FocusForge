import { useEffect, useMemo, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import { emit, listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { MINI_TIMER_COMMAND_EVENT, MINI_TIMER_EVENT, loadMiniTimerState } from "../../services/miniTimerWindow";
import type { TimerSnapshot } from "../../types";

const emptyState: TimerSnapshot = {
  mode: "focus",
  modeLabel: "Focus",
  status: "idle",
  remainingSeconds: 0,
  formattedTime: "00:00",
  progress: 0,
  periodLabel: "Focus period",
  periodIndex: 1,
  totalPeriods: 1
};

export function MiniTimerWindow() {
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(() => loadMiniTimerState() ?? emptyState);
  const ticks = useMemo(() => Array.from({ length: 32 }, (_, index) => index), []);
  const activeTickCount = Math.max(1, Math.round(snapshot.progress * ticks.length));

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    void listen<TimerSnapshot>(MINI_TIMER_EVENT, (event) => {
      setSnapshot(event.payload);
    }).then((cleanup) => {
      unlisten = cleanup;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  const close = async () => {
    try {
      await getCurrentWindow().close();
    } catch (error) {
      console.warn("Unable to close mini timer window", error);
      window.close();
    }
  };

  const togglePlayback = () => {
    void emit(MINI_TIMER_COMMAND_EVENT, snapshot.status === "running" ? "pause" : "start");
  };

  const PlaybackIcon = snapshot.status === "running" ? Pause : Play;

  return (
    <main className="grid min-h-screen place-items-center bg-[#2f333d] text-white">
      <section className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#2f333d] p-3.5">
        <div className="flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight">{snapshot.periodLabel}</h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-white/55">{snapshot.status}</p>
          </div>
          <button
            className="grid h-8 w-8 place-items-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
            onClick={close}
            title="Close"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="relative mt-2 grid shrink-0 place-items-center"
          style={{ height: "min(52vh, 178px)", minHeight: "148px" }}
        >
          <div className="absolute aspect-square w-[62%] max-w-40 rounded-full bg-white/[0.035]" />
          <div className="absolute aspect-square w-[62%] max-w-40">
            {ticks.map((tick) => {
              const angle = (tick / ticks.length) * 360;
              const isActive = tick < activeTickCount;

              return (
                <span
                  key={tick}
                  className={`absolute left-1/2 top-1/2 h-2 w-6 origin-[0_50%] rounded-full ${
                    isActive ? "bg-[#91d7d3]" : "bg-white/8"
                  }`}
                  style={{
                    transform: `rotate(${angle}deg) translateX(min(19vw, 74px))`
                  }}
                />
              );
            })}
          </div>

          <div className="relative text-center">
            <div className="font-mono text-4xl font-medium leading-none tracking-normal">
              {Math.ceil(snapshot.remainingSeconds / 60)}
              <span className="ml-1.5 text-xl text-white/80">min</span>
            </div>
            <p className="mt-2 font-mono text-sm text-white/45">{snapshot.formattedTime}</p>
          </div>
        </div>

        <div className="mt-auto flex shrink-0 justify-center gap-2 pb-2">
          {Array.from({ length: snapshot.totalPeriods }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 w-8 rounded-full ${
                index + 1 === snapshot.periodIndex ? "bg-[#91d7d3]" : "bg-white/15"
              }`}
            />
          ))}
        </div>

        <div className="flex shrink-0 justify-center pb-1">
          <button
            className="grid h-10 w-10 place-items-center rounded-full bg-[#91d7d3] text-[#1d2229] shadow-lg shadow-black/20 transition hover:bg-[#a7e7e3]"
            onClick={togglePlayback}
            title={snapshot.status === "running" ? "Pause" : "Play"}
            type="button"
          >
            <PlaybackIcon size={19} fill={snapshot.status === "running" ? "none" : "currentColor"} />
          </button>
        </div>
      </section>
    </main>
  );
}
