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
  return settings.focusDuration >= 60 && settings.shortBreakDuration > 0 && settings.focusDuration > settings.shortBreakDuration;
}

function focusPeriodDuration(settings: Settings, periodIndex: number) {
  const focusMinutes = settings.focusDuration - settings.shortBreakDuration;
  const firstPeriodSeconds = Math.floor(focusMinutes / 2) * 60;

  return periodIndex === 1 ? firstPeriodSeconds : focusMinutes * 60 - firstPeriodSeconds;
}

function durationForPeriod(settings: Settings, mode: TimerMode, focusPeriodIndex: number, isSegmentedSession: boolean) {
  if (mode === "focus" && isSegmentedSession) {
    return focusPeriodDuration(settings, focusPeriodIndex);
  }

  return durationForMode(settings, mode);
}

function periodLabelFor(mode: TimerMode, focusPeriodIndex: number, isSegmentedSession: boolean) {
  if (!isSegmentedSession) return modeLabels[mode];
  if (mode === "short_break") return "Break";
  return `Focus period (${focusPeriodIndex} of 2)`;
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
  const [focusPeriodIndex, setFocusPeriodIndex] = useState(1);
  const [isSegmentedSession, setIsSegmentedSession] = useState(() => shouldUseInSessionBreak(settings));
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    durationForPeriod(settings, "focus", 1, shouldUseInSessionBreak(settings))
  );
  const intervalRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const remainingSecondsRef = useRef(remainingSeconds);
  const startedAtRef = useRef<string | null>(null);

  const currentDuration = useMemo(
    () => durationForPeriod(settings, mode, focusPeriodIndex, isSegmentedSession),
    [focusPeriodIndex, isSegmentedSession, mode, settings]
  );
  const progress = currentDuration === 0 ? 0 : 1 - remainingSeconds / currentDuration;
  const periodLabel = periodLabelFor(mode, focusPeriodIndex, isSegmentedSession);

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getDeadlineRemainingSeconds = useCallback(() => {
    if (!deadlineRef.current) return remainingSecondsRef.current;

    return Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
  }, []);

  const moveToMode = useCallback(
    (nextMode: TimerMode, options: { autoStart?: boolean } = {}) => {
      clearTimer();
      deadlineRef.current = null;

      const nextIsSegmentedSession = nextMode === "focus" && shouldUseInSessionBreak(settings);
      const nextFocusPeriodIndex = 1;
      const nextDuration = durationForPeriod(settings, nextMode, nextFocusPeriodIndex, nextIsSegmentedSession);

      setIsSegmentedSession(nextIsSegmentedSession);
      setFocusPeriodIndex(nextFocusPeriodIndex);
      setMode(nextMode);
      setRemainingSeconds(nextDuration);
      setStatus(options.autoStart ? "running" : "idle");

      if (options.autoStart) {
        deadlineRef.current = Date.now() + nextDuration * 1000;
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

  const startSegment = useCallback((nextMode: TimerMode, nextFocusPeriodIndex: number, nextDuration: number) => {
    clearTimer();
    setMode(nextMode);
    setFocusPeriodIndex(nextFocusPeriodIndex);
    setRemainingSeconds(nextDuration);
    deadlineRef.current = Date.now() + nextDuration * 1000;
    setStatus("running");
  }, [clearTimer]);

  const completeCurrentMode = useCallback(() => {
    setStatus("completed");

    if (isSegmentedSession && mode === "focus" && focusPeriodIndex === 1) {
      const breakDuration = durationForMode(settings, "short_break");
      startSegment("short_break", 1, breakDuration);
      void notifyInSessionBreak(settings);
      return;
    }

    if (isSegmentedSession && mode === "short_break") {
      const secondFocusDuration = focusPeriodDuration(settings, 2);
      startSegment("focus", 2, secondFocusDuration);
      void notifyTimerComplete(settings, "short_break", "focus");
      return;
    }

    if (isSegmentedSession && mode === "focus" && focusPeriodIndex === 2) {
      saveFocusSession();
      deadlineRef.current = null;
      startedAtRef.current = null;

      setCompletedFocusCycles((currentCycles) => {
        void notifyTimerComplete(settings, "focus", "focus");
        window.setTimeout(() => moveToMode("focus"), 650);
        return currentCycles + 1;
      });
      return;
    }

    if (mode === "focus") {
      saveFocusSession();
    }

    startedAtRef.current = null;
    deadlineRef.current = null;

    setCompletedFocusCycles((currentCycles) => {
      const nextMode = getNextMode(mode, currentCycles, settings);
      const nextCycles = mode === "focus" ? currentCycles + 1 : currentCycles;

      void notifyTimerComplete(settings, mode, nextMode);
      window.setTimeout(() => moveToMode(nextMode, { autoStart: mode === "focus" }), 650);
      return nextCycles;
    });
  }, [focusPeriodIndex, isSegmentedSession, mode, moveToMode, saveFocusSession, settings, startSegment]);

  const start = useCallback(() => {
    if (status === "running") return;
    if (!startedAtRef.current) {
      startedAtRef.current = new Date().toISOString();
    }
    deadlineRef.current = Date.now() + remainingSeconds * 1000;
    setStatus("running");
  }, [remainingSeconds, status]);

  const pause = useCallback(() => {
    if (status !== "running") return;
    setRemainingSeconds(getDeadlineRemainingSeconds());
    deadlineRef.current = null;
    setStatus("paused");
    clearTimer();
  }, [clearTimer, getDeadlineRemainingSeconds, status]);

  const reset = useCallback(() => {
    clearTimer();
    startedAtRef.current = null;
    deadlineRef.current = null;
    const nextIsSegmentedSession = mode === "focus" && shouldUseInSessionBreak(settings);
    setIsSegmentedSession(nextIsSegmentedSession);
    setFocusPeriodIndex(1);
    setStatus("idle");
    setRemainingSeconds(durationForPeriod(settings, mode, 1, nextIsSegmentedSession));
  }, [clearTimer, mode, settings]);

  const skip = useCallback(() => {
    if (isSegmentedSession) {
      completeCurrentMode();
      return;
    }

    const nextMode = getNextMode(mode, completedFocusCycles, settings);
    if (mode === "focus") {
      setCompletedFocusCycles((cycles) => cycles + 1);
    }
    startedAtRef.current = null;
    deadlineRef.current = null;
    moveToMode(nextMode);
  }, [completeCurrentMode, completedFocusCycles, isSegmentedSession, mode, moveToMode, settings]);

  useEffect(() => {
    if (status !== "running") {
      return clearTimer;
    }

    const tick = () => {
      const seconds = getDeadlineRemainingSeconds();

      if (seconds <= 0) {
        setRemainingSeconds(0);
        clearTimer();
        completeCurrentMode();
        return;
      }

      setRemainingSeconds(seconds);
    };

    tick();
    intervalRef.current = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);

    return () => {
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
      clearTimer();
    };
  }, [clearTimer, completeCurrentMode, getDeadlineRemainingSeconds, status]);

  useEffect(() => {
    if (status === "idle") {
      deadlineRef.current = null;
      const nextIsSegmentedSession = mode === "focus" && shouldUseInSessionBreak(settings);
      setIsSegmentedSession(nextIsSegmentedSession);
      setFocusPeriodIndex(1);
      setRemainingSeconds(durationForPeriod(settings, mode, 1, nextIsSegmentedSession));
    }
  }, [mode, settings, status]);

  return {
    mode,
    modeLabel: modeLabels[mode],
    status,
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    progress,
    periodLabel,
    periodIndex: isSegmentedSession ? (mode === "short_break" ? 2 : focusPeriodIndex === 1 ? 1 : 3) : 1,
    totalPeriods: isSegmentedSession ? 3 : 1,
    focusPeriodIndex,
    isSegmentedSession,
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
