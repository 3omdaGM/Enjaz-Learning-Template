import { z } from 'zod';
import { courseCatalog, courseLesson, groups } from './catalog';
import { embeddedFigures } from './embedded-figures';
export const COURSE_STORAGE_KEY = 'enjaz-template-course:v1';
const pointSchema = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).strict();
export type Point = z.infer<typeof pointSchema>;
const attemptSchema = z.object({ id: z.string(), kind: z.enum(['pre', 'post']), answers: z.record(z.string(), z.number().int().nonnegative()), position: z.number().int().nonnegative(), startedAt: z.number(), deadline: z.number(), submittedAt: z.number().nullable(), score: z.number().int().nonnegative().nullable() }).strict();
const styleSchema = z.object({ id: z.string(), position: z.number().int().min(0).max(24), answers: z.array(z.boolean().nullable()).length(25), deadline: z.number().nullable(), paused: z.boolean(), completedAt: z.number().nullable(), score: z.number().int().min(0).max(18).nullable() }).strict();
const stateSchema = z.object({ schemaVersion: z.literal(1), contentVersion: z.literal('template-1.0.0'), revision: z.number().int().nonnegative(), attempts: z.array(attemptSchema), styleAttempts: z.array(styleSchema), assignment: z.object({ group: z.enum(['g1', 'g2', 'g3', 'g4']), styleAttemptId: z.string(), score: z.number().int().min(1).max(17), assignedAt: z.number() }).strict().nullable(), counters: z.object({ dependent: z.number().int().nonnegative(), independent: z.number().int().nonnegative() }).strict(), activityDrafts: z.record(z.string(), z.string()), activitySubmissions: z.array(z.object({ id: z.string(), lessonId: z.string(), text: z.string().min(1).max(20000), submittedAt: z.number() }).strict()) }).strict();
export type CourseState = z.infer<typeof stateSchema>;
export type CourseAttempt = z.infer<typeof attemptSchema>;
export type StyleAttempt = z.infer<typeof styleSchema>;
export const freshCourse = (): CourseState => ({ schemaVersion: 1, contentVersion: 'template-1.0.0', revision: 0, attempts: [], styleAttempts: [], assignment: null, counters: { dependent: 0, independent: 0 }, activityDrafts: {}, activitySubmissions: [] });
export function courseEligibility(state: CourseState) {
  const first = state.attempts.find(a => a.kind === 'pre' && a.submittedAt !== null);
  return !first ? 'not-assessed' : first.score! * 2 <= courseCatalog.exams.pre.length ? 'eligible' : 'ineligible';
}
export function courseAccess(state: CourseState, active: boolean) {
  if (!active) return { allowed: false, reason: 'ابدأ التجربة بحساب تجريبي أولًا.', route: '/login' };
  if (courseEligibility(state) === 'not-assessed') return { allowed: false, reason: 'سلّم التقويم القبلي أولًا لفتح المسار.', route: '/assessment/pre/instructions' };
  if (courseEligibility(state) === 'ineligible') return { allowed: false, reason: 'وفق شروط المشاركة، نسبة أول قبلي أعلى من 50%؛ لا يتاح المسار التدريبي.', route: '/assessment/pre/instructions' };
  if (!state.assignment) return { allowed: false, reason: 'أكمل اختبار أسلوب التعلم لتحديد مجموعتك ونمط الدعم.', route: '/learning-style' };
  return { allowed: true, reason: '', route: '/content' };
}
export function scoreExam(attempt: Pick<CourseAttempt, 'kind' | 'answers'>) {
  const qs = courseCatalog.exams[attempt.kind];
  for (const [id, option] of Object.entries(attempt.answers)) if (!qs.some(q => q.id === id && Number.isInteger(option) && option >= 0 && option < q.options.length)) throw new Error('إجابة لا تنتمي إلى التقويم.');
  return qs.filter(q => attempt.answers[q.id] === q.correct).length;
}
export function classifyStyle(score: number) { return score > 0 && score < 9 ? 'dependent' : score >= 9 && score < 18 ? 'independent' : null; }
export function gradeDrawing(index: number, path: Point[]) {
  if (!Number.isInteger(index) || !embeddedFigures[index]) throw new Error('الشكل غير موجود.');
  z.array(pointSchema).max(10000).parse(path);
  if (path.length < 10) return false;
  const box = (ps: Point[]) => ({ minX: Math.min(...ps.map(p => p.x)), maxX: Math.max(...ps.map(p => p.x)), minY: Math.min(...ps.map(p => p.y)), maxY: Math.max(...ps.map(p => p.y)) });
  const a = box(embeddedFigures[index]!.ans), u = box(path), uw = u.maxX - u.minX, uh = u.maxY - u.minY, aw = a.maxX - a.minX, ah = a.maxY - a.minY;
  const inter = Math.max(0, Math.min(a.maxX, u.maxX) - Math.max(a.minX, u.minX)) * Math.max(0, Math.min(a.maxY, u.maxY) - Math.max(a.minY, u.minY));
  const union = aw * ah + uw * uh - inter, iou = union > 0 ? inter / union : 0;
  const size = Math.min(uw / Math.max(aw, 1 / 420), aw / Math.max(uw, 1 / 420)) * Math.min(uh / Math.max(ah, 1 / 420), ah / Math.max(uh, 1 / 420));
  const center = Math.hypot((u.minX + u.maxX - a.minX - a.maxX) / 2, (u.minY + u.maxY - a.minY - a.maxY) / 2) / Math.max(aw, ah, 1 / 420);
  return iou > .5 && size > .4 && center < .5;
}
function styleScore(a: StyleAttempt) { return a.answers.slice(7).filter(Boolean).length; }
export function parseCourse(raw: string): CourseState {
  const state = stateSchema.parse(JSON.parse(raw));
  if (new Set(state.attempts.map(a => a.id)).size !== state.attempts.length || new Set(state.styleAttempts.map(a => a.id)).size !== state.styleAttempts.length) throw new Error('معرفات محاولات مكررة.');
  for (const a of state.attempts) {
    if (a.position >= courseCatalog.exams[a.kind].length || a.deadline !== a.startedAt + 90 * 60000 || (a.submittedAt === null) !== (a.score === null)) throw new Error('محاولة محفوظة غير صالحة.');
    const score = scoreExam(a); if (a.score !== null && a.score !== score) throw new Error('درجة محفوظة غير صالحة.');
    if (a.kind === 'post' && a.submittedAt !== null && a.submittedAt < a.deadline && Object.keys(a.answers).length < 5) throw new Error('محاولة بعدية أقل من الحد الأدنى.');
  }
  for (const a of state.styleAttempts) {
    if (courseEligibility(state) !== 'eligible' || (a.completedAt === null) !== (a.score === null)) throw new Error('نتيجة الأشكال غير صالحة.');
    if (a.answers.some((answer, i) => i < a.position ? answer === null : i > a.position && answer !== null)) throw new Error('ترتيب إجابات الأشكال غير صالح.');
    if (a.completedAt !== null && (a.position !== 24 || a.answers.some(v => v === null) || a.score !== styleScore(a) || a.deadline !== null || a.paused)) throw new Error('نتيجة الأشكال غير صالحة.');
    if (a.completedAt === null && (a.paused ? ![7,16].includes(a.position) || a.deadline !== null || a.answers[a.position] !== null : a.deadline === null)) throw new Error('وقت قسم الأشكال غير صالح.');
  }
  if (state.attempts.some(a => a.kind === 'post') && courseEligibility(state) !== 'eligible') throw new Error('تقدم بعدي دون تأهل.');
  if ((state.activitySubmissions.length || Object.keys(state.activityDrafts).length) && !state.assignment) throw new Error('نشاط دون مجموعة.');
  if (state.assignment) {
    const a = state.styleAttempts.find(a => a.id === state.assignment!.styleAttemptId);
    const classification = groups[state.assignment.group].classification;
    const support = state.counters[classification] % 2 ? 'fixed' : 'flex';
    if (support !== groups[state.assignment.group].support || state.counters[classification] < 1) throw new Error('توزيع دعم غير صالح.');
    if (!a || a.completedAt === null || a.score !== state.assignment.score || classifyStyle(a.score!) !== groups[state.assignment.group].classification || courseEligibility(state) !== 'eligible') throw new Error('توزيع محفوظ غير صالح.');
  }
  for (const [id, text] of Object.entries(state.activityDrafts)) if (!courseLesson(id) || text.length > 20000) throw new Error('مسودة نشاط غير صالحة.');
  for (const a of state.activitySubmissions) if (!courseLesson(a.lessonId)) throw new Error('نشاط محفوظ غير صالح.');
  return state;
}
export type CourseCommand = { type: 'start-exam'; kind: 'pre' | 'post' } | { type: 'answer-exam'; id: string; questionId: string; option: number } | { type: 'position-exam'; id: string; position: number } | { type: 'submit-exam'; id: string } | { type: 'start-style' } | { type: 'answer-style'; id: string; path: Point[] } | { type: 'next-style'; id: string } | { type: 'resume-style'; id: string } | { type: 'expire-style'; id: string } | { type: 'activity-draft'; lessonId: string; text: string } | { type: 'submit-activity'; lessonId: string };
export function reduceCourse(state: CourseState, command: CourseCommand, active: boolean, now: number, id: string): { state: CourseState; id?: string } {
  if (!active) throw new Error('ابدأ تجربة دخول أولًا.');
  const next = structuredClone(state); let resultId: string | undefined;
  const requireEligible = () => { if (courseEligibility(state) !== 'eligible') throw new Error('يتطلب التأهل بالتقويم القبلي أولًا.'); };
  const finishStyle = (a: StyleAttempt) => {
    a.score = styleScore(a); a.completedAt = now; a.deadline = null; a.paused = false;
    const classification = classifyStyle(a.score);
    if (classification && !next.assignment) {
      const count = ++next.counters[classification], support = count % 2 ? 'fixed' : 'flex';
      const group = classification === 'dependent' ? support === 'fixed' ? 'g1' : 'g3' : support === 'fixed' ? 'g2' : 'g4';
      next.assignment = { group, styleAttemptId: a.id, score: a.score, assignedAt: now };
    }
  };
  if (command.type === 'start-exam') {
    if (command.kind === 'post') requireEligible();
    const draft = next.attempts.find(a => a.kind === command.kind && a.submittedAt === null);
    if (draft) return { state, id: draft.id };
    next.attempts.push({ id, kind: command.kind, answers: {}, position: 0, startedAt: now, deadline: now + 90 * 60000, score: null, submittedAt: null }); resultId = id;
  } else if (command.type === 'start-style') {
    requireEligible();
    if (next.assignment) throw new Error('تم تحديد مجموعتك؛ تبقى محفوظة.');
    const draft = next.styleAttempts.find(a => a.completedAt === null);
    if (draft) return { state, id: draft.id };
    next.styleAttempts.push({ id, position: 0, answers: Array<boolean | null>(25).fill(null), deadline: now + 120000, paused: false, completedAt: null, score: null }); resultId = id;
  } else if (['answer-style', 'next-style', 'resume-style', 'expire-style'].includes(command.type) && 'id' in command) {
    requireEligible(); const a = next.styleAttempts.find(a => a.id === command.id); if (!a || a.completedAt !== null) throw new Error('المحاولة غير متاحة.');
    if (command.type === 'answer-style') {
      if (a.paused || a.deadline === null || now >= a.deadline || a.answers[a.position] !== null) throw new Error('انتهى وقت السؤال أو تم تأكيده.');
      if (command.path.length < 10) throw new Error('ارسم حدود الشكل أولًا.'); a.answers[a.position] = gradeDrawing(a.position, command.path);
    } else if (command.type === 'resume-style') {
      if (!a.paused) throw new Error('القسم يعمل بالفعل.'); a.paused = false; a.deadline = now + (a.position < 7 ? 120000 : 300000);
    } else {
      if (command.type === 'expire-style') {
        if (a.paused || a.deadline === null || now < a.deadline) throw new Error('لم ينته وقت القسم.');
        if (a.answers[a.position] !== null) return { state };
        a.answers[a.position] = false;
      } else if (command.type === 'next-style') {
        if (a.answers[a.position] === null) throw new Error('أكد الإجابة أولًا.');
        if (a.position === 24) finishStyle(a); else { a.position++; if (a.position === 7 || a.position === 16) { a.paused = true; a.deadline = null; } }
      }
    }
  } else if (command.type === 'activity-draft' || command.type === 'submit-activity') {
    const access = courseAccess(state, active); if (!access.allowed) throw new Error(access.reason);
    if (!courseLesson(command.lessonId)) throw new Error('الدرس غير موجود.');
    if (command.type === 'activity-draft') { if (command.text.length > 20000) throw new Error('الحد الأقصى 20000 حرف.'); next.activityDrafts[command.lessonId] = command.text; }
    else { const text = next.activityDrafts[command.lessonId]?.trim(); if (!text) throw new Error('اكتب إجابتك قبل التسليم.'); const latest = next.activitySubmissions.filter(a => a.lessonId === command.lessonId).at(-1); if (latest?.text === text) return { state }; next.activitySubmissions.push({ id, lessonId: command.lessonId, text, submittedAt: now }); }
  } else if ('id' in command) {
    const a = next.attempts.find(a => a.id === command.id); if (!a) throw new Error('المحاولة غير موجودة.');
    if (command.type === 'submit-exam' && a.submittedAt !== null) return { state, id: a.id };
    if (a.submittedAt !== null) throw new Error('لا يمكن تعديل محاولة مسلّمة.');
    if (a.kind === 'post') requireEligible();
    if (command.type !== 'submit-exam' && now >= a.deadline) throw new Error('انتهى وقت المحاولة؛ سلّمها أولًا.');
    if (command.type === 'answer-exam') { const q = courseCatalog.exams[a.kind].find(q => q.id === command.questionId); if (!q || !Number.isInteger(command.option) || command.option < 0 || command.option >= q.options.length) throw new Error('اختيار غير صالح.'); a.answers[q.id] = command.option; }
    else if (command.type === 'position-exam') { if (!Number.isInteger(command.position) || command.position < 0 || command.position >= courseCatalog.exams[a.kind].length) throw new Error('موضع سؤال غير صالح.'); a.position = command.position; }
    else if (command.type === 'submit-exam') { if (a.kind === 'post' && now < a.deadline && Object.keys(a.answers).length < 5) throw new Error('أجب عن 5 أسئلة على الأقل قبل التسليم.'); a.score = scoreExam(a); a.submittedAt = now; }
  }
  next.revision++; parseCourse(JSON.stringify(next)); return resultId ? { state: next, id: resultId } : { state: next };
}
export interface CourseStorage { read(): string | null; write(raw: string): void; }
export interface CourseSnapshot { data: CourseState | null; error: string | null; }
export class CourseStore {
  private snapshot: CourseSnapshot; private raw: string | null = null; private listeners = new Set<() => void>();
  constructor(private storage: CourseStorage, private now = () => Date.now(), private id: () => string = () => crypto.randomUUID()) { this.snapshot = { data: null, error: null }; this.reload(); }
  getSnapshot = () => this.snapshot;
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private emit() { this.listeners.forEach(fn => fn()); }
  reload = () => { try { this.raw = this.storage.read(); this.snapshot = { data: this.raw === null ? freshCourse() : parseCourse(this.raw), error: null }; } catch { this.snapshot = { data: null, error: 'تعذر استعادة بيانات القالب؛ بقيت البيانات محفوظة دون حذف. أعد المحاولة أو استخدم أدوات العرض للاستعادة.' }; } this.emit(); };
  execute = (command: CourseCommand, active: boolean): { ok: true; id?: string } | { ok: false; error: string } => {
    try {
      if (!this.snapshot.data) throw new Error('تعذر استعادة البيانات.');
      if (this.storage.read() !== this.raw) throw new Error('تغيرت البيانات في تبويب آخر؛ أعد تحميل الحالة قبل المتابعة.');
      const result = reduceCourse(this.snapshot.data, command, active, this.now(), this.id());
      if (result.state !== this.snapshot.data) { const raw = JSON.stringify(result.state); this.storage.write(raw); this.raw = raw; this.snapshot = { data: result.state, error: null }; this.emit(); }
      return result.id ? { ok: true, id: result.id } : { ok: true };
    } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'تعذر حفظ التغيير.' }; }
  };
  replaceForDemo = (state: CourseState) => {
    if (!__DEMO_TOOLS_ENABLED__) return { ok: false, error: 'أدوات العرض غير متاحة.' };
    try { const next = parseCourse(JSON.stringify(state)); this.storage.write(JSON.stringify(next)); this.reload(); return { ok: true }; } catch { return { ok: false, error: 'تعذر حفظ حالة العرض؛ لم تُعلن الاستعادة.' }; }
  };
}
