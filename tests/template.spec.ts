import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { courseCatalog, courseRoute, groups, courseGuideSteps } from '../src/course/catalog';
import { courseScenario } from '../src/course/scenarios';
import { COURSE_STORAGE_KEY } from '../src/course/store';
import { SESSION_STORAGE_KEY } from '../src/state/session-store';
import { embeddedFigures } from '../src/course/embedded-figures';
mkdirSync('review/screenshots', { recursive: true });
const lessons = courseCatalog.modules.flatMap(module => module.lessons.map(lesson => ({ module, lesson })));
const session = { schemaVersion: 1, revision: 1, learner: { active: true, name: 'اسم مستعار للعرض' } };
async function seed(page: Page, group: keyof typeof groups = 'g1') {
 await page.addInitScript(({ sessionKey, courseKey, session, state }) => {
  if (!sessionStorage.getItem('fixture-ready')) { localStorage.setItem(sessionKey, JSON.stringify(session)); localStorage.setItem(courseKey, JSON.stringify(state)); sessionStorage.setItem('fixture-ready','1'); }
 }, { sessionKey: SESSION_STORAGE_KEY, courseKey: COURSE_STORAGE_KEY, session, state: courseScenario(group) });
}
async function geometry(page: Page) { return page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight })); }
async function draw(page: Page, index: number, correct: boolean) {
 const canvas = page.locator('canvas').last(); await canvas.scrollIntoViewIfNeeded();
 const box = (await canvas.boundingBox())!;
 const points = correct ? embeddedFigures[index]!.ans : [{ x:.02,y:.02 },{x:.07,y:.02},{x:.07,y:.07},{x:.02,y:.07}];
 const start=points[0]!; await page.mouse.move(box.x+start.x*box.width,box.y+start.y*box.height); await page.mouse.down();
 for (const p of [...points.slice(1),start]) await page.mouse.move(box.x+p.x*box.width,box.y+p.y*box.height,{steps:6});
 await page.mouse.up();
 await page.getByRole('button',{name:'تأكيد الإجابة',exact:true}).click();
 await expect(page.getByRole('status')).toContainText(correct?'إجابة صحيحة':'إجابة غير صحيحة');
}

