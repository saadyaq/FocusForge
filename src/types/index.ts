export type TimerMode = "focus" | "short_break" | "long_break";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

export interface Settings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  theme: "light" | "dark" | "system";
}

export interface Session {
  id: string;
  tag: string;
  mode: TimerMode;
  durationMinutes: number;
  completed: boolean;
  startedAt: string;
  endedAt: string;
  notes?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}
