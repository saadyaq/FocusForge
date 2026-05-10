import { useCallback, useEffect, useRef, useState } from "react";
import { notifyInSessionBreak, notifyTimerComplete } from "../services/notifications";
import type { Session, Settings, TimerMode, TimerStatus } from "../types";

interface UseTimerOptions {
  tag: string;
  onSessionComplete: (session: Session) => void;
}

interface TimerPeriod {
  mode: TimerMode;
  durationSeconds: number;
  label: string;
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

function createTimerPeriods(settings: Settings, mode: TimerMode): TimerPeriod[] {
  if (mode !== "focus" || !shouldUseInSessionBreak(settings)) {
    return [{ mode, durationSeconds: durationForMode(settings, mode), label: modeLabels[mode] }];
  }

  const idealBreakCount = Math.max(1, Math.floor(settings.focusDuration / 30) - 1);
  const maximumBreakCount = Math.max(1, Math.floor((settings.focusDuration - 1) / settings.shortBreakDuration));
  const breakCount = Math.min(idealBreakCount, maximumBreakCount);
  const focusPeriodCount = breakCount + 1;
  const focusMinutes = settings.focusDuration - breakCount * settings.shortBreakDuration;
  const baseFocusMinutes = Math.floor(focusMinutes / focusPeriodCount);
  const extraFocusMinutes = focusMinutes % focusPeriodCount;
  const periods: TimerPeriod[] = [];

  for (let index = 0; index < focusPeriodCount; index += 1) {
    const focusMinutesForPeriod = baseFocusMinutes + (index >= focusPeriodCount - extraFocusMinutes ? 1 : 0);

    periods.push({
      mode: "focus",
      durationSeconds: focusMinutesForPeriod * 60,
      label: `Focus period (${index + 1} of ${focusPeriodCount})`
    });

    if (index < breakCount) {
      periods.push({
        mode: "short_break",
        durationSeconds: settings.shortBreakDuration * 60,
        label: `Break (${index + 1} of ${breakCount})`
      });
    }
  }

  return periods;
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
  const [periods, setPeriods] = useState<TimerPeriod[]>(() => createTimerPeriods(settings, "focus"));
  const [periodIndex, setPeriodIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(() => createTimerPeriods(settings, "focus")[0].durationSeconds);
  const intervalRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const remainingSecondsRef = useRef(remainingSeconds);
  const startedAtRef = useRef<string | null>(null);
  const currentPeriod = periods[periodIndex] ?? periods[0];
  const isSegmentedSession = periods.length > 1;

  const currentDuration = currentPeriod.durationSeconds;
  const progress = currentDuration === 0 ? 0 : 1 - remainingSeconds / currentDuration;
  const periodLabel = currentPeriod.label;

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

      const nextPeriods = createTimerPeriods(settings, nextMode);
      const nextPeriod = nextPeriods[0];

      setPeriods(nextPeriods);
      setPeriodIndex(0);
      setMode(nextPeriod.mode);
      setRemainingSeconds(nextPeriod.durationSeconds);
      setStatus(options.autoStart ? "running" : "idle");

      if (options.autoStart) {
        deadlineRef.current = Date.now() + nextPeriod.durationSeconds * 1000;
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

  const startSegment = useCallback((nextPeriodIndex: number) => {
    const nextPeriod = periods[nextPeriodIndex];
    if (!nextPeriod) return;

    clearTimer();
    setPeriodIndex(nextPeriodIndex);
    setMode(nextPeriod.mode);
    setRemainingSeconds(nextPeriod.durationSeconds);
    deadlineRef.current = Date.now() + nextPeriod.durationSeconds * 1000;
    setStatus("running");
  }, [clearTimer, periods]);

  const completeCurrentMode = useCallback(() => {
    setStatus("completed");

    if (isSegmentedSession && periodIndex < periods.length - 1) {
      const nextPeriodIndex = periodIndex + 1;
      const nextPeriod = periods[nextPeriodIndex];

      startSegment(nextPeriodIndex);
      if (nextPeriod.mode === "short_break") {
        void notifyInSessionBreak(settings);
      } else {
        void notifyTimerComplete(settings, "short_break", "focus");
      }
      return;
    }

    if (isSegmentedSession) {
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
  }, [isSegmentedSession, mode, moveToMode, periodIndex, periods, saveFocusSession, settings, startSegment]);

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
    const nextPeriods = createTimerPeriods(settings, mode);
    setPeriods(nextPeriods);
    setPeriodIndex(0);
    setMode(nextPeriods[0].mode);
    setStatus("idle");
    setRemainingSeconds(nextPeriods[0].durationSeconds);
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
      const nextPeriods = createTimerPeriods(settings, mode);
      setPeriods(nextPeriods);
      setPeriodIndex(0);
      setMode(nextPeriods[0].mode);
      setRemainingSeconds(nextPeriods[0].durationSeconds);
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
    periodIndex: periodIndex + 1,
    totalPeriods: periods.length,
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
