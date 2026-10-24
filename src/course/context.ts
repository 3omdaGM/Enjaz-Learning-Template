import { createContext, useContext, useSyncExternalStore } from 'react';
import { CourseStore } from './store';
export const CourseContext = createContext<CourseStore | null>(null);
export function useCourse() { const store = useContext(CourseContext); if (!store) throw new Error('Course provider missing'); return { store, snapshot: useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot) }; }
