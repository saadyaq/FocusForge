import { useEffect, useMemo, useState } from "react";
import { defaultSettings, loadSettings, saveSettings } from "../services/settings";
import type { Settings } from "../types";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = settings.theme === "dark" || (settings.theme === "system" && prefersDark);

    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, [settings.theme]);

  const actions = useMemo(
    () => ({
      updateSettings: (patch: Partial<Settings>) => {
        setSettings((current) => ({ ...current, ...patch }));
      },
      resetSettings: () => {
        setSettings(defaultSettings);
      }
    }),
    []
  );

  return { settings, ...actions };
}
