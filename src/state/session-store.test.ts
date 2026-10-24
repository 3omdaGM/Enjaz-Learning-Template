import { describe, expect, it } from 'vitest';
import { SessionStore, SESSION_STORAGE_KEY } from './session-store';
const memory = (raw: string | null = null) => ({ raw, fail: false, read() { return this.raw; }, write(value: string) { if (this.fail) throw new Error('quota'); this.raw = value; } });
describe('isolated showcase session', () => {
 it('stores only alias and login state, and logout preserves the alias', async () => {
  const m = memory(), s = new SessionStore(m);
  expect(SESSION_STORAGE_KEY).toBe('enjaz-template-session:v1');
  expect(await s.execute({ type: 'login', name: 'اسم مستعار' })).toEqual({ ok: true });
  expect(JSON.parse(m.raw!)).toEqual({ schemaVersion: 1, revision: 1, learner: { active: true, name: 'اسم مستعار' } });
  expect(await s.execute({ type: 'logout' })).toEqual({ ok: true });
  expect(new SessionStore(m).getSnapshot().data!.learner).toEqual({ active: false, name: 'اسم مستعار' });
 });
 it('does not announce successful login on failure or overwrite conflicting tabs', async () => {
  const m = memory(), a = new SessionStore(m), b = new SessionStore(m); m.fail = true;
  expect((await a.execute({ type: 'login', name: 'عرض' })).ok).toBe(false); expect(a.getSnapshot().data!.learner.active).toBe(false);
  m.fail = false; await a.execute({ type: 'login', name: 'عرض' });
  expect((await b.execute({ type: 'logout' })).ok).toBe(false); expect(new SessionStore(m).getSnapshot().data!.learner.active).toBe(true);
 });
 it('keeps corrupt data without silently deleting it', () => { const m = memory('bad'); expect(new SessionStore(m).getSnapshot().data).toBeNull(); expect(m.raw).toBe('bad'); });
});
