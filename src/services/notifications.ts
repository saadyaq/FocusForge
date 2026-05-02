import { invoke, isTauri } from "@tauri-apps/api/core";
import type { Settings, TimerMode } from "../types";

interface NotificationMessage {
  title: string;
  body: string;
}

function messageForMode(mode: TimerMode, nextMode: TimerMode): NotificationMessage {
  if (mode === "focus") {
    return {
      title: "Focus session complete",
      body: nextMode === "long_break" ? "Nice work. Time for a long break." : "Nice work. Time for a short break."
    };
  }

  return {
    title: "Break complete",
    body: "Ready for the next focus session."
  };
}

async function requestTauriPermission() {
  try {
    const granted = await invoke<boolean>("plugin:notification|is_permission_granted");
    if (granted) return true;

    const permission = await invoke<"granted" | "denied" | "default">("plugin:notification|request_permission");
    return permission === "granted";
  } catch (error) {
    console.warn("Unable to request Tauri notification permission", error);
    return false;
  }
}

async function sendTauriNotification(message: NotificationMessage) {
  const hasPermission = await requestTauriPermission();
  if (!hasPermission) return false;

  try {
    await invoke("plugin:notification|notify", {
      options: {
        title: message.title,
        body: message.body
      }
    });
    return true;
  } catch (error) {
    console.warn("Unable to send Tauri notification", error);
    return false;
  }
}

async function sendBrowserNotification(message: NotificationMessage) {
  if (!("Notification" in window)) return false;

  try {
    const permission =
      Notification.permission === "granted" ? "granted" : await Notification.requestPermission();

    if (permission !== "granted") return false;

    new Notification(message.title, { body: message.body });
    return true;
  } catch (error) {
    console.warn("Unable to send browser notification", error);
    return false;
  }
}

function playCompletionSound() {
  const AudioContext =
    window.AudioContext ||
    (window as Window & typeof globalThis & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
  if (!AudioContext) return;

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(720, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(520, audioContext.currentTime + 0.16);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.24);
}

export async function notifyTimerComplete(settings: Settings, mode: TimerMode, nextMode: TimerMode) {
  if (settings.soundEnabled) {
    playCompletionSound();
  }

  if (!settings.notificationsEnabled) {
    return;
  }

  const message = messageForMode(mode, nextMode);

  if (isTauri()) {
    const sent = await sendTauriNotification(message);
    if (sent) return;
  }

  await sendBrowserNotification(message);
}
