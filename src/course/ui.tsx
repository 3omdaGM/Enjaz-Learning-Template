import { Fragment, createElement } from 'react';
import type { ReactNode } from 'react';
import { Button, Card } from '../components/ui';
import { useCourse } from './context';
import { useCourseSession } from './hooks';
import { courseAccess } from './store';
import { ButtonLink } from '../components/ui';
export function CourseCard({ title, children, className = '', actions }: { title: string; children: ReactNode; className?: string; actions?: ReactNode }) { return <Card className={`workspace-card ${className}`}><div className="workspace-card-header"><span aria-hidden="true" /><h2>{title}</h2>{actions && <div className="workspace-card-actions">{actions}</div>}</div><div className="workspace-card-body">{children}</div></Card>; }
export function CourseProblem() { const { snapshot, store } = useCourse(); return <Card className="preparation" role="alert"><h1>تعذر استعادة بيانات القالب</h1><p>{snapshot.error}</p><Button onClick={store.reload}>إعادة المحاولة</Button></Card>; }
export function CourseGuard({ children }: { children: ReactNode }) { const { snapshot, active } = useCourseSession(); if (!snapshot.data) return <CourseProblem />; const a = courseAccess(snapshot.data, active); return a.allowed ? <>{children}</> : <Card className="preparation"><h2>قبل فتح الدرس</h2><p>{a.reason}</p><ButtonLink to={a.route}>الانتقال إلى الخطوة المطلوبة</ButtonLink></Card>; }
export function CourseHtml({ raw }: { raw: string }) {
  const root = new DOMParser().parseFromString(raw, 'text/html').body;
  const render = (node: Node, key: number): ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (!(node instanceof Element)) return null;
    const tag = node.tagName.toLowerCase(); if (['script', 'style', 'iframe', 'object', 'embed', 'img'].includes(tag)) return null;
    const children = [...node.childNodes].map((child, i) => render(child, i));
    if (tag === 'obj') return <div key={key} className="course-objective"><span>{node.getAttribute('n')}</span><div>{children}</div></div>;
    if (tag === 'a') { const href = node.getAttribute('href') ?? ''; return /^https:\/\//.test(href) ? <a key={key} href={href} target="_blank" rel="noreferrer">{children}</a> : <Fragment key={key}>{children}</Fragment>; }
    return createElement(['p', 'h4', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'br', 'div', 'span'].includes(tag) ? tag : 'span', { key }, ...children);
  };
  return <div className="course-html">{[...root.childNodes].map(render)}</div>;
}
