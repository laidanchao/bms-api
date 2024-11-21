import { Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import moment from 'moment';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import _ from 'lodash';
import { MagicBIService } from '@/domain/external/magicBI/magicBI.service';
import { RequestLog } from '@/domain/ord/request-log/entity/request-log.entity';
import { hourAgo, monthAgo, today, todayStart, weekAgo } from '@/domain/utils/moment-util';

@Injectable()
export class DashboardService {
  constructor(private redisCacheNewService: RedisCacheNewService, private magicBIService: MagicBIService) {}

  /**
   * 更新dashboard数据
   */
  async updateDashBoardData() {
    console.time('更新dashboard耗时');
    const data = await this.createDashboardData();
    await this.redisCacheNewService.set('DASHBOARD', JSON.stringify(data));
    console.timeEnd('更新dashboard耗时');
  }

  /**
   * 获取dashboard数据
   */
  async getDashboardData() {
    const dashboardData = await this.redisCacheNewService.get('DASHBOARD');
    if (dashboardData) {
      return JSON.parse(dashboardData);
    }

    const data = await this.createDashboardData();
    await this.redisCacheNewService.set('DASHBOARD', JSON.stringify(data));
    return data;
  }

  /**
   * 生成dashboard数据
   */
  async createDashboardData() {
    // 派送商数量
    const transporterQuantity = await getRepository(Transporter).count();
    // 账号数量
    const accountQuantity = await getRepository(Account).count();
    // 渠道数量
    const channelQuantity = await getRepository(CamChannel).count();
    // 包裹数据
    const parcelData = await this.getParcelData();
    // 今日下单分布情况
    const distributedData = await this.getDistributedData();
    // // 下单数据
    // const orderData = await this.getOrderData();
    // 24小时内下单数据
    const todayOrderData = await this.getTodayOrderData();
    // 包裹数量（根据包裹类型分类，日期分组）
    const parcelQuantityByType = await this.getParcelQuantityByType();
    // 包裹数量（根据派送商分组）
    const parcelQuantityByTransporter = await this.getParcelQuantityByTransporter();

    return {
      transporterQuantity,
      accountQuantity,
      channelQuantity,
      parcelData,
      distributedData,
      // orderData,
      todayOrderData,
      parcelQuantityByType,
      parcelQuantityByTransporter,
      // 最后一次更新数据时间
      lastUpdatedAt: moment()
        .utc()
        .format('YYYY-MM-DD HH:mm:ss'),
    };
  }

  /**
   * 获取最近一个月上网、妥投、退件、下单失败的包裹数据
   */
  async getLastMonthParcelData(): Promise<{ tt: string; dt: string; quantity: number }[]> {
    const lastMonth = moment()
      .subtract(1, 'month')
      .format('YYYY-MM-DD');

    const { data } = await this.magicBIService.getDataFromBI('dashboard/getParcelData', {
      date1: monthAgo(3),
      date2: lastMonth,
    });

    // 拼接下单失败的数据
    const failedInfo = await this.getFailedInfo(monthAgo(1));
    const result = data.concat(failedInfo);

    return result.map(m => ({
      tt: m.tt,
      dt: m.dt,
      quantity: Number(m.quantity),
    }));
  }

  /**
   * 获取包裹数据
   * @private
   */
  private async getParcelData() {
    // 获取最近一个月上网、妥投、退件的包裹数据
    const lastMonthParcelData = await this.getLastMonthParcelData();

    const parcelData = [];
    const groupData = _.groupBy(lastMonthParcelData, 'tt');
    for (const key in groupData) {
      const items = groupData[key];

      let data = items
        .filter(f => f.dt > weekAgo(2))
        .map(m => ({
          date: m.dt,
          quantity: m.quantity,
        }));

      // 补充日期（当某一天没有数据时，给那天的数据补默认值0）
      const twoWeekDays = this.getTwoWeekDays();
      data = _.unionBy(data, twoWeekDays, 'date');
      const monthStart = moment()
        .startOf('month')
        .format('YYYY-MM-DD');
      const todayData = items.find(f => f.dt === today());
      const monthData = items.filter(f => f.dt >= monthStart);

      parcelData.push({
        data,
        todayQuantity: todayData?.quantity || 0,
        monthQuantity: _.sumBy(monthData, 'quantity'),
        type: key,
      });
    }

    return parcelData;
  }

  /**
   * 近两周的日期
   * @private
   */
  private getTwoWeekDays(): { date: string; quantity: number }[] {
    const twoWeekDays = [];
    for (let i = 0; i < 14; i++) {
      twoWeekDays.push({
        date: moment()
          .subtract(i, 'day')
          .format('YYYY-MM-DD'),
        quantity: 0,
      });
    }
    return twoWeekDays;
  }

  /**
   * 今日下单省份分布情况（仅法国），取收件人邮编的前两位即为省编号
   * @private
   */
  private async getDistributedData() {
    const { data } = await this.magicBIService.getDataFromBI('dashboard/getParcelDataGroupByProvince', {
      startDate: todayStart(),
    });

    return data
      .filter(f => f.province !== '-1')
      .map(m => ({
        provinceCode: m.province,
        quantity: Number(m.quantity),
      }));
  }

  /**
   * 获取下单失败的数据
   * @param startTime
   * @private
   */
  private async getFailedInfo(startTime: string) {
    return await getRepository(RequestLog).query(`
      select
        'FAILED' tt,
        to_char(created_at,'YYYY-MM-DD') dt,
        count(1) quantity
      from ord_request_log
      where  created_at >= '${startTime}' and status='FAILED'
      group by dt
      order by dt
    `);
  }

  /**
   * 获取下单失败的数据,按每个小时分组
   * @param startTime
   * @private
   */
  private async getFailedOrderInfo(startTime: string) {
    return await getRepository(RequestLog).query(`
      select
        to_char(created_at,'HH24:00') tt,
        count(1) quantity
      from ord_request_log
        where created_at >= '${startTime}' and status='FAILED'
        GROUP BY tt
        order by tt
    `);
  }

  /**
   * 今日下单数据
   * @private
   */
  private async getTodayOrderData() {
    const { data } = await this.magicBIService.getDataFromBI('dashboard/getOrderQuantityEveryHour', {
      startDate: hourAgo(24),
    });

    const failedData = await this.getFailedOrderInfo(hourAgo(24));

    return data.map(m => {
      const failedQuantity = failedData.find(f => f.tt == m.tt)?.quantity || 0;
      return {
        time: m.tt,
        orderQuantity: m.quantity,
        orderFailedQuantity: Number(failedQuantity),
      };
    });
  }

  /**
   * 包裹数量（根据包裹类型分类，日期分组）
   * @private
   */
  private async getParcelQuantityByType() {
    const startDate = moment()
      .subtract(6, 'days')
      .format('YYYY-MM-DD');

    const { data } = await this.magicBIService.getDataFromBI('dashboard/getParcelQuantityByType', {
      startDate,
    });

    return data.map(m => {
      return {
        date: m.dd,
        inQuantity: m.inQuantity,
        outQuantity: m.outQuantity,
      };
    });
  }

  /**
   * 包裹数量（根据派送商分组）
   * @private
   */
  private async getParcelQuantityByTransporter() {
    const { data } = await this.magicBIService.getDataFromBI('dashboard/getParcelQuantityByTransporter', {
      startDate: todayStart(),
    });

    const { inParcels, outParcels } = data;

    const inData = _.orderBy(inParcels, ['quantity'], ['desc']);
    const inDataTop6 = inData.slice(0, 6);
    const inDataOther = inData.slice(6);
    inDataTop6.push({
      transporter: '其他',
      quantity: _.sumBy(inDataOther, 'quantity'),
    });

    const outData = _.orderBy(outParcels, ['quantity'], ['desc']);
    const outDataTop6 = outData.slice(0, 6);
    const outDataOther = outData.slice(6);
    outDataTop6.push({
      transporter: '其他',
      quantity: _.sumBy(outDataOther, 'quantity'),
    });

    return {
      in: inDataTop6.map(m => {
        return {
          name: m.transporter,
          value: m.quantity,
        };
      }),
      out: outDataTop6.map(m => {
        return {
          name: m.transporter,
          value: m.quantity,
        };
      }),
    };
  }
}
