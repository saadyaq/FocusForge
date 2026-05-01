import type { Settings } from "../types";

const STORAGE_KEY = "focusforge.settings";

export const defaultSettings: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  notificationsEnabled: true,
  soundEnabled: false,
  theme: "system"
};

export function loadSettings(): Settings {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return defaultSettings;
  }

  try {
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
