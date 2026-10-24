import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTraining } from '../state/training-context';
import { Button, Card, PageHeading } from '../components/ui';
import { StorageProblem } from '../components/TrainingGuard';

function formSchema(registering: boolean, recovering: boolean) {
  return z.object({ name: z.string().max(80, 'استخدم اسمًا مستعارًا لا يتجاوز 80 حرفًا.'), email: z.string().trim().email('أدخل بريدًا تجريبيًا صحيحًا.').refine(value => value.toLowerCase().endsWith('@example.com'), 'استخدم عنوانًا تجريبيًا ينتهي بـ @example.com، لا بريدك الحقيقي.'), code: z.string(), confirmation: z.string(), consent: z.boolean() }).superRefine((value, ctx) => {
    if (registering && value.name.trim().length < 2) ctx.addIssue({ code: 'custom', path: ['name'], message: 'اكتب اسمًا مستعارًا من حرفين على الأقل.' });
    if (!recovering && value.code !== 'DEMO') ctx.addIssue({ code: 'custom', path: ['code'], message: 'الرمز التجريبي المعلن هو DEMO. لا تدخل كلمة مرور حقيقية.' });
    if (registering && value.confirmation !== value.code) ctx.addIssue({ code: 'custom', path: ['confirmation'], message: 'أعد كتابة الرمز التجريبي DEMO نفسه.' });
    if (registering && !value.consent) ctx.addIssue({ code: 'custom', path: ['consent'], message: 'أكد اطلاعك على حدود التجربة المحلية.' });
  });
}
export default function AccountPage() {
  const { pathname } = useLocation(), navigate = useNavigate();
  const registering = pathname === '/register', recovering = pathname === '/recover';
  const { adapter, snapshot } = useTraining();
  const [message, setMessage] = useState('');
  const schema = formSchema(registering, recovering);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: '', email: 'demo@example.com', code: '', confirmation: '', consent: false } });
  if (!snapshot.data) return <StorageProblem />;
  const title = recovering ? 'استعادة الدخول التجريبي' : registering ? 'تسجيل تجربة جديدة' : 'دخول المتدرب';
  return <><PageHeading title={title} />
    <Card className={`account-card${registering ? ' account-card--register' : ''}`}><p>تجربة محلية: بريد بـ <bdi>@example.com</bdi> ورمز <bdi>DEMO</bdi>؛لا يُحفظان.</p>
      <form className="account-form" noValidate onSubmit={handleSubmit(async values => {
        if (recovering) { setMessage('لم يُرسل أي بريد. لا توجد خدمة استعادة حقيقية؛ يمكنك بدء التجربة بالرمز المعلن DEMO مع بقاء التقدم المحلي السابق.'); return; }
        const result = await adapter.execute({ type: 'login', name: registering ? values.name.trim() : snapshot.data?.learner.name ?? 'متدرب تجريبي' });
        if (result.ok) navigate('/content'); else setMessage(result.error);
      })}>
        {registering && <div className="form-field"><label htmlFor="demo-name">اسم مستعار للتجربة</label><input id="demo-name" autoComplete="off" {...register('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />{errors.name && <p role="alert" id="name-error">{errors.name.message}</p>}</div>}
        <div className="form-field"><label htmlFor="demo-email">البريد التجريبي</label><input id="demo-email" dir="ltr" type="email" autoComplete="off" {...register('email')} aria-invalid={!!errors.email} aria-describedby="email-help email-error" /><small id="email-help" className="sr-only">مثال: demo@example.com — لا تستخدم بيانات اتصال حقيقية.</small><p id="email-error" role={errors.email ? 'alert' : undefined}>{errors.email?.message}</p></div>
        {!recovering && <div className="form-field"><label htmlFor="demo-code">الرمز التجريبي<span className="sr-only"> المعلن — DEMO</span></label><input id="demo-code" type="text" dir="ltr" autoComplete="off" {...register('code')} aria-invalid={!!errors.code} aria-describedby="code-help code-error" /><small id="code-help" className="sr-only">ليس كلمة مرور؛ اكتب DEMO فقط.</small><p id="code-error" role={errors.code ? 'alert' : undefined}>{errors.code?.message}</p></div>}
        {registering && <><div className="form-field"><label htmlFor="demo-confirm">تأكيد الرمز<span className="sr-only"> التجريبي</span></label><input id="demo-confirm" type="text" dir="ltr" autoComplete="off" {...register('confirmation')} aria-invalid={!!errors.confirmation} aria-describedby="confirmation-error" /><p id="confirmation-error" role={errors.confirmation ? 'alert' : undefined}>{errors.confirmation?.message}</p></div><label className="checkbox-label"><input type="checkbox" {...register('consent')} aria-invalid={!!errors.consent} aria-describedby="consent-error" />أفهم أن هذه تجربة محلية وليست حسابًا حقيقيًا.</label><p id="consent-error" role={errors.consent ? 'alert' : undefined}>{errors.consent?.message}</p></>}
        <Button type="submit" disabled={isSubmitting}>{recovering ? 'عرض إرشادات الاستعادة' : 'تجربة بحساب تجريبي'}</Button>
      </form>
      {message && <p role="status" className="notice">{message}</p>}
      <div className="account-links"><Link to="/login">الدخول</Link><Link to="/register">التسجيل</Link><Link to="/recover">استعادة الدخول</Link></div>
    </Card></>;
}
