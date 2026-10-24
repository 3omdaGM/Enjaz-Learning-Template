import { embeddedFigures } from './embedded-figures';
import { freshCourse, reduceCourse } from './store';
import type { CourseCommand } from './store';
import { groups } from './catalog';
export function courseScenario(group: keyof typeof groups) {
  let s = freshCourse(), n = 0; const now = Date.parse('2026-10-18T12:00:00Z');
  const run = (c: CourseCommand) => { const r = reduceCourse(s, c, true, now, `fixture-${++n}`); s = r.state; return r.id; };
  const pre = run({ type: 'start-exam', kind: 'pre' })!; run({ type: 'submit-exam', id: pre });
  const g = groups[group]; s.counters[g.classification] = g.support === 'flex' ? 1 : 0;
  const id = run({ type: 'start-style' })!; const target = g.classification === 'dependent' ? 5 : 12;
  for (let i = 0; i < 25; i++) { if (s.styleAttempts[0]!.paused) run({ type: 'resume-style', id }); const polygon = i < 7 || i - 7 < target ? embeddedFigures[i]!.ans : [{ x: 0, y: 0 }, { x: .02, y: .02 }]; const path = polygon.flatMap((p, j) => { const next = polygon[(j + 1) % polygon.length]!; return Array.from({ length: 5 }, (_, k) => ({ x: p.x + (next.x - p.x) * k / 5, y: p.y + (next.y - p.y) * k / 5 })); }); run({ type: 'answer-style', id, path }); run({ type: 'next-style', id }); }
  return s;
}
