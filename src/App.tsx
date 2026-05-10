import { useEffect, useMemo, useState } from "react";
import { Clock3, History, LayoutDashboard, Settings as SettingsIcon } from "lucide-react";
import { AppShell } from "./components/Layout/AppShell";
import { MiniTimerWindow } from "./components/Timer/MiniTimerWindow";
import { TimerPanel } from "./components/Timer/TimerPanel";
import { SettingsPanel } from "./components/Timer/SettingsPanel";
import { useSettings } from "./hooks/useSettings";
import { useSessions } from "./hooks/useSessions";
import { useTimer } from "./hooks/useTimer";
import { DashboardPage } from "./pages/Dashboard";
import { HistoryPage } from "./pages/History";
import { saveMiniTimerState } from "./services/miniTimerWindow";

type View = "focus" | "dashboard" | "history" | "settings";

export default function App() {
  const isMiniWindow = new URLSearchParams(window.location.search).get("mini") === "1";

  return isMiniWindow ? <MiniTimerWindow /> : <MainApp />;
}

function MainApp() {
  const [activeView, setActiveView] = useState<View>("focus");
  const [tag, setTag] = useState("Deep work");
  const { settings, updateSettings, resetSettings } = useSettings();
  const { sessions, tags, addSession, clearSessions } = useSessions();
  const timer = useTimer(settings, { tag, onSessionComplete: addSession });

  useEffect(() => {
    saveMiniTimerState({
      mode: timer.mode,
      modeLabel: timer.modeLabel,
      status: timer.status,
      remainingSeconds: timer.remainingSeconds,
      formattedTime: timer.formattedTime,
      progress: timer.progress,
      periodLabel: timer.periodLabel,
      periodIndex: timer.periodIndex,
      totalPeriods: timer.totalPeriods
    });
  }, [
    timer.formattedTime,
    timer.mode,
    timer.modeLabel,
    timer.periodIndex,
    timer.periodLabel,
    timer.progress,
    timer.remainingSeconds,
    timer.status,
    timer.totalPeriods
  ]);

  const navItems = useMemo(
    () => [
      { id: "focus", label: "Focus", icon: Clock3, active: activeView === "focus" },
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: activeView === "dashboard" },
      { id: "history", label: "History", icon: History, active: activeView === "history" },
      { id: "settings", label: "Settings", icon: SettingsIcon, active: activeView === "settings" }
    ],
    [activeView]
  );

  return (
    <AppShell navItems={navItems} onNavigate={(view) => setActiveView(view as View)}>
      {activeView === "dashboard" ? (
        <DashboardPage sessions={sessions} />
      ) : activeView === "history" ? (
        <HistoryPage sessions={sessions} tags={tags} onClear={clearSessions} />
      ) : (
        <main
          className={`grid min-h-0 flex-1 grid-cols-1 gap-5 px-5 pb-5 ${
            activeView === "settings" ? "lg:grid-cols-[minmax(0,520px)]" : "lg:grid-cols-[minmax(0,1fr)_360px]"
          }`}
        >
          {activeView === "focus" && <TimerPanel timer={timer} settings={settings} tag={tag} onTagChange={setTag} />}
          <SettingsPanel settings={settings} onChange={updateSettings} onReset={resetSettings} />
        </main>
      )}
    </AppShell>
  );
}
