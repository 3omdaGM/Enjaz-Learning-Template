import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { BookOpen, ChevronDown, Flag, Layers3, List, Target } from 'lucide-react';
import { Breadcrumbs, Button, Drawer } from '../components/ui';
import { courseCatalog, courseRoute, groups } from './catalog';
import type { CourseModule } from './catalog';
import { useCourseSession } from './hooks';
const sections = [{ id: 'objectives', label: 'أهداف الدرس', Icon: Target }, { id: 'content', label: 'محتوى الدرس', Icon: Layers3 }, { id: 'activity', label: 'النشاط التعليمي', Icon: Flag }];
function CourseNavigation({ module, lessonId, onNavigate }: { module: CourseModule; lessonId?: string | undefined; onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState(lessonId ?? null); const prefix = useId();
  const navigate = useNavigate(), location = useLocation();
  const openLesson = (id: string) => {
    setExpanded(id);
    const target = courseRoute(module.id, id, 'objectives');
    if (location.pathname !== target || location.search || location.hash) navigate(target);
    onNavigate?.();
  };
  const { snapshot } = useCourseSession(); const assignment = snapshot.data?.assignment; const group = assignment ? groups[assignment.group] : null;
  return <div className="workspace-navigation"><div className="workspace-module-title"><BookOpen size={22} aria-hidden="true" /><div><h2>الموديول {module.order}</h2><p>قائمة الدروس وأقسامها</p></div></div>{group && <p className="course-group-label">{group.label} · {group.styleLabel} · {group.supportLabel}</p>}<nav className="workspace-module-links" aria-label="معلومات الموديول"><NavLink to={courseRoute(module.id)} end onClick={onNavigate}>أهداف الموديول</NavLink><Link to="/content" onClick={onNavigate}>كل الموديولات</Link></nav><nav className="workspace-lessons" aria-label="دروس الموديول وأقسامها">{module.lessons.map(lesson => <div key={lesson.id} className={`workspace-lesson-group${expanded === lesson.id ? ' is-open' : ''}`}><button className="workspace-lesson-toggle" type="button" aria-label={`الدرس ${lesson.order}: ${lesson.title}`} aria-expanded={expanded === lesson.id} aria-controls={`${prefix}-${lesson.id}`} onClick={() => openLesson(lesson.id)}><span className="workspace-lesson-number" aria-hidden="true">{lesson.order}</span><span>{lesson.title}</span><ChevronDown size={14} aria-hidden="true" /></button><div id={`${prefix}-${lesson.id}`} hidden={expanded !== lesson.id} className="workspace-lesson-sections">{sections.map(({ id, label, Icon }) => <NavLink key={id} to={courseRoute(module.id, lesson.id, id)} onClick={onNavigate} className={({ isActive }) => isActive ? 'selected' : ''}><span className="workspace-section-icon"><Icon size={15} aria-hidden="true" /></span><span>{label}</span></NavLink>)}</div></div>)}</nav></div>;
}
export default function Workspace({ moduleId, lessonId, section = 'overview', children }: { moduleId: string; lessonId?: string | undefined; section?: string; children: ReactNode }) {
  const module = courseCatalog.modules.find(m => m.id === moduleId)!; const lesson = module.lessons.find(l => l.id === lessonId); const item = sections.find(s => s.id === section); const label = item?.label ?? 'أهداف الموديول'; const Icon = item?.Icon ?? Target;
  const [open, setOpen] = useState(false);
  return <div className="reference-workspace"><aside className="workspace-sidebar" aria-label="قائمة دروس الموديول"><CourseNavigation module={module} lessonId={lessonId} /></aside><Drawer open={open} onClose={() => setOpen(false)} title="قائمة الدروس" className="workspace-navigation-dialog"><CourseNavigation module={module} lessonId={lessonId} onNavigate={() => setOpen(false)} /></Drawer><div className="workspace-panel"><div className="workspace-mobile-control"><Button onClick={() => setOpen(true)} aria-expanded={open} aria-haspopup="dialog"><List size={18} aria-hidden="true" />عرض قائمة الدروس</Button><span>{label}</span></div><Breadcrumbs items={[{ label: 'المحتوى التعليمي', to: '/content' }, { label: `الموديول ${module.order}`, to: courseRoute(module.id) }, ...(lesson ? [{ label: `الدرس ${lesson.order}` }] : []), { label }]} /><header className="workspace-panel-header"><span className="workspace-panel-icon"><Icon size={25} aria-hidden="true" /></span><div><h1>{label} — {lesson ? `الدرس ${lesson.order}` : `الموديول ${module.order}`}</h1><p>{lesson?.title ?? module.title}</p></div></header><div className="workspace-panel-content">{children}{!lesson && <div className="workspace-overview-actions"><Button onClick={() => setOpen(true)} aria-expanded={open} aria-haspopup="dialog"><List size={18} aria-hidden="true" />عرض دروس الموديول</Button></div>}</div><p className="workspace-draft-note">قالب عرض عام — النصوص والوسائط أمثلة بديلة قابلة للتخصيص.</p></div></div>;
}
