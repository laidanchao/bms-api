import request from 'request-promise';
import { Moment } from '@softbrains/common-utils';
import _ from 'lodash';
import { Logger } from '@/app/logger';
import axios from 'axios';
import { delay } from '@/domain/utils/util';
import { Transporter } from '@/domain/utils/Enums';
import zlib from 'zlib';

/**
 * 通过 Laposte 官网抓取轨迹信息
 * 使用Chrome浏览器会被检测是否打开了开发者工具(F12)
 * 使用Edge浏览器
 *
 * 支持的派送商 Colissimo Delivengo Asendia
 */
export class LaposteTracking {
  cookie: any;

  async fetchTrackingFromWebSite(trackingNumberArray, transporter: Transporter) {
    this.cookie = null;
    const trackingArray = [];

    let delayMS = 1000;
    switch (transporter) {
      case Transporter.COLISSIMO:
        delayMS = 2500;
        break;
      case Transporter.CAINIAO:
        delayMS = 1000;
        break;
      default:
        break;
    }

    const failedTrackingNumberArray = [];
    const firstTrackingNumber = trackingNumberArray[0];
    console.time(firstTrackingNumber);
    console.log(`${transporter}${firstTrackingNumber}等等${trackingNumberArray.length}个单号开始爬取...`);
    // 以下统计的是2024年3月份数据
    // 法邮上网时效2天（平均26小时），平均7w包裹每天。如果每个包裹爬两次，那么每天应该爬取28w次（7w*2天*2次），那么每小时就是1.2w次，每秒就是3.4次
    // 菜鸟时效10天，平均2w3包裹每天。如果每个包裹爬两次，那么每天应该爬取46w次（2.3w*10天*2次），那么每小时就是1.75w次，每秒就是5.3次
    // DELIVENGO没有包裹
    for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 10)) {
      const { trackingArray: chunkTrackingArray, failedTrackingNumbers } = await this._fetchTrackingBatch(
        chunkTrackingNumberArray,
      );
      trackingArray.push(...chunkTrackingArray);
      failedTrackingNumberArray.push(...failedTrackingNumbers);
      await delay(delayMS);
    }
    console.timeLog(firstTrackingNumber, `${transporter}${firstTrackingNumber}等等,爬取结束!`);
    console.timeEnd(firstTrackingNumber);
    return {
      trackingArray,
      failedTrackingNumberArray,
    };
  }

  async _getCookie(trackingNumber) {
    const url = `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`;
    const j = request.jar();
    return new Promise<void>(resolve => {
      request({ url, jar: j }, () => {
        this.cookie = j.getCookieString(url);
        resolve();
      });
    });
  }

  async _fetchTrackingBatch(trackingNumberArray): Promise<{ trackingArray: any[]; failedTrackingNumbers: string[] }> {
    let results;
    const trackingNumbers = trackingNumberArray.join(',');

    const trackingResult = {
      trackingArray: [],
      failedTrackingNumbers: [],
    };

    try {
      const response = await axios.get(
        `https://www.laposte.fr/ssu/sun/back/suivi-unifie/${trackingNumbers}?lang=fr_FR`,
        {
          headers: {
            'Content-Type': 'application/json',
            Host: 'www.laposte.fr',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
            'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
          },
        },
      );
      results = response.data;
    } catch (e) {
      console.error(`抓取轨迹失败:${trackingNumbers},${e.message}`);
      trackingResult.failedTrackingNumbers = trackingNumberArray;
      return trackingResult;
    }

    trackingResult.trackingArray = _.flatMapDeep(
      results
        .filter(result => result.returnCode.toString() === '200' && result.shipment.event)
        .map(result => {
          return result.shipment.event.map(rawTracking => {
            return {
              description: rawTracking.label,
              event: rawTracking.code || '',
              timestamp: Moment(rawTracking.date)
                .startOf('minute')
                .toDate(),
              trackingNumber: result.shipment.idShip,
              type: rawTracking?.type || '',
            };
          });
        }),
    );

    return trackingResult;
  }

  async fetchTrackingFromOSC(trackingNumberArray: Array<string>, accountInfo: any) {
    const { apiKey, timestamp, signature, account, username, password } = accountInfo;
    try {
      const { data: result } = await axios.post('https://ats.ftlapp.io/api/grab/trackings', {
        apiKey,
        timestamp,
        signature,
        trackingNumbers: trackingNumberArray,
        label: 'colissimo',
        account,
        username,
        password,
      });
      const trackingArray = result.map(r => {
        const trackingNumber = r.trackingNumber;
        Logger.info(`OSC 获取包裹[${trackingNumber}]轨迹${r.tracking.length}条`);
        const rl = r.tracking.map(t => {
          return t.eventCode === 'NOT'
            ? null
            : {
                description: t.description,
                event: t.eventCode,
                timestamp: Moment(t.eventDate)
                  .startOf('minute')
                  .toDate(),
                trackingNumber,
                location: t.eventLocalisation,
              };
        });
        Logger.info(`OSC filter NOT 后轨迹条数${rl.filter(l => l).length}`);
        return rl.filter(l => l);
      });
      return _.flatMap(trackingArray);
    } catch (e) {
      Logger.error(`OSC 报错了，${e.message}`);
      return [];
    }
  }
}
