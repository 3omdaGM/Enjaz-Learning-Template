import { useEffect, useState } from 'react';
import { Button } from '../components/ui';
import { CourseCard } from './ui';
export default function Support({ messages, mode, card = false }: { messages: string[]; mode: 'fixed' | 'flex'; card?: boolean }) {
  const [open, setOpen] = useState(mode === 'fixed'), [paused, setPaused] = useState(false), [index, setIndex] = useState(0);
  useEffect(() => { if (!open || paused || messages.length < 2) return; const id = setInterval(() => setIndex(i => (i + 1) % messages.length), 2000); return () => clearInterval(id); }, [open, paused, messages.length]);
  if (!messages.length) return null;
  const body = <><div className="course-support-controls"><strong>{mode === 'fixed' ? 'الدعم الثابت' : 'الدعم المرن'}</strong>{mode === 'flex' && <Button variant="secondary" onClick={() => setOpen(v => !v)} aria-expanded={open}>{open ? 'إخفاء الدعم' : 'عرض الدعم'}</Button>}{open && messages.length > 1 && <Button variant="ghost" onClick={() => setPaused(v => !v)} aria-pressed={paused}>{paused ? 'استئناف التبديل' : 'إيقاف التبديل'}</Button>}</div>{open && <><p className="course-support-message">{messages[index]}</p><details><summary>كل الإرشادات ({messages.length})</summary><ul>{messages.map((text, i) => <li key={i}>{text}</li>)}</ul></details></>}</>;
  return card ? <CourseCard title="توجيهات وإرشادات" className="course-support-card">{body}</CourseCard> : <aside className="course-support-strip" aria-label="دعم المحتوى">{body}</aside>;
}
