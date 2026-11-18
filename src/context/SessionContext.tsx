import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { clearSession, loadSession, loadSessionSync, saveSession } from '@/storage/accounts';
import type { User } from '@/types/auth';

type SessionContextValue = {
  user: User | null;
  loading: boolean;
  startSession: (user: User) => Promise<void>;
  endSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedSync = useRef(false);

  // Web: resolve the session before the first paint. A layout effect (not initial state)
  // keeps the hydrated tree identical to the static HTML, avoiding a hydration mismatch.
  useLayoutEffect(() => {
    const savedUser = loadSessionSync();
    if (savedUser === undefined) return;
    resolvedSync.current = true;
    // Intentional: one synchronous pre-paint update with a client-only value (no async storage tick).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(savedUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (resolvedSync.current) return;
    let active = true;
    loadSession()
      .then((savedUser) => { if (active) setUser(savedUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const startSession = useCallback(async (nextUser: User) => {
    await saveSession(nextUser);
    setUser(nextUser);
  }, []);

  const endSession = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, startSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('SessionProvider is required.');
  return context;
}
