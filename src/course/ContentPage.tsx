import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, BookOpen, Film, Info, LayoutTemplate, ShieldCheck } from 'lucide-react';
import { Button, ButtonLink, Drawer } from '../components/ui';
import { useCourseSession } from './hooks';
import { courseCatalog, courseRoute, groups } from './catalog';
import { courseAccess, courseEligibility } from './store';
import { CourseProblem } from './ui';
import StudyInfo from './StudyInfo';
const icons = [BookOpen, Film, LayoutTemplate, ShieldCheck];
export default function CourseContentPage() {
  const { snapshot, active } = useCourseSession();
  const [info, setInfo] = useState(false);
  if (!snapshot.data) return <CourseProblem />;
  const state = snapshot.data, access = courseAccess(state, active), eligibility = courseEligibility(state);
  const group = state.assignment ? groups[state.assignment.group] : null;
  return <section className="content-hub course-hub course-hub--compact" aria-labelledby="course-hub-title">
    <div className="course-hub-heading"><div><h1 id="course-hub-title">الموديولات التعليمية</h1><p>اختر موديولًا لاستعراض أهدافه</p></div><Button variant="secondary" onClick={() => setInfo(true)} aria-haspopup="dialog"><Info size={17} aria-hidden="true" /><span>معلومات المسار</span></Button></div>
    <div className="course-hub-status">{group ? <span>{group.label} · {group.styleLabel} · {group.supportLabel}</span> : <><span>{!active ? 'استعرض الدروس، وابدأ التجربة لفتح المحتوى.' : eligibility !== 'eligible' ? 'أكمل التقويم القبلي لفتح مسارك.' : 'حدد مجموعتك باختبار أسلوب التعلم.'}</span><Link to={access.route}>{!active ? 'بدء التجربة' : eligibility !== 'eligible' ? 'التقويم القبلي' : 'أسلوب التعلم'}</Link></>}</div>
    <div className="reference-module-list" role="region" aria-label="الموديولات التدريبية">{courseCatalog.modules.map((module, i) => {
      const Icon = icons[i] ?? BookOpen;
      return <Link className="reference-module-card" key={module.id} to={courseRoute(module.id)}>
        <span className="reference-module-symbol"><Icon size={25} aria-hidden="true" /></span>
        <div className="reference-module-info"><span>الموديول {module.order}</span><h2>{module.title}</h2><p>{module.lessons.length} دروس</p></div>
        <span className="reference-module-arrow"><ArrowLeft size={18} aria-hidden="true" /></span>
      </Link>;
    })}</div>
    <Drawer open={info} onClose={() => setInfo(false)} title="معلومات المسار التدريبي" className="course-info-dialog">
      <nav className="course-path" aria-label="خطوات المسار"><Link to="/assessment/pre/instructions" onClick={() => setInfo(false)} aria-current={eligibility === 'not-assessed' ? 'step' : undefined}><span>1</span>التقويم القبلي</Link><Link to="/learning-style" onClick={() => setInfo(false)} aria-current={eligibility === 'eligible' && !group ? 'step' : undefined}><span>2</span>الأسلوب المعرفي ونمط الدعم</Link><Link to="/content" onClick={() => setInfo(false)} aria-current={group ? 'step' : undefined}><span>3</span>الموديولات والأنشطة</Link><Link to="/assessment/post/instructions" onClick={() => setInfo(false)}><span>4</span>التقويم البعدي</Link></nav>
      {group && <div className="course-assignment"><strong>{group.label} — {group.supportLabel}</strong><span>{group.styleLabel} · درجة الأشكال {state.assignment!.score} / 18</span></div>}
      <StudyInfo selected={state.assignment?.group} />
      <p>التوزيع والحفظ محليان على هذا الجهاز في نسخة العرض.</p>
      {!access.allowed && <><p>{access.reason} يمكنك استعراض أسماء الدروس قبل البدء.</p><ButtonLink to={access.route}>الانتقال إلى الخطوة المطلوبة</ButtonLink></>}
      <p>هنا يظهر وصف المسار ومحتويات الموديولات الأربعة.</p>
    </Drawer>
  </section>;
}
