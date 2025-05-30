/* SessionContext.tsx */
import React, { createContext, useContext, useState, useEffect } from "react";
import SessionApi, { Session } from "../services/api";

export type SessionContextType = {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  addSession: (session: Omit<Session, "id">) => Promise<Session | undefined>;
  loadSavedSession: (sessionId: number) => void;
  fetchSessions: () => Promise<void>;
  updateSession: (id: number, data: Partial<Session>) => Promise<void>;
  incrementRuntime: (id: number) => Promise<void>;
  incrementYawning: (id: number) => Promise<void>;
  incrementClosed: (id: number) => Promise<void>;
  incrementDone: (id: number) => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshSession = async (id: number) => {
    const updated = await SessionApi.getSessionById(id);
    if (!updated) return null;
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    if (currentSession?.id === id) setCurrentSession(updated);
    return updated;
  };
  useEffect(() => {
    if (!isInitialized) {
      fetchSessions();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const fetchSessions = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const sessionsData = await SessionApi.getSessions();
      setSessions(sessionsData);
      if (sessionsData.length > 0 && !currentSession) {
        setCurrentSession(sessionsData[0]);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setError("Failed to load sessions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addSession = async (session: Omit<Session, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await SessionApi.createSession(session);
      await fetchSessions();
      return newSession;
    } catch (err) {
      console.error("Failed to add session:", err);
      setError("Failed to create session. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedSession = (sessionId: number) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const updateSession = async (id: number, data: Partial<Session>) => {
    await SessionApi.updateSession(id, data);
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    if (currentSession?.id === id) {
      setCurrentSession((s) => (s ? { ...s, ...data } : s));
    }
  };

  const incrementRuntime = async (id: number) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, runtime: (s.runtime || 0) + 1 }
          : s
      )
    );
    if (currentSession?.id === id) {
      setCurrentSession(s =>
        s ? { ...s, runtime: (s.runtime || 0) + 1 } : s
      );
    }

    SessionApi.incrementRuntime(id).catch(err =>
      console.error("incrementRuntime error", err)
    );
  };
  const incrementYawning = async (id: number) => {
    await SessionApi.incrementYawning(id);
    await refreshSession(id);
  };
  const incrementClosed = async (id: number) => {
    await SessionApi.incrementClosed(id);
    await refreshSession(id);
  };
  const incrementDone = async (id: number) => {
    await SessionApi.incrementDone(id);
    await refreshSession(id);
  };

  return (
    <SessionContext.Provider
      value={{
        sessions,
        currentSession,
        isLoading,
        error,
        addSession,
        loadSavedSession,
        fetchSessions,
        updateSession,
        incrementRuntime,
        incrementYawning,
        incrementClosed,
        incrementDone,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be within SessionProvider");
  return context;
};
