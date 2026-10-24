import { groups } from './catalog';
import study from './study.json' with { type: 'json' };

export default function StudyInfo({ selected }: { selected?: keyof typeof groups | undefined }) {
  return <section className="support-study-info" aria-label="أساليب التعلم وأنماط الدعم">
    <p>{study.styleExplanation}</p>
    <dl className="support-study-definitions"><div><dt>الدعم الثابت</dt><dd>{study.fixedExplanation}</dd></div><div><dt>الدعم المرن</dt><dd>{study.flexExplanation}</dd></div></dl>
    <h3>المجموعات الأربع</h3>
    <ul className="support-study-groups">{Object.entries(groups).map(([id, group]) => <li key={id} className={selected === id ? 'is-selected' : ''}><strong>{group.label}{selected === id && ' — مجموعتك'}</strong><span>{group.styleLabel} · {group.supportLabel}</span></li>)}</ul>
    <p>{study.timingExplanation}</p>
  </section>;
}
