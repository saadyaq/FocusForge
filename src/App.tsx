import { useMemo, useState } from "react";
import { Clock3, History, Settings as SettingsIcon } from "lucide-react";
import { AppShell } from "./components/Layout/AppShell";
import { TimerPanel } from "./components/Timer/TimerPanel";
import { SettingsPanel } from "./components/Timer/SettingsPanel";
import { useSettings } from "./hooks/useSettings";
import { useSessions } from "./hooks/useSessions";
import { useTimer } from "./hooks/useTimer";
import { HistoryPage } from "./pages/History";

type View = "focus" | "history" | "settings";

export default function App() {
  const [activeView, setActiveView] = useState<View>("focus");
  const [tag, setTag] = useState("Deep work");
  const { settings, updateSettings, resetSettings } = useSettings();
  const { sessions, tags, addSession, clearSessions } = useSessions();
  const timer = useTimer(settings, { tag, onSessionComplete: addSession });

  const navItems = useMemo(
    () => [
      { id: "focus", label: "Focus", icon: Clock3, active: activeView === "focus" },
      { id: "history", label: "History", icon: History, active: activeView === "history" },
      { id: "settings", label: "Settings", icon: SettingsIcon, active: activeView === "settings" }
    ],
    [activeView]
  );

  return (
    <AppShell navItems={navItems} onNavigate={(view) => setActiveView(view as View)}>
      {activeView === "history" ? (
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
