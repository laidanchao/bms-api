import { BaseRepository } from '@/domain/base/repository/base.repository';
import { QuantityDistribution } from '@/domain/srs/quantity-distribution/entities/quantity-distribution.entity';
import { Between, EntityRepository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Account } from '@/domain/cam/account/entities/account.entity';

@EntityRepository(QuantityDistribution)
export class QuantityDistributionRepository extends BaseRepository<QuantityDistribution> {
  async createOrCover(quantityDistributionArray) {
    return this.createQueryBuilder('t')
      .insert()
      .into(QuantityDistribution)
      .values(quantityDistributionArray)
      .orUpdate(
        ['updated_at', 'declared_quantity', 'transferred_quantity', 'arrived_quantity'],
        ['date', 'transporter', 'platform', 'transporter_account_id', 'channel', 'client_id', 'tracking_number_prefix'],
      )
      .execute();
  }

  async fetchAnalysisData(wheres) {
    if (wheres) {
      if (wheres.startDate && wheres.endDate) {
        wheres.date = Between(wheres.startDate, wheres.endDate);
      } else if (wheres.startDate) {
        wheres.date = MoreThanOrEqual(wheres.startDate);
      } else if (wheres.endDate) {
        wheres.date = LessThanOrEqual(wheres.endDate);
      }
      delete wheres.startDate;
      delete wheres.endDate;
    }
    return this.createQueryBuilder('q')
      .select('date')
      .addSelect('q.transporterAccountId', 'transporterAccountId')
      .addSelect('sum(q.declaredQuantity)', 'declaredQuantity')
      .addSelect('sum(q.transferredQuantity)', 'transferredQuantity')
      .addSelect('sum(q.arrivedQuantity)', 'arrivedQuantity')
      .leftJoin(Account, 'a', 'a.account = q.transporterAccountId')
      .where(wheres)
      .andWhere('a.external is not true')
      .groupBy('date')
      .addGroupBy('q.transporterAccountId')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async fetchAnalysisMenu(platform?: string) {
    let where = ' 1=1 ';
    if (platform) {
      where += `and platform = '${platform}'`;
    }
    return (
      this.createQueryBuilder('q')
        .where(where)
        // .comment('\r\n包裹数量统计页面获取左侧菜单\r\n页面刷新时执行1次\r\n已使用缓存 24小时失效，新增数据时删除缓存\r\n')
        .select('transporter')
        .addSelect('platform')
        .addSelect('q.clientId', 'clientId')
        .addSelect('q.transporterAccountId', 'transporterAccountId')
        .addGroupBy('transporter')
        .addGroupBy('platform')
        .addGroupBy('q.clientId')
        .addGroupBy('q.transporterAccountId')
        .getRawMany()
    );
  }

  async fetch6GAnalysisMenu() {
    return this.createQueryBuilder('q')
      .select('transporter')
      .addSelect('platform')
      .addSelect('q.clientId', 'clientId')
      .addSelect('q.transporterAccountId', 'transporterAccountId')
      .where({
        trackingNumberPrefix: '6G',
      })
      .addGroupBy('transporter')
      .addGroupBy('platform')
      .addGroupBy('q.clientId')
      .addGroupBy('q.transporterAccountId')
      .getRawMany();
  }

  async findByDateAndTransporterAndClientId(startOfMonth, endOfMonth, transporter, clientId) {
    return this.createQueryBuilder('q')
      .select('q.date', 'date')
      .addSelect('q.transporter', 'transporter')
      .addSelect('q.platform', 'platform')
      .addSelect('q.transporterAccountId', 'transporterAccountId')
      .addSelect('q.channel', 'channel')
      .addSelect('q.clientId', 'clientId')
      .addSelect('q.trackingNumberPrefix', 'trackingNumberPrefix')
      .addSelect('q.declaredQuantity', 'declaredQuantity')
      .addSelect('q.transferredQuantity', 'transferredQuantity')
      .addSelect('q.arrivedQuantity', 'arrivedQuantity')
      .leftJoin(Account, 'a', 'q.transporterAccountId = a.account')
      .where({
        date: Between(startOfMonth, endOfMonth),
        transporter,
        clientId,
      })
      .andWhere('a.external is not true')
      .getRawMany();
  }
}
