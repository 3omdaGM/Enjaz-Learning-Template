import { useLocation, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, BookOpen, CircleHelp, ClipboardList, Mail, MapPin, Monitor, Phone, Rocket, Target } from 'lucide-react';
import { environmentGoals, modules } from '../data/catalog';
import { courseGuideSteps as guideSteps } from '../course/catalog';
import { ButtonLink, Card, PageHeading, ProgressIndicator, StatusBadge } from '../components/ui';

export function NotFound() {
  return <div className="not-found"><p className="eyebrow">٤٠٤ — الصفحة غير موجودة</p><CircleHelp size={52} aria-hidden="true" /><h1>لم نعثر على هذه الصفحة</h1><p>قد يكون الرابط غير صحيح أو لا ينتمي العنصر إلى هذا الدرس.</p><ButtonLink to="/content">العودة إلى المحتوى التعليمي <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div>;
}

function GoalsPage() {
  const { moduleId } = useParams();
  if (moduleId && !modules.some(module => module.id === moduleId)) return <NotFound />;
  const icons = [BookOpen, ClipboardList, Monitor, Rocket];
  return <section className="environment-goals" aria-labelledby="goals-title">
    <div className="environment-goals-heading"><p className="eyebrow"><Target size={16} aria-hidden="true" />أهداف البيئة التعليمية</p><h1 id="goals-title">ماذا ستتعلم من هذه البيئة؟</h1></div>
    <div className="environment-goals-grid">{environmentGoals.map((goal, index) => {
      const Icon = icons[index]!;
      return <Card key={goal} className="environment-goal"><span className="environment-goal-number">{['١', '٢', '٣', '٤'][index]}</span><div><Icon size={22} aria-hidden="true" /><h2>{goal}</h2></div></Card>;
    })}</div>
  </section>;
}

function GuidePage() {
  const [search, setSearch] = useSearchParams();
  const raw = Number(search.get('step') ?? '1');
  const index = Number.isInteger(raw) && raw >= 1 && raw <= guideSteps.length ? raw - 1 : 0;
  const step = guideSteps[index]!;
  return <section className="guide-page"><PageHeading title="دليل المتدرب" />
    <Card className="guide-card"><div className="guide-steps" aria-label="موضوعات الدليل">{guideSteps.map((item, i) => <button key={item.title} onClick={() => setSearch({ step: String(i + 1) })} aria-current={index === i ? 'step' : undefined}>{item.title}</button>)}</div>
      <p className="guide-number-hint">اضغط على عنوان الموضوع لعرض إرشاداته؛ مثل «التقويم القبلي» أو «الموديولات والدروس».</p>
      <div className="guide-body"><p className="eyebrow">الخطوة {index + 1} من {guideSteps.length}</p><h2>{step.title}</h2><p>{step.text}</p></div><div className="guide-progress"><ProgressIndicator value={index + 1} max={guideSteps.length} label="تقدم قراءة الدليل" /></div></Card></section>;
}

function ContactPage() {
  return <><PageHeading title="اتصل بنا" /><Card className="contact-card"><div className="contact-heading"><h2>هنا يظهر اسم الباحث / الباحثة</h2><StatusBadge>بيانات مؤقتة</StatusBadge></div><ul className="contact-list"><li><Mail size={21} aria-hidden="true" /><div><span>البريد الإلكتروني المؤقت</span><bdi>هنا يظهر البريد الإلكتروني</bdi></div></li><li><Phone size={21} aria-hidden="true" /><div><span>رقم الهاتف</span><strong>هنا يظهر رقم التواصل</strong></div></li><li><MapPin size={21} aria-hidden="true" /><div><span>جهة الدراسة</span><strong>هنا تظهر الكلية والجامعة</strong></div></li></ul><p className="quiet-note">وسائل الاتصال المعروضة غير مفعلة. لا توجد خدمة إرسال رسائل في هذه النسخة.</p></Card></>;
}

export default function UtilityPages() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/goals')) return <GoalsPage />;
  if (pathname === '/guide') return <GuidePage />;
  if (pathname === '/contact') return <ContactPage />;
  return <NotFound />;
}
