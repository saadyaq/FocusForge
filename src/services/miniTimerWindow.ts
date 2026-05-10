import { isTauri } from "@tauri-apps/api/core";
import { emitTo } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import type { TimerSnapshot } from "../types";

const MINI_TIMER_LABEL = "mini-timer";
const MINI_TIMER_STATE_KEY = "focusforge.miniTimerState";
const MINI_TIMER_EVENT = "focusforge://timer-state";

export function saveMiniTimerState(snapshot: TimerSnapshot) {
  localStorage.setItem(MINI_TIMER_STATE_KEY, JSON.stringify(snapshot));

  if (isTauri()) {
    void emitTo(MINI_TIMER_LABEL, MINI_TIMER_EVENT, snapshot);
  }
}

export function loadMiniTimerState(): TimerSnapshot | null {
  const stored = localStorage.getItem(MINI_TIMER_STATE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as TimerSnapshot;
  } catch {
    return null;
  }
}

export async function openMiniTimerWindow(snapshot: TimerSnapshot) {
  saveMiniTimerState(snapshot);

  if (!isTauri()) {
    window.open("/?mini=1", "focusforge-mini-timer", "width=300,height=340");
    return;
  }

  const existingWindow = await WebviewWindow.getByLabel(MINI_TIMER_LABEL);
  if (existingWindow) {
    await existingWindow.show();
    await existingWindow.setFocus();
    await emitTo(MINI_TIMER_LABEL, MINI_TIMER_EVENT, snapshot);
    return;
  }

  const miniWindow = new WebviewWindow(MINI_TIMER_LABEL, {
    url: "/?mini=1",
    title: "FocusForge Timer",
    width: 300,
    height: 340,
    minWidth: 260,
    minHeight: 300,
    resizable: true,
    decorations: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    focus: true,
    backgroundColor: "#2f333d"
  });

  miniWindow.once("tauri://created", () => {
    void emitTo(MINI_TIMER_LABEL, MINI_TIMER_EVENT, snapshot);
  });

  miniWindow.once("tauri://error", (event) => {
    console.warn("Unable to open mini timer window", event.payload);
  });
}

export { MINI_TIMER_EVENT, MINI_TIMER_STATE_KEY };
