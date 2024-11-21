import { TaskExecutor } from '@/domain/ord/parcel-proof/task-executor';
import { Logger } from '@nestjs/common';
import { BrowserContext, chromium, Page } from 'playwright';
import _ from 'lodash';
import moment from 'moment';
import request from 'request-promise';
import { ColissimoLanguage } from '@/domain/ord/parcel-proof/enums/colissimo-language.enum';
import { ReceiverInfoDto } from '@/domain/ord/parcel-proof/dto/receiver-info.dto';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import { Language } from '@/domain/utils/Enums';
import path from 'path';

export class ColissimoExecutor extends TaskExecutor {
  private logger = new Logger('ColissimoExecutor');

  private CookieList: { cookie: string; expiresAt: Date; username: string }[] = [];
  async crawlPod(
    trackingNumber: string,
    { username, password, account },
    language?: string,
  ): Promise<{
    buffer: Buffer;
    extension: string;
  }> {
    const browser = await chromium.launch(); // Or 'firefox' or 'webkit'.
    try {
      const context = await browser.newContext();
      const cookie = await this.getCookie(context, username, password);

      language = ColissimoLanguage[language] || ColissimoLanguage.EN;

      let parcels = await this.getParcelUUID([trackingNumber], account, cookie);

      parcels = _.filter(parcels, { status: 6 });
      if (parcels.length === 0) {
        this.logger.error('该单号未上网或者不属于该账号');
        throw new Error('该单号未上网或者不属于该账号');
      }
      let url =
        'https://www.colissimo.fr/entreprise/colis/parcels/downloadDocument?url=/deliverycertificate/$$parcelUuid$$?$$lang$$';
      url = url.replace('$$parcelUuid$$', parcels[0].uuid).replace('$$lang$$', language);
      const result = await request({
        url,
        headers: {
          Cookie: cookie,
        },
        method: 'get',
        encoding: 'base64',
      });
      return {
        buffer: Buffer.from(result, 'base64'),
        extension: 'pdf',
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    } finally {
      await browser.close();
    }
  }

  /**
   * 生成POD
   * @param trackingNumber
   * @param receiverInfo
   * @param language
   */
  async generatePod(trackingNumber: string, receiverInfo: ReceiverInfoDto, language = Language.FR) {
    try {
      const templatePath = `${process.cwd()}/src/assets/pod-template/${language}.pdf`;
      const pdf = await PDFDocument.load(fs.readFileSync(templatePath));

      const { date, content } = this.formatPodContent(trackingNumber, receiverInfo, language);

      const form = pdf.getForm();
      form.getTextField('date').setText(date);
      form.getTextField('content').setText(content);
      form.flatten();

      // 保存新的PDF文件
      const pdfBytes = await pdf.save();
      return {
        buffer: Buffer.from(pdfBytes),
        extension: 'pdf',
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * 拼接pod要展示的内容
   * @param trackingNumber
   * @param receiverInfo
   * @param language
   * @private
   */
  private formatPodContent(trackingNumber: string, receiverInfo: ReceiverInfoDto, language: Language) {
    // 拼接address
    const { street1, street2, street3, postCode, city } = receiverInfo;
    const streetsArray = [street1, street2, street3, postCode, city].filter(f => f);
    const address = streetsArray.join(' ').toUpperCase();

    const arrivedAt = moment(receiverInfo.arrivedAt)
      .locale(language.toLowerCase())
      .format('LL');
    let content;
    if (language === Language.FR) {
      content =
        "Selon les éléments de notre système d'information nous sommes en mesure de vous confirmer que le colis n° ";
      content += `${trackingNumber}, destiné à ${receiverInfo.lastName} - ${address} a bien été livré le ${arrivedAt}.`;
    } else if (language === Language.EN) {
      content =
        'According to the data stored on our information system, we are able to confirm you that the parcel No. ';
      content += `${trackingNumber}, addressed to ${receiverInfo.lastName} - ${address} was successfully delivered on ${arrivedAt}.`;
    }

    return {
      date: moment()
        .locale(language.toLowerCase())
        .format('LL'),
      content,
    };
  }

  private async getCookie(context: BrowserContext, username: string, password: string) {
    const cache = this.CookieList.find(f => f.username === username);
    if (cache && cache.cookie && moment().isBefore(cache.expiresAt)) {
      return cache.cookie;
    }

    const page = await context.newPage();
    try {
      await this.login(page, username, password);
      await page.waitForTimeout(1000);
      await page.click('.field__item article[data-item-hash="/faq-item/701"] .field__item');
      await page.waitForTimeout(1000);
      const cookies = await context.cookies();
      const cookie = _.chain(cookies)
        .filter(item => ['JSESSIONID_OSC', 'e3fc1a95a553d8ce129b97f5ae60bcf0', 'user'].includes(item.name))
        .map(c => {
          if (c.name === 'e3fc1a95a553d8ce129b97f5ae60bcf0') {
            return `iadvize-3915-vuid=${c.value}`;
          }
          return `${c.name}=${c.value}`;
        })
        .join('; ')
        .value();
      const expiresAt = moment()
        .add(7, 'days')
        .toDate();
      if (cache) {
        cache.cookie = cookie;
        cache.expiresAt = expiresAt;
      } else {
        this.CookieList.push({
          username,
          cookie,
          expiresAt,
        });
      }

      return cookie;
    } catch (e) {
      this.logger.error(e);
      throw new Error(`获取cookie异常${e.message}`);
    }
  }

  async login(page: Page, username: string, password: string) {
    this.logger.log('login start');
    await page.setViewportSize({ width: 1200, height: 700 });
    await page.goto('https://www.colissimo.entreprise.laposte.fr', { waitUntil: 'load' });
    this.logger.log('open page');
    await page.click('button:has-text("Passer")');
    await page.click('text=Se connecter');
    await page.click('input[name="login"]');
    await page.fill('input[name="login"]', username);
    this.logger.log('fill username');
    await page.click('input[name="pass"]');
    await page.fill('input[name="pass"]', password);
    this.logger.log('fill password');
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://www.colissimo.entreprise.laposte.fr/' }*/),
      page.click('text=Confirmer'),
    ]);
    this.logger.log('wait Navigation');
    await page.click('text=Passer');
    this.logger.log('login success');
  }

  async getParcelUUID(trackingNumbers: string[], account: string, cookie: string) {
    this.logger.log(`getParcelUUID => trackingNumber: ${trackingNumbers.join(',')}, account: ${account}`);
    let result;
    try {
      result = await request({
        uri: 'https://www.colissimo.fr/entreprise/colis/parcels/search',
        method: 'POST',
        headers: {
          Cookie: cookie,
        },
        json: true,
        body: {
          accounts: [parseInt(account)],
          page: 1,
          resultPerPage: 1000,
          searchQuery: [
            {
              criteria: 'parcel_ref',
              value: trackingNumbers,
            },
          ],
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new Error(`getParcelUUID: ${e.message}`);
    }
    this.logger.log(`getParcels done, size ${_.size(result.parcels)}`);
    return result.parcels.map(parcel => {
      return {
        uuid: parcel.parcelUuid,
        trackingNumber: parcel.parcelReference,
        status: parcel.deliveryProgressStatus,
      };
    });
  }
}
