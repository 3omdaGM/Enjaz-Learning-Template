import { ArrowLeft } from 'lucide-react';
import { ButtonLink } from '../components/ui';
import { courseCatalog, courseRoute } from './catalog';

export default function LessonFlow({ moduleId, lessonId, section }: { moduleId: string; lessonId: string; section: string }) {
  let to: string, label: string;
  if (section === 'objectives') {
    to = courseRoute(moduleId, lessonId, 'content');
    label = 'الانتقال إلى محتوى الدرس';
  } else if (section === 'content') {
    to = courseRoute(moduleId, lessonId, 'activity');
    label = 'الانتقال إلى النشاط التعليمي';
  } else if (section === 'activity') {
    const lessons = courseCatalog.modules.flatMap(module => module.lessons.map(lesson => ({ module, lesson })));
    const index = lessons.findIndex(item => item.module.id === moduleId && item.lesson.id === lessonId);
    const next = index >= 0 ? lessons[index + 1] : undefined;
    to = next ? courseRoute(next.module.id, next.lesson.id, 'objectives') : '/content';
    label = next
      ? `${next.module.id === moduleId ? 'الدرس التالي' : `بدء الموديول ${next.module.order}`} — الدرس ${next.lesson.order}: ${next.lesson.title}`
      : 'عرض جميع الموديولات';
  } else return null;
  return <nav className="course-lesson-flow" aria-label="متابعة أقسام الدرس والدروس">
    <ButtonLink to={to}><span>{label}</span><ArrowLeft size={18} aria-hidden="true" /></ButtonLink>
  </nav>;
}
