import { useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { SessionStore, SESSION_STORAGE_KEY } from './session-store';
import { TrainingContext } from './training-context';
export default function TrainingProvider({ children }: { children: ReactNode }) {
 const [adapter] = useState(() => new SessionStore({ read: () => localStorage.getItem(SESSION_STORAGE_KEY), write: raw => localStorage.setItem(SESSION_STORAGE_KEY, raw) }));
 const snapshot = useSyncExternalStore(adapter.subscribe, adapter.getSnapshot);
 useEffect(() => { const changed = (event: StorageEvent) => { if (event.key === SESSION_STORAGE_KEY) adapter.reload(); }; window.addEventListener('storage', changed); return () => window.removeEventListener('storage', changed); }, [adapter]);
 return <TrainingContext.Provider value={{ adapter, snapshot }}>{children}</TrainingContext.Provider>;
}
