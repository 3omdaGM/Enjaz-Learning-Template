import { test, expect } from '@playwright/test';
test('production retains placeholder journeys and excludes developer tools',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'هنا يظهر اسم الباحث / الباحثة'})).toBeVisible();
 await page.goto('/demo-tools');await expect(page.getByRole('heading',{name:'لم نعثر على هذه الصفحة',exact:true})).toBeVisible();
 await page.goto('/legacy-demo-tools');await expect(page.getByRole('heading',{name:'لم نعثر على هذه الصفحة',exact:true})).toBeVisible();
 await page.goto('/login');await page.getByLabel('الرمز التجريبي',{exact:false}).fill('DEMO');await page.getByRole('button',{name:'تجربة بحساب تجريبي',exact:true}).click();
 await page.goto('/assessment/pre/instructions');await page.getByRole('button',{name:'بدء التقويم القبلي',exact:true}).click();await expect(page.locator('.question-prompt')).toHaveText('هنا يظهر نص السؤال 1 في التقويم القبلي.');
});
