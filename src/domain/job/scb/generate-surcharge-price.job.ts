import { Injectable } from '@nestjs/common';
import { NormalJob } from '@/domain/job/base/normal.job';
import moment from 'moment';
import { getRepository } from 'typeorm';
import { SurchargePrice } from '@/domain/scb/surcharge-price/entities/surcharge-price.entity';
import _ from 'lodash';
import { BusinessException } from '@/app/exception/business-exception';
import { XPushService } from '@/domain/external/xpush/x-push.service';

@Injectable()
export class GenerateSurchargePriceJob extends NormalJob {
  constructor(private readonly xPushService: XPushService) {
    super();
  }

  /**
   * 当月初生成上个月账单额外费价格
   * 3.1 复制1月份价格到2月份
   * @param options
   */
  async execute(options?: any) {
    const lastMonth = options?.month
      ? moment(options.month)
          .subtract(2, 'month')
          .format('YYYY-MM')
      : moment()
          .subtract(2, 'month')
          .format('YYYY-MM');
    const billMonth = options?.month
      ? moment(options.month)
          .subtract(1, 'month')
          .format('YYYY-MM')
      : moment()
          .subtract(1, 'month')
          .format('YYYY-MM');
    try {
      const exitCount = await getRepository(SurchargePrice).count({ where: { month: billMonth } });
      if (exitCount) {
        throw new BusinessException(`${billMonth}价格配置已存在`);
      }
      const lastMonthPriceList = await getRepository(SurchargePrice).find({
        month: lastMonth,
      });
      const billMonthPriceList = _.map(lastMonthPriceList, item => {
        return {
          transporter: item.transporter,
          month: billMonth,
          type: item.type,
          countryCode: item.countryCode,
          value: item.type === 'T' && item.countryCode === 'CN' ? '' : item.value,
          description: item.description,
          operator: '系统自动生成',
        };
      });
      await getRepository(SurchargePrice).save(billMonthPriceList);
    } catch (e) {
      await this.xPushService.sendDingDing(`${billMonth}价格配置失败${e.message}`, 'bill');
    }
    await this.xPushService.sendDingDing(`${billMonth}价格配置成功`, 'bill');
  }
}
