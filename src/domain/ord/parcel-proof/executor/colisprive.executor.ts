import { TaskExecutor } from '@/domain/ord/parcel-proof/task-executor';
import { Logger } from '@nestjs/common';
import { Browser, chromium, Page } from 'playwright';

export class ColispriveExecutor extends TaskExecutor {
  private logger = new Logger('ColispriveExecutor');

  async crawlWeightPicture(
    trackingNumber: string,
    { username, password },
  ): Promise<{
    buffer: Buffer;
    extension: string;
  }> {
    const browser = await chromium.launch(); // Or 'firefox' or 'webkit'.
    try {
      const page = await this.openParcelDetailPage(browser, trackingNumber, username, password);
      const buffer = await page.screenshot({ clip: { x: 0, y: 0, width: 870, height: 500 } });
      return {
        buffer,
        extension: 'png',
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    } finally {
      await browser.close();
    }
  }

  async crawlPod(
    trackingNumber: string,
    { username, password },
  ): Promise<{
    buffer: Buffer;
    extension: string;
  }> {
    const browser = await chromium.launch(); // Or 'firefox' or 'webkit'.
    try {
      const page = await this.openParcelDetailPage(browser, trackingNumber, username, password);
      await page.click('xpath=//*[@id="MM_RM_RS_Ct_CtS_MCt_tOng_T4T"]/span');
      const buffer = await page.screenshot({ clip: { x: 0, y: 0, width: 840, height: 500 } });
      return {
        buffer,
        extension: 'png',
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    } finally {
      await browser.close();
    }
  }

  /**
   * 打开包裹详情页
   * @param trackingNumber
   * @param username
   * @param password
   * @private
   */
  private async openParcelDetailPage(
    browser: Browser,
    trackingNumber: string,
    username: string,
    password: string,
  ): Promise<Page> {
    const numColis = trackingNumber.slice(0, 12);
    const page = await browser.newPage();
    await page.goto('https://www.colisprive.com/agence/PageAgence/Colis/RechercherColis.aspx');
    await page.locator('#LM_RM_RS_Ct_MCt_tbUserName_I').fill(username);
    await page.locator('#LM_RM_RS_Ct_MCt_tbPassword_I').fill(password);
    await page.locator('#LM_RM_RS_Ct_MCt_btnLogin').click();
    await page.goto(`https://www.colisprive.com/agence/PageAgence/Colis/DetailColis.aspx?numColis=${numColis}`, {
      waitUntil: 'load',
    });
    return page;
  }
}
