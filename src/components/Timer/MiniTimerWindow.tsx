import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { MINI_TIMER_EVENT, loadMiniTimerState } from "../../services/miniTimerWindow";
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

  return (
    <main className="grid min-h-screen place-items-center bg-[#2f333d] text-white">
      <section className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#2f333d] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold leading-tight">{snapshot.periodLabel}</h1>
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

        <div className="relative mt-3 grid min-h-0 flex-1 place-items-center">
          <div className="absolute aspect-square w-[76%] max-w-56 rounded-full bg-white/[0.035]" />
          <div className="absolute aspect-square w-[76%] max-w-56">
            {ticks.map((tick) => {
              const angle = (tick / ticks.length) * 360;
              const isActive = tick < activeTickCount;

              return (
                <span
                  key={tick}
                  className={`absolute left-1/2 top-1/2 h-2.5 w-8 origin-[0_50%] rounded-full ${
                    isActive ? "bg-[#91d7d3]" : "bg-white/8"
                  }`}
                  style={{
                    transform: `rotate(${angle}deg) translateX(min(26vw, 100px))`
                  }}
                />
              );
            })}
          </div>

          <div className="relative text-center">
            <div className="font-mono text-5xl font-medium leading-none tracking-normal">
              {Math.ceil(snapshot.remainingSeconds / 60)}
              <span className="ml-2 text-2xl text-white/80">min</span>
            </div>
            <p className="mt-3 font-mono text-sm text-white/45">{snapshot.formattedTime}</p>
          </div>
        </div>

        <div className="mb-2 flex justify-center gap-2">
          {Array.from({ length: snapshot.totalPeriods }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 w-8 rounded-full ${
                index + 1 === snapshot.periodIndex ? "bg-[#91d7d3]" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
