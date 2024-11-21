import { Between, EntityRepository, MoreThan } from 'typeorm';
import { ParcelAging } from '@/domain/ord/parcel-aging/entities/parcel-aging.entity';
import { BaseRepository } from '@/domain/base/repository/base.repository';
import _ from 'lodash';

@EntityRepository(ParcelAging)
export class ParcelAgingRepository extends BaseRepository<ParcelAging> {
  async bulkInsert(data: ParcelAging[] | ParcelAging): Promise<any[]> {
    const chunk = _.chunk(data, 1000);
    let result = [];
    for (const data of chunk) {
      const insertResult = await this.createQueryBuilder()
        .insert()
        .into(ParcelAging)
        .values(data)
        .orUpdate(
          [
            'updated_at',
            'platform',
            'arrived_aging',
            'arrived_at',
            'arrived_at_is_sunday',
            'channel',
            'product_code',
            'parcel_created_at',
            'status',
            'source_delivery_aging',
            'transferred_aging',
            'transferred_at',
            'transferred_at_is_sunday',
            'transporter_account_id',
            'transporter_id',
          ],
          ['tracking_number'],
        )
        .execute();
      result = result.concat(insertResult.identifiers);
    }
    return result;
  }

  async fetchAverageParcelAging(startDate, endDate, target) {
    const where = {};
    where[`${target}At`] = Between(startDate, endDate);
    return this.createQueryBuilder('p')
      .select('p.transporterId', 'transporterId')
      .addSelect('platform')
      .addSelect('p.productCode', 'productCode')
      .addSelect('channel')
      .addSelect('p.transporterAccountId', 'transporterAccountId')
      .addSelect(`to_char(p.${target}At,'YYYY-MM-DD')`, 'date')
      .addSelect(`avg(p.${target}Aging)`, `average${_.upperFirst(target)}Aging`)
      .where(where)
      .addGroupBy('date')
      .addGroupBy('p.transporterId')
      .addGroupBy('platform')
      .addGroupBy('p.productCode')
      .addGroupBy('channel')
      .addGroupBy('p.transporterAccountId')
      .getRawMany();
  }

  async fetch6GParcelAgingAnalysisData(startDateTime, endDateTime, target) {
    const wheres = {};
    wheres['trackingNumber'] = Between('6G', '6H');
    wheres[`${target}At`] = Between(startDateTime, endDateTime);
    wheres[`${target}Aging`] = MoreThan(0);
    return this.createQueryBuilder('p')
      .select(`to_char(p.${target}At,'YYYY-MM-DD')`, 'date')
      .addSelect(`avg(p.${target}Aging)`, `average${_.upperFirst(target)}Aging`)
      .where(wheres)
      .groupBy('date')
      .getRawMany();
  }
}
