import { useEffect, useState } from 'react';
import { useCourse } from './context';
import { useTraining } from '../state/training-context';
export function useCourseSession() { const course = useCourse(); const training = useTraining(); return { ...course, active: !!training.snapshot.data?.learner.active, name: training.snapshot.data?.learner.name ?? 'متدرب تجريبي' }; }
export function useClock() { const [now, setNow] = useState(Date.now); useEffect(() => { const id = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(id); }, []); return now; }
export function timeLabel(deadline: number, now: number) { const seconds = Math.max(0, Math.ceil((deadline - now) / 1000)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
