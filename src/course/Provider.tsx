import { useState } from 'react';
import type { ReactNode } from 'react';
import { COURSE_STORAGE_KEY, CourseStore } from './store';
import { CourseContext } from './context';
export function CourseProvider({ children }: { children: ReactNode }) { const [store] = useState(() => new CourseStore({ read: () => localStorage.getItem(COURSE_STORAGE_KEY), write: raw => localStorage.setItem(COURSE_STORAGE_KEY, raw) })); return <CourseContext value={store}>{children}</CourseContext>; }