test('public placeholder pages and guide at eight viewport sizes load locally', async ({ page }) => {
 const requests: string[]=[]; const errors: string[]=[];
 page.on('request', r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 const records=[];
 for (const [width,height] of [[320,568],[390,844],[768,1024],[900,768],[901,768],[1280,620],[1366,768],[1920,1080]]) {
  await page.setViewportSize({width:width!,height:height!});
  for(const path of ['/','/content','/goals','/guide','/contact','/login']) {
   await page.goto(path); await expect(page.locator('main h1')).toBeVisible();
   const g=await geometry(page);expect(g.scrollWidth).toBeLessThanOrEqual(width!+1); records.push({path,...g});
   if(path==='/') { await expect(page.getByRole('heading',{name:'هنا يظهر اسم الباحث / الباحثة'})).toBeVisible();await expect(page.locator('.supervisor-card')).toHaveCount(3); if([390,1366].includes(width!))await page.screenshot({path:`review/screenshots/home-${width}.png`,fullPage:true}); }
  }
 }
 await page.goto('/guide');
 for(const item of courseGuideSteps){await page.locator('.guide-steps').getByRole('button',{name:item.title,exact:true}).click();await expect(page.locator('.guide-body h2')).toHaveText(item.title);await expect(page.locator('.guide-body > p').last()).toHaveText(item.text);}
 await expect(page.getByRole('link',{name:'استعرض المحتوى',exact:true})).toHaveCount(0);
 expect(requests.filter(url=>!url.startsWith('http://127.0.0.1:4210/')&&!url.startsWith('data:'))).toEqual([]);expect(errors).toEqual([]);
 writeFileSync('review/public-layout.json',JSON.stringify(records,null,2));
});

test('real login, empty pre, all drawing sections, assignment, lesson, post and logout',async({page})=>{
 await page.goto('/login');await page.getByLabel('الرمز التجريبي',{exact:false}).fill('DEMO');
 await page.getByRole('button',{name:'تجربة بحساب تجريبي',exact:true}).click();await expect(page).toHaveURL('/content');
 await page.goto('/assessment/pre/instructions');await page.getByRole('button',{name:'بدء التقويم القبلي',exact:true}).click();
 await page.getByRole('button',{name:'التالي',exact:true}).click();await expect(page.locator('.question-prompt')).toHaveText('هنا يظهر نص السؤال 2 في التقويم القبلي.');
 await page.getByRole('button',{name:'السابق',exact:true}).click();await page.getByRole('button',{name:'تسليم',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('6');await page.getByRole('button',{name:'نعم، سلّم المحاولة',exact:true}).click();
 await expect(page.locator('.score-display strong')).toHaveText('0.00%');await page.getByRole('link',{name:'اختبار أسلوب التعلم',exact:true}).click();
 await page.getByRole('button',{name:'بدء اختبار أسلوب التعلم',exact:true}).click();
 for(let index=0;index<25;index++){
  if(index===7||index===16)await page.getByRole('button',{name:'بدء القسم',exact:true}).click();
  await draw(page,index,index<12);
  if(index===7){await page.reload();await expect(page.getByRole('status')).toContainText('إجابة صحيحة');}
  if(index===0) await page.screenshot({path:'review/screenshots/drawing-desktop.png',fullPage:true});
  await page.getByRole('button',{name:index===24?'إظهار النتيجة وتحديد المجموعة':'السؤال التالي',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'نتيجة أسلوب التعلم والمجموعة',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'الانتقال إلى بيئتك التعليمية',exact:true}).click();await expect(page).toHaveURL('/content');
 const first=lessons[0]!;await page.goto(courseRoute(first.module.id));await page.locator('.workspace-sidebar').getByRole('button',{name:`الدرس 1: ${first.lesson.title}`,exact:true}).click();
 await expect(page).toHaveURL(courseRoute(first.module.id,first.lesson.id,'objectives'));await expect(page.locator('.course-objectives-card')).toContainText('هنا يظهر الهدف 1');
 await page.goto(courseRoute(first.module.id,first.lesson.id,'activity'));await page.locator('textarea').fill('هنا تظهر إجابة تجريبية للنشاط');await page.getByRole('button',{name:'تسليم الإجابة',exact:true}).click();
 await expect(page.locator('.course-submitted')).toContainText('حُفظ تسليم النشاط');
 await page.goto('/assessment/post/instructions');await page.getByRole('button',{name:'بدء التقويم البعدي',exact:true}).click();
 await page.getByRole('button',{name:'تسليم',exact:true}).click();await expect(page.getByRole('button',{name:'نعم، سلّم المحاولة',exact:true})).toBeDisabled();await page.getByRole('link',{name:'لا، العودة إلى الأسئلة',exact:true}).click();
 for(let i=0;i<5;i++){await page.locator('input[type=radio]').first().check();if(i<4)await page.getByRole('button',{name:'التالي',exact:true}).click();}
 await page.reload();await expect(page.locator('input[type=radio]').first()).toBeChecked();await page.getByRole('button',{name:'تسليم',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('هناك 1');await page.getByRole('button',{name:'نعم، سلّم المحاولة',exact:true}).click();await expect(page.locator('.score-display span')).toHaveText('5 / 6');
 const saved=await page.evaluate(key=>localStorage.getItem(key),COURSE_STORAGE_KEY);
 await page.locator('footer').getByRole('button',{name:'تسجيل الخروج',exact:true}).click();expect(await page.evaluate(key=>localStorage.getItem(key),COURSE_STORAGE_KEY)).toBe(saved);
 expect(await page.evaluate(()=>Object.keys(localStorage))).toEqual(expect.arrayContaining([SESSION_STORAGE_KEY,COURSE_STORAGE_KEY]));
 expect(await page.evaluate(()=>Object.keys(localStorage).length)).toBe(2);
 await page.goto(courseRoute(first.module.id,first.lesson.id,'content'));await expect(page.getByRole('heading',{name:'قبل فتح الدرس',exact:true})).toBeVisible();
});

for(const width of [320,390])test(`all 48 phone lesson links preserve free browsing and drafts at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:844});await seed(page,'g4');
 const first=lessons[0]!;await page.goto(courseRoute(first.module.id));await page.getByRole('button',{name:'عرض دروس الموديول',exact:true}).click();
 await page.getByRole('dialog',{name:'قائمة الدروس',exact:true}).getByRole('button',{name:'الدرس 1: الدرس 1',exact:true}).click();
 const saved=await page.evaluate(key=>localStorage.getItem(key),COURSE_STORAGE_KEY);
 for(let i=0;i<lessons.length;i++){
  const {module,lesson}=lessons[i]!;
  for(const section of ['objectives','content','activity']){
   await expect(page).toHaveURL(courseRoute(module.id,lesson.id,section));await expect(page.locator('.workspace-sidebar')).not.toBeVisible();
   await expect(page.getByRole('dialog',{name:'قائمة الدروس',exact:true})).not.toBeVisible();
   const next=page.locator('.course-lesson-flow a');await expect(next).toBeVisible();
   expect((await geometry(page)).scrollWidth).toBeLessThanOrEqual(width+1);
   if(width===390&&i===0&&section==='content'){await expect(page.getByRole('img',{name:'موضع الفيديو التعليمي'})).toBeVisible();await page.screenshot({path:'review/screenshots/content-phone.png',fullPage:true});}
   await next.click();
  }
 }
 await expect(page).toHaveURL('/content');expect(await page.evaluate(key=>localStorage.getItem(key),COURSE_STORAGE_KEY)).toBe(saved);
 await page.goto(courseRoute(first.module.id,first.lesson.id,'activity'));await page.locator('textarea').fill('مسودة عرض لم تُسلّم');await page.locator('.course-lesson-flow a').click();
 await page.goto(courseRoute(first.module.id,first.lesson.id,'activity'));await expect(page.locator('textarea')).toHaveValue('مسودة عرض لم تُسلّم');await expect(page.locator('.course-submitted')).toHaveCount(0);
});

test('four groups show matching support and responsive sidebars without needless actions',async({page})=>{
 for(const group of ['g1','g2','g3','g4'] as const){
  const context=await page.context().browser()!.newContext({viewport:{width:1366,height:768}});const p=await context.newPage();await seed(p,group);
  const {module,lesson}=lessons[0]!;await p.goto(courseRoute(module.id,lesson.id,'content'));await expect(p.locator('.course-group-label').first()).toContainText(groups[group].supportLabel);
  if(groups[group].support==='fixed'){await expect(p.locator('.course-support-message')).toBeVisible();}
  else{await expect(p.locator('.course-support-message')).not.toBeVisible();await p.getByRole('button',{name:'عرض الدعم',exact:true}).click();await expect(p.locator('.course-support-message')).toBeVisible();}
  await context.close();
 }
 await seed(page);const first=lessons[0]!;await page.goto(courseRoute(first.module.id));
 for(const width of [900,901,390,1366]){
  await page.setViewportSize({width,height:768});
  if(width<=900){await expect(page.locator('.workspace-sidebar')).not.toBeVisible();await expect(page.locator('.workspace-overview-actions')).toBeVisible();}
  else{await expect(page.locator('.workspace-sidebar')).toBeVisible();await expect(page.locator('.workspace-overview-actions')).not.toBeVisible();}
 }
 await page.screenshot({path:'review/screenshots/module-desktop.png',fullPage:true});
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id)).toEqual([]);
});
