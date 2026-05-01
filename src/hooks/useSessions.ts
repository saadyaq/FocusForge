import { useCallback, useEffect, useMemo, useState } from "react";
import { loadSessions, saveSessions } from "../services/sessions";
import type { Session } from "../types";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions());

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const addSession = useCallback((session: Session) => {
    setSessions((current) => [session, ...current]);
  }, []);

  const clearSessions = useCallback(() => {
    setSessions([]);
  }, []);

  const tags = useMemo(
    () => Array.from(new Set(sessions.map((session) => session.tag).filter(Boolean))).sort(),
    [sessions]
  );

  return {
    sessions,
    tags,
    addSession,
    clearSessions
  };
}
