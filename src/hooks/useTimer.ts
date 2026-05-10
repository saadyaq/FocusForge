import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notifyInSessionBreak, notifyTimerComplete } from "../services/notifications";
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

function shouldUseInSessionBreak(settings: Settings) {
  return settings.focusDuration >= 60 && settings.shortBreakDuration > 0;
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
  const inSessionBreakRef = useRef(false);
  const inSessionBreakTakenRef = useRef(false);

  const currentDuration = useMemo(() => durationForMode(settings, mode), [mode, settings]);
  const progress = currentDuration === 0 ? 0 : 1 - remainingSeconds / currentDuration;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const moveToMode = useCallback(
    (nextMode: TimerMode, options: { autoStart?: boolean } = {}) => {
      clearTimer();
      inSessionBreakRef.current = false;
      inSessionBreakTakenRef.current = false;
      setMode(nextMode);
      setRemainingSeconds(durationForMode(settings, nextMode));
      setStatus(options.autoStart ? "running" : "idle");

      if (options.autoStart) {
        startedAtRef.current = new Date().toISOString();
      }
    },
    [clearTimer, settings]
  );

  const saveFocusSession = useCallback(() => {
    if (!startedAtRef.current) return;

    onSessionComplete({
      id: createSessionId(),
      tag: tag.trim() || "Deep work",
      mode: "focus",
      durationMinutes: settings.focusDuration,
      completed: true,
      startedAt: startedAtRef.current,
      endedAt: new Date().toISOString()
    });
  }, [onSessionComplete, settings.focusDuration, tag]);

  const startInSessionBreak = useCallback(() => {
    clearTimer();
    inSessionBreakRef.current = true;
    inSessionBreakTakenRef.current = true;
    setMode("short_break");
    setStatus("running");
    void notifyInSessionBreak(settings);
  }, [clearTimer, settings]);

  const completeCurrentMode = useCallback(() => {
    setStatus("completed");

    if (inSessionBreakRef.current) {
      saveFocusSession();
      inSessionBreakRef.current = false;
      inSessionBreakTakenRef.current = false;
      startedAtRef.current = null;

      setCompletedFocusCycles((currentCycles) => {
        void notifyTimerComplete(settings, "short_break", "focus");
        window.setTimeout(() => moveToMode("focus"), 650);
        return currentCycles + 1;
      });
      return;
    }

    if (mode === "focus") {
      saveFocusSession();
    }

    startedAtRef.current = null;

    setCompletedFocusCycles((currentCycles) => {
      const nextMode = getNextMode(mode, currentCycles, settings);
      const nextCycles = mode === "focus" ? currentCycles + 1 : currentCycles;

      void notifyTimerComplete(settings, mode, nextMode);
      window.setTimeout(() => moveToMode(nextMode, { autoStart: mode === "focus" }), 650);
      return nextCycles;
    });
  }, [mode, moveToMode, saveFocusSession, settings]);

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
    inSessionBreakRef.current = false;
    inSessionBreakTakenRef.current = false;
    setStatus("idle");
    setRemainingSeconds(durationForMode(settings, mode));
  }, [clearTimer, mode, settings]);

  const skip = useCallback(() => {
    if (inSessionBreakRef.current) {
      completeCurrentMode();
      return;
    }

    const nextMode = getNextMode(mode, completedFocusCycles, settings);
    if (mode === "focus") {
      setCompletedFocusCycles((cycles) => cycles + 1);
    }
    startedAtRef.current = null;
    inSessionBreakRef.current = false;
    inSessionBreakTakenRef.current = false;
    moveToMode(nextMode);
  }, [completeCurrentMode, completedFocusCycles, mode, moveToMode, settings]);

  useEffect(() => {
    if (status !== "running") {
      return clearTimer;
    }

    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (
          mode === "focus" &&
          shouldUseInSessionBreak(settings) &&
          !inSessionBreakTakenRef.current &&
          seconds <= settings.shortBreakDuration * 60 + 1
        ) {
          startInSessionBreak();
          return durationForMode(settings, "short_break");
        }

        if (seconds <= 1) {
          clearTimer();
          completeCurrentMode();
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return clearTimer;
  }, [clearTimer, completeCurrentMode, mode, settings, startInSessionBreak, status]);

  useEffect(() => {
    if (status === "idle") {
      inSessionBreakRef.current = false;
      inSessionBreakTakenRef.current = false;
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
