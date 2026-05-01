import { Clock3, History, LayoutDashboard, Settings as SettingsIcon } from "lucide-react";
import { AppShell } from "./components/Layout/AppShell";
import { TimerPanel } from "./components/Timer/TimerPanel";
import { SettingsPanel } from "./components/Timer/SettingsPanel";
import { useSettings } from "./hooks/useSettings";
import { useTimer } from "./hooks/useTimer";

const navItems = [
  { label: "Focus", icon: Clock3, active: true },
  { label: "Dashboard", icon: LayoutDashboard, active: false },
  { label: "History", icon: History, active: false },
  { label: "Settings", icon: SettingsIcon, active: false }
];

export default function App() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const timer = useTimer(settings);

  return (
    <AppShell navItems={navItems}>
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-5 px-5 pb-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <TimerPanel timer={timer} settings={settings} />
        <SettingsPanel settings={settings} onChange={updateSettings} onReset={resetSettings} />
      </main>
    </AppShell>
  );
}
