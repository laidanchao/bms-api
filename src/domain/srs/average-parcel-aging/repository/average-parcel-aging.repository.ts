import { Between, EntityRepository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AverageParcelAging } from '@/domain/srs/average-parcel-aging/entities/average-parcel-aging.entity';
import { BaseRepository } from '@/domain/base/repository/base.repository';

@EntityRepository(AverageParcelAging)
export class AverageParcelAgingRepository extends BaseRepository<AverageParcelAging> {
  async createOrCover(averageParcelAgingArray) {
    return (
      this.createQueryBuilder()
        .insert()
        .into(AverageParcelAging)
        .values(averageParcelAgingArray)
        //NOTE: 自动增加双引号 如：ON CONFLICT ( "date", "transporter", "platform", "transporterAccountId", "channel", "clientId", "trackingNumberPrefix" ) DO UPDATE SET "updatedAt" = EXCLUDED."updatedAt", "declaredQuantity" = EXCLUDED."declaredQuantity", "transferredQuantity" = EXCLUDED."transferredQuantity", "arrivedQuantity" = EXCLUDED."arrivedQuantity"
        .orUpdate(
          ['updated_at', 'average_transferred_aging', 'average_arrived_aging'],
          ['date', 'platform', 'channel', 'product_code', 'transporter_account_id', 'transporter_id'],
        )
        .execute()
    );
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
    return this.createQueryBuilder('t')
      .select('date')
      .addSelect('avg(t.averageTransferredAging)', 'averageTransferredAging')
      .addSelect('avg(t.averageArrivedAging)', 'averageArrivedAging')
      .where(wheres)
      .groupBy('date')
      .orderBy('date')
      .getRawMany();
  }

  async fetchAnalysisMenu(platform?: string) {
    let where = ' 1=1 ';
    if (platform) {
      where += `and platform = '${platform}'`;
    }
    return this.createQueryBuilder('p')
      .where(where)
      .select('p.transporterId', 'transporterId')
      .addSelect('platform')
      .addSelect('p.productCode', 'productCode')
      .addSelect('channel')
      .addSelect('p.transporterAccountId', 'transporterAccountId')
      .addGroupBy('p.transporterId')
      .addGroupBy('platform')
      .addGroupBy('p.productCode')
      .addGroupBy('channel')
      .addGroupBy('p.transporterAccountId')
      .getRawMany();
  }
}
