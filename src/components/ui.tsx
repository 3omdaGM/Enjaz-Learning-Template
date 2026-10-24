import { useEffect, useId, useRef } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Check, ChevronLeft, Info, LockKeyhole, X } from 'lucide-react';

export function Button({ className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return <button className={`button button--${variant} ${className}`} {...props} />;
}
export function ButtonLink({ to, children, variant = 'primary', className = '' }: { to: string; children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; className?: string }) {
  return <Link to={to} className={`button button--${variant} ${className}`}>{children}</Link>;
}
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props} />;
}
export function StatusBadge({ tone = 'neutral', children }: { tone?: 'neutral' | 'locked' | 'available' | 'complete'; children: ReactNode }) {
  const Icon = tone === 'locked' ? LockKeyhole : tone === 'complete' ? Check : Info;
  return <span className={`status status--${tone}`}><Icon size={13} aria-hidden="true" />{children}</span>;
}
export function PageHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="page-heading">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{children && <p className="page-description">{children}</p>}</div>;
}
export function Breadcrumbs({ items }: { items: readonly { label: string; to?: string }[] }) {
  return <nav aria-label="مسار الصفحة" className="breadcrumbs"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>
    {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
    {index < items.length - 1 && <ChevronLeft size={13} aria-hidden="true" />}
  </li>)}</ol></nav>;
}
export function ProgressIndicator({ value, max, label }: { value: number; max: number; label: string }) {
  const safeMax = Math.max(1, max);
  return <div className="progress-indicator"><div className="progress-label"><span>{label}</span><b dir="ltr">{value} / {max}</b></div>
    <progress value={value} max={safeMax} aria-label={label}>{Math.round(value / safeMax * 100)}%</progress></div>;
}
export function PreviewNotice() {
  return <div className="notice"><Info size={18} aria-hidden="true" /><p><strong>نسخة تدريب تجريبية.</strong> تُحفظ المحاولات والتقدم محليًا في هذا المتصفح على الجهاز نفسه، وليست حسابًا حقيقيًا أو بيانات دراسة معتمدة. حذف بيانات المتصفح يفقد التجربة.</p></div>;
}
export function Preparation({ title = 'قيد التجهيز', children, action = 'بدء التقويم' }: { title?: string; children: ReactNode; action?: string }) {
  const id = useId();
  return <Card className="preparation"><div className="icon-tile"><LockKeyhole size={28} /></div><h2>{title}</h2><p id={id}>{children}</p>
    <Button disabled aria-describedby={id}>{action}<LockKeyhole size={16} aria-hidden="true" /></Button>
    <Link to="/content" className="text-link">العودة إلى المسار التدريبي <ArrowLeft size={16} aria-hidden="true" /></Link></Card>;
}
export function Drawer({ open, onClose, title, children, className = '' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
    return () => { if (dialog?.open) dialog.close(); };
  }, [open]);
  return <dialog ref={ref} aria-labelledby={id} className={`drawer ${className}`} onClose={onClose}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="drawer-inner"><div className="drawer-header"><h2 id={id}>{title}</h2><Button variant="ghost" onClick={onClose} aria-label={`إغلاق ${title}`} autoFocus><X size={22} /></Button></div>{children}</div>
  </dialog>;
}
