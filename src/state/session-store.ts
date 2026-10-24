import { z } from 'zod';
export const SESSION_STORAGE_KEY = 'enjaz-template-session:v1';
const schema = z.object({ schemaVersion: z.literal(1), revision: z.number().int().nonnegative(), learner: z.object({ active: z.boolean(), name: z.string().min(1).max(80) }).strict() }).strict();
export type SessionData = z.infer<typeof schema>;
interface Snapshot { data: SessionData | null; error: string | null; }
interface Storage { read(): string | null; write(raw: string): void; }
export class SessionStore {
 private raw: string | null = null;
 private snapshot: Snapshot = { data: null, error: null };
 private listeners = new Set<() => void>();
 constructor(private storage: Storage) { this.reload(); }
 getSnapshot = () => this.snapshot;
 subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
 private emit() { this.listeners.forEach(listener => listener()); }
 reload = () => {
  try { this.raw = this.storage.read(); this.snapshot = { data: this.raw === null ? { schemaVersion: 1, revision: 0, learner: { active: false, name: 'متدرب تجريبي' } } : schema.parse(JSON.parse(this.raw)), error: null }; }
  catch { this.snapshot = { data: null, error: 'تعذر قراءة بيانات الدخول المحلية؛ لم تُحذف البيانات.' }; }
  this.emit();
 };
 execute = async (command: { type: 'login'; name: string } | { type: 'logout' }): Promise<{ ok: true } | { ok: false; error: string }> => {
  try {
   if (!this.snapshot.data) throw new Error('تعذر استعادة بيانات الدخول.');
   if (this.storage.read() !== this.raw) throw new Error('تغيرت بيانات الدخول في تبويب آخر؛ أعد التحميل.');
   const next = schema.parse({ ...this.snapshot.data, revision: this.snapshot.data.revision + 1, learner: command.type === 'login' ? { active: true, name: command.name.trim() } : { ...this.snapshot.data.learner, active: false } });
   const raw = JSON.stringify(next); this.storage.write(raw); this.raw = raw; this.snapshot = { data: next, error: null }; this.emit(); return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'تعذر حفظ الدخول.' }; }
 };
}
