import { createContext, useContext } from 'react';
import { SessionStore } from './session-store';
export const TrainingContext = createContext<{ adapter: SessionStore; snapshot: ReturnType<SessionStore['getSnapshot']> } | null>(null);
export function useTraining() { const value = useContext(TrainingContext); if (!value) throw new Error('Session provider is missing'); return value; }
