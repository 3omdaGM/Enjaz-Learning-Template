import { useCourseSession } from './hooks';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Maximize2 } from 'lucide-react';
import { Button, Drawer } from '../components/ui';
import { NotFound } from '../pages/UtilityPages';
import { courseCatalog, groups } from './catalog';
import type { CourseLesson, CourseSection, CourseStage } from './catalog';
import { CourseCard, CourseGuard, CourseHtml, CourseProblem } from './ui';
import Workspace from './Workspace';
import Support from './Support';
import LessonFlow from './LessonFlow';
function youtube(url: string) { try { const u = new URL(url); const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : u.hostname.endsWith('youtube.com') ? u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : u.searchParams.get('v') : null; return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null; } catch { return null; } }
function stages(section: CourseSection): CourseStage[] {
  if (section.stages) return section.stages;
  return (section.content ?? '').split(/(?=<h4>)/).filter(s => s.trim()).map((raw, i) => { const m = raw.match(/^\s*<h4>([\s\S]*?)<\/h4>/); return { title: m?.[1]?.replace(/<[^>]+>/g, '').trim() ?? `المحتوى ${i + 1}`, body: m ? raw.slice(raw.indexOf('</h4>') + 5) : raw }; });
}
function LessonContent({ lesson, section }: { lesson: CourseLesson; section: 'objectives' | 'content' | 'activity' }) {
  const { snapshot } = useCourseSession(); const [search, setSearch] = useSearchParams(); const [zoom, setZoom] = useState<string | null>(null);
  const group = groups[snapshot.data!.assignment!.group], data = lesson.sections[section];
  if (section === 'objectives') return <CourseCard title="أهداف الدرس" className="course-objectives-card"><CourseHtml raw={data.content ?? ''} /></CourseCard>;
  if (section === 'activity') return <Activity key={lesson.id} lesson={lesson} mode={group.support} />;
  const all = stages(data), rawIndex = Number(search.get('stage') ?? '0'), index = Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex < all.length ? rawIndex : 0, current = all[index];
  const videos = current?.video ? [current.video] : data.videos ? data.videos.filter(v => v.stage === undefined || v.stage === index) : data.videoSrc ? [{ title: 'الفيديو التعليمي', videoSrc: data.videoSrc, videoType: data.videoType }] : [];
  const images = (data.images ?? []).filter(image => image.stage === undefined || image.stage === index);
  return <><div className="course-stage-picker"><label htmlFor="course-stage">اختر عنوان المحتوى</label><select id="course-stage" value={index} onChange={e => setSearch({ stage: e.target.value })}>{all.map((s, i) => <option key={i} value={i}>{i + 1}. {s.title}</option>)}</select><span>{index + 1} / {all.length}</span></div><div className="workspace-reading-split course-media-split"><CourseCard title={current?.title ?? 'المحتوى'}><CourseHtml raw={current?.body ?? ''} />{current?.badge && <p>{current.badge}</p>}</CourseCard><div className="course-media-column"><Support key={`${lesson.id}-${section}`} messages={data.support} mode={group.support} /><CourseCard title="الفيديو التعليمي"><div className="template-media" role="img" aria-label="موضع الفيديو التعليمي"><span aria-hidden="true">▷</span><p>هنا يظهر الفيديو التعليمي للدرس</p></div></CourseCard><CourseCard title="الصورة التوضيحية"><div className="template-media template-media--image" role="img" aria-label="موضع الصورة التوضيحية"><p>هنا تظهر صورة أو وسيلة تعليمية</p></div></CourseCard>{videos.map((video, i) => { const src = youtube(video.videoSrc); return src ? <CourseCard key={`${index}-${i}`} title={video.title} className="course-video-card"><iframe title={video.title} src={src} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></CourseCard> : <p key={i}>رابط الفيديو غير متاح في هذه المرحلة.</p>; })}{images.map(image => <CourseCard key={image.src} title={image.caption ?? 'صورة توضيحية'} actions={<Button variant="ghost" onClick={() => setZoom(image.src)} aria-label={`تكبير: ${image.alt}`}><Maximize2 size={16} aria-hidden="true" />تكبير الصورة</Button>}><figure className="course-image" aria-label={image.caption ?? image.alt}><img src={image.src} alt={image.alt} /></figure></CourseCard>)}</div></div>{data.note && <p className="course-note">{data.note}</p>}<Drawer open={zoom !== null} onClose={() => setZoom(null)} title="تكبير الصورة التوضيحية" className="image-dialog">{zoom && <img src={zoom} alt="الصورة التوضيحية مكبرة" />}</Drawer></>;
}
function Activity({ lesson, mode }: { lesson: CourseLesson; mode: 'fixed' | 'flex' }) {
  const { snapshot, store, active } = useCourseSession(); const data = lesson.sections.activity;
  const [text, setText] = useState(snapshot.data!.activityDrafts[lesson.id] ?? ''), [error, setError] = useState('');
  const submission = snapshot.data!.activitySubmissions.filter(a => a.lessonId === lesson.id).at(-1), saved = text === (snapshot.data!.activityDrafts[lesson.id] ?? '');
  const save = (value: string) => { setText(value); const r = store.execute({ type: 'activity-draft', lessonId: lesson.id, text: value }, active); setError(r.ok ? '' : r.error); };
  return <div className="course-activity-split"><div className="course-activity-main"><CourseCard title="وصف النشاط"><p>{data.desc}</p></CourseCard><Support key={lesson.id} messages={data.support} mode={mode} /><CourseCard title="محتوى النشاط — المطلوب منك"><CourseHtml raw={data.content ?? ''} /></CourseCard><CourseCard title="إجابة الطالب"><label htmlFor="course-activity-answer" className="course-activity-label">اكتب إجابتك ثم اضغط «تسليم الإجابة». الحفظ والتسليم محليان في هذه النسخة.</label><textarea id="course-activity-answer" maxLength={20000} rows={7} value={text} onChange={e => save(e.target.value)} placeholder="اكتب إجابتك هنا..." /><p role="status">{saved ? 'حُفظت المسودة محليًا.' : 'المسودة الحالية لم تُحفظ.'}</p>{error && <div role="alert"><p>{error}</p><Button onClick={() => save(text)}>إعادة حفظ المسودة</Button></div>}<div className="course-activity-actions"><Button disabled={!text.trim() || !saved} onClick={() => { const r = store.execute({ type: 'submit-activity', lessonId: lesson.id }, active); setError(r.ok ? '' : r.error); }}>تسليم الإجابة</Button>{submission && <a className="button button--secondary" href={`data:text/plain;charset=utf-8,${encodeURIComponent(`${lesson.title}\n\n${submission.text}\n\n${new Date(submission.submittedAt).toISOString()}`)}`} download={`${lesson.id}-answer.txt`}>تنزيل الإجابة المسلّمة</a>}</div>{submission && <p className="course-submitted" role="status">حُفظ تسليم النشاط محليًا بتاريخ {new Date(submission.submittedAt).toLocaleString('ar-EG')}.{submission.text !== text && ' لديك مسودة معدّلة لم تُسلّم بعد.'}</p>}</CourseCard></div></div>;
}
export default function CourseWorkspacePage() {
  const { moduleId, lessonId, section } = useParams(); const { snapshot } = useCourseSession();
  if (!snapshot.data) return <CourseProblem />;
  const module = courseCatalog.modules.find(m => m.id === moduleId), lesson = module?.lessons.find(l => l.id === lessonId);
  if (!module || (lessonId && !lesson) || (lesson && !['objectives', 'content', 'activity'].includes(section ?? ''))) return <NotFound />;
  return <Workspace moduleId={module.id} lessonId={lesson?.id} section={section ?? 'overview'}>{lesson ? <CourseGuard><LessonContent key={`${lesson.id}:${section}`} lesson={lesson} section={section as 'objectives' | 'content' | 'activity'} /><LessonFlow moduleId={module.id} lessonId={lesson.id} section={section!} /></CourseGuard> : <CourseCard title="أهداف الموديول" className="course-module-objectives"><p className="workspace-hint">بعد إتمام هذا الموديول، يُتوقع أن يكون المتعلم قادرًا على أن:</p><ol className="course-html module-objectives-list">{module.objectives.map((objective, index) => <li key={objective} className="course-objective"><span aria-hidden="true">{index + 1}</span><p>{objective}</p></li>)}</ol></CourseCard>}</Workspace>;
}
