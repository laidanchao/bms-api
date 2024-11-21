import { test, expect, chromium } from '@playwright/test';

// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');
//
//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });
//
// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');
//
//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();
//
//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });

// test('get dhl tracking', async ({page}) => {
//
// try {
//
//   await page.goto('https://www.dhl.com/cn-zh/home/tracking/tracking-parcel.html');
//   await page.locator('#c-tracking--input').fill('00340434762038892711');
//   await page.locator('input[type="submit"]').click();
//
//   const btn = await page.locator('#c-tracking-result--checkpoints-dropdown-button').getByRole('button');
//   await btn.click();
//   // console.log('re',re);
//   const expandedLocator = await page.locator('#c-tracking-result--checkpoints-dropdown-menu');
//
//   await expandedLocator.waitFor();
//   const str=await expandedLocator.innerText();
//   // console.log(str);
//
//   // Expect a title "to contain" a substring.
//   await expect(str).toBeNull();
// }catch (e){
//   await page.close();
//   throw e;
// }
//
// });

test('get cp weight screenshot', async ({ page }) => {
  try {
    const trackingNumber = 'D0000140248313200';
    await page.goto('https://www.colisprive.com/agence/PageAgence/Colis/RechercherColis.aspx');
    await page.locator('#LM_RM_RS_Ct_MCt_tbUserName_I').fill('FTL');
    await page.locator('#LM_RM_RS_Ct_MCt_tbPassword_I').fill('sav02082019');
    await page.locator('#LM_RM_RS_Ct_MCt_btnLogin').click();

    await page.goto('https://www.colisprive.com/agence/PageAgence/Colis/DetailColis.aspx?numColis=' + trackingNumber);
    await page.waitForTimeout(1000);
    const buffer = await page.screenshot();
    const base64 = buffer.toString('base64');

    await expect(base64).toBeNull();
  } catch (e) {
    await page.close();
    throw e;
  }
});
