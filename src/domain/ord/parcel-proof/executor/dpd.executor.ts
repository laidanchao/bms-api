import { Logger } from '@nestjs/common';
import { TaskExecutor } from '@/domain/ord/parcel-proof/task-executor';
import { AccountInfoDto } from '@/domain/ord/parcel-proof/dto/account-info.dto';
import { chromium } from 'playwright';

export class DpdExecutor extends TaskExecutor {
  private logger = new Logger('DpdExecutor');

  async crawlPod(
    trackingNumber: string,
    accountInfo: AccountInfoDto,
  ): Promise<{
    buffer: Buffer;
    extension: string;
  }> {
    const accountPart1 = accountInfo.account.split('-')[0];
    const accountPart2 = accountInfo.account.split('-')[1];

    const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    try {
      const url = `https://trace.dpd.fr/preuvelivraison_${trackingNumber}`;
      await page.goto(url);
      // 隐藏聊天&cookie协议
      const hideStyle = `#lhc_status_container, #privacy-overlay, #popin_tc_privacy{
      display: none !important;
    }`;
      await page.addStyleTag({ content: hideStyle });
      await page.waitForSelector('input#access_pod_ccpod1');
      // 键入用户账号
      await page.type('input#access_pod_ccpod1', accountPart1, { delay: 300 });
      await page.type('input#access_pod_ccpod2', accountPart2, { delay: 300 });
      await page.click('button#access_pod_submit');
      // 等待重定向完成
      await page.waitForURL(url);
      await page.addStyleTag({ content: hideStyle });
      const buffer = await await page.screenshot({ clip: { x: 0, y: 0, width: 1080, height: 968 } });

      return {
        buffer,
        extension: 'png',
      };
    } catch (e) {
      this.logger.error(e.stack || e.message);
      throw e;
    } finally {
      await browser.close();
    }
  }
}
