import type { Session } from "../types";

const STORAGE_KEY = "focusforge.sessions";

export function loadSessions(): Session[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const sessions = JSON.parse(stored);
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: Session[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
