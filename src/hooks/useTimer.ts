import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notifyTimerComplete } from "../services/notifications";
import type { Session, Settings, TimerMode, TimerStatus } from "../types";

interface UseTimerOptions {
  tag: string;
  onSessionComplete: (session: Session) => void;
}

const modeLabels: Record<TimerMode, string> = {
  focus: "Focus",
  short_break: "Short break",
  long_break: "Long break"
};

function durationForMode(settings: Settings, mode: TimerMode) {
  if (mode === "focus") return settings.focusDuration * 60;
  if (mode === "short_break") return settings.shortBreakDuration * 60;
  return settings.longBreakDuration * 60;
}

function getNextMode(mode: TimerMode, completedFocusCycles: number, settings: Settings): TimerMode {
  if (mode !== "focus") {
    return "focus";
  }

  const nextCycleCount = completedFocusCycles + 1;
  return nextCycleCount % settings.cyclesBeforeLongBreak === 0 ? "long_break" : "short_break";
}

export function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function createSessionId() {
  if ("crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useTimer(settings: Settings, { tag, onSessionComplete }: UseTimerOptions) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [completedFocusCycles, setCompletedFocusCycles] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(() => durationForMode(settings, "focus"));
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<string | null>(null);

  const currentDuration = useMemo(() => durationForMode(settings, mode), [mode, settings]);
  const progress = currentDuration === 0 ? 0 : 1 - remainingSeconds / currentDuration;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const moveToMode = useCallback(
    (nextMode: TimerMode) => {
      clearTimer();
      setMode(nextMode);
      setStatus("idle");
      setRemainingSeconds(durationForMode(settings, nextMode));
    },
    [clearTimer, settings]
  );

  const completeCurrentMode = useCallback(() => {
    setStatus("completed");

    if (mode === "focus" && startedAtRef.current) {
      const endedAt = new Date().toISOString();

      onSessionComplete({
        id: createSessionId(),
        tag: tag.trim() || "Deep work",
        mode,
        durationMinutes: settings.focusDuration,
        completed: true,
        startedAt: startedAtRef.current,
        endedAt
      });
    }

    startedAtRef.current = null;

    setCompletedFocusCycles((currentCycles) => {
      const nextMode = getNextMode(mode, currentCycles, settings);
      const nextCycles = mode === "focus" ? currentCycles + 1 : currentCycles;

      void notifyTimerComplete(settings, mode, nextMode);
      window.setTimeout(() => moveToMode(nextMode), 650);
      return nextCycles;
    });
  }, [mode, moveToMode, onSessionComplete, settings, tag]);

  const start = useCallback(() => {
    if (status === "running") return;
    if (!startedAtRef.current) {
      startedAtRef.current = new Date().toISOString();
    }
    setStatus("running");
  }, [status]);

  const pause = useCallback(() => {
    if (status !== "running") return;
    setStatus("paused");
    clearTimer();
  }, [clearTimer, status]);

  const reset = useCallback(() => {
    clearTimer();
    startedAtRef.current = null;
    setStatus("idle");
    setRemainingSeconds(durationForMode(settings, mode));
  }, [clearTimer, mode, settings]);

  const skip = useCallback(() => {
    const nextMode = getNextMode(mode, completedFocusCycles, settings);
    if (mode === "focus") {
      setCompletedFocusCycles((cycles) => cycles + 1);
    }
    startedAtRef.current = null;
    moveToMode(nextMode);
  }, [completedFocusCycles, mode, moveToMode, settings]);

  useEffect(() => {
    if (status !== "running") {
      return clearTimer;
    }

    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          clearTimer();
          completeCurrentMode();
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return clearTimer;
  }, [clearTimer, completeCurrentMode, status]);

  useEffect(() => {
    if (status === "idle") {
      setRemainingSeconds(durationForMode(settings, mode));
    }
  }, [mode, settings, status]);

  return {
    mode,
    modeLabel: modeLabels[mode],
    status,
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    progress,
    completedFocusCycles,
    nextBreakLabel:
      (completedFocusCycles + 1) % settings.cyclesBeforeLongBreak === 0 ? "Long break" : "Short break",
    start,
    pause,
    reset,
    skip,
    moveToMode
  };
}
