import { expect, it } from 'vitest';
import data from './content.json' with { type: 'json' };
it('contains only placeholder identity, curriculum, questions and support', () => {
 expect(data.modules.map(m => m.lessons.length)).toEqual([7,3,3,3]);
 expect(data.people.every(p => p.displayName.startsWith('هنا يظهر'))).toBe(true);
 expect(data.identity.title).toBe('هنا يظهر عنوان البيئة التعليمية');
 const ids: string[] = [];
 for (const module of data.modules) {
  expect(module.title).toBe(`الموديول ${module.order}`); expect(module.objectives.every(s => s.startsWith('هنا يظهر'))).toBe(true); ids.push(module.id);
  for (const lesson of module.lessons) {
   ids.push(lesson.id); expect(lesson.title).toBe(`الدرس ${lesson.order}`);
   expect(lesson.sections.content.stages.every(s => s.body.includes('هنا يظهر'))).toBe(true);
   expect(lesson.sections.content.support.every(s => s.startsWith('هنا يظهر'))).toBe(true);
  }
 }
 expect(new Set(ids).size).toBe(ids.length);
 for (const bank of Object.values(data.exams)) { expect(bank).toHaveLength(6); for (const q of bank) { expect(q.prompt.startsWith('هنا يظهر')).toBe(true); expect(q.options).toHaveLength(q.type === 'mcq' ? 4 : 2); expect(q.correct).toBe(0); } }
 expect(JSON.stringify(data)).not.toMatch(/https?:|@|\.docx|\.png|\.jpg/);
});
