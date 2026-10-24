import content from '../template/content.json' with { type: 'json' };
export interface CourseVideo { title: string; videoSrc: string; videoType: string; stage?: number; }
export interface CourseImage { src: string; alt: string; caption?: string; stage?: number; }
export interface CourseStage { title: string; body: string; badge?: string; video?: CourseVideo | null; }
export interface CourseSection { content?: string; desc?: string; note: string; support: string[]; videoSrc: string; videoType: string; videos?: CourseVideo[]; images?: CourseImage[]; stages?: CourseStage[]; }
export interface CourseLesson { id: string; order: number; title: string; referenceIds?: string[]; sections: { objectives: CourseSection; content: CourseSection; activity: CourseSection }; }
export interface CourseModule { id: string; origin?: 'reference' | 'authored'; referenceOrder?: number; order: number; title: string; objectives: string[]; lessons: CourseLesson[]; }
export interface CourseQuestion { id: string; type: string; prompt: string; options: string[]; correct: number; }
export const courseCatalog: { version: string; modules: CourseModule[]; exams: Record<'pre' | 'post', CourseQuestion[]> } = content;
export const courseLesson = (id: string) => courseCatalog.modules.flatMap(m => m.lessons).find(l => l.id === id);
export const courseModuleFor = (lessonId: string) => courseCatalog.modules.find(m => m.lessons.some(l => l.id === lessonId));
export const courseRoute = (moduleId: string, lessonId?: string, section = 'content') => lessonId ? `/course/modules/${moduleId}/lessons/${lessonId}/${section}` : `/course/modules/${moduleId}`;
export const groups = {
  g1: { label: 'المجموعة الأولى', classification: 'dependent', styleLabel: 'معتمد على المجال', support: 'fixed', supportLabel: 'الدعم الثابت' },
  g2: { label: 'المجموعة الثانية', classification: 'independent', styleLabel: 'مستقل عن المجال', support: 'fixed', supportLabel: 'الدعم الثابت' },
  g3: { label: 'المجموعة الثالثة', classification: 'dependent', styleLabel: 'معتمد على المجال', support: 'flex', supportLabel: 'الدعم المرن' },
  g4: { label: 'المجموعة الرابعة', classification: 'independent', styleLabel: 'مستقل عن المجال', support: 'flex', supportLabel: 'الدعم المرن' },
} as const;

export const courseGuideSteps = [
 { title: 'التسجيل والدخول', text: 'هنا تظهر إرشادات التسجيل والدخول. لتجربة النموذج استخدم demo@example.com والرمز المعلن DEMO؛ لا تدخل بيانات حقيقية.' },
 { title: 'التقويم القبلي', text: 'هنا تظهر تعليمات التقويم القبلي. يحتوي النموذج على 6 أسئلة توضيحية؛ يمكنك تسليمه بلا إجابات لتجربة بقية الرحلة.' },
 { title: 'أهلية المشاركة', text: 'هنا تظهر شروط المشاركة الخاصة بالدراسة. شرط العرض الحالي: أول تقويم قبلي بدرجة 50% فأقل يفتح اختبار تحديد المجموعة.' },
 { title: 'اختبار أسلوب التعلم', text: 'هنا تظهر تعليمات اختبار أسلوب التعلم. الأشكال الحالية أمثلة هندسية مصطنعة لعرض آلية الرسم فقط، ولا تقيس أسلوبًا معرفيًا حقيقيًا.' },
 { title: 'المجموعة ونمط الدعم', text: 'هنا تظهر معلومات المجموعة ونمط الدعم. يحتفظ النموذج بأربع مجموعات لعرض الدعم الثابت والمرن، والتوزيع تجريبي محلي.' },
 { title: 'الموديولات والدروس', text: 'هنا تظهر إرشادات الموديولات والدروس. افتح موديولًا لعرض أهدافه، ثم اختر الدرس من القائمة لعرض أهدافه ومحتواه ونشاطه.' },
 { title: 'المحتوى والوسائط', text: 'هنا تظهر إرشادات قراءة المحتوى واستخدام الوسائط. مواضع الفيديو والصور بدائل توضيحية، وإرشادات الدعم قابلة للتجربة.' },
 { title: 'الأنشطة والتقويم البعدي', text: 'هنا تظهر تعليمات الأنشطة والتقويم البعدي. جرّب حفظ إجابة عامة وتسليمها؛ يحتوي البعدي على 6 أسئلة ويتطلب 5 إجابات للتسليم اليدوي.' },
 { title: 'الاستكمال والحفظ', text: 'هنا تظهر إرشادات الاستكمال والحفظ. تُحفظ تجربة العرض في هذا المتصفح فقط دون خادم أو إرسال إجابات، والخروج يحافظ على التقدم.' },
];
