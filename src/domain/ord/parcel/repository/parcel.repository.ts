import { Between, EntityRepository, In, MoreThan } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { classToPlain } from 'class-transformer';
import _ from 'lodash';
import { Logger } from '@nestjs/common';
import { BaseRepository } from '@/domain/base/repository/base.repository';
import moment from 'moment';
import { CrawlerTarget } from '@/domain/sct/crawler/entity/crawler-target.entity';

@EntityRepository(Parcel)
export class ParcelRepository extends BaseRepository<Parcel> {
  /**
   * 比较待更新的包裹targetParcel是否与源包裹sourceParcel发生改变, 若发生改变,
   * @param targetParcel
   * @param sourceParcel
   */
  async updateParcel(targetParcel: Parcel, sourceParcel: Parcel) {
    // update parcel status
    if (targetParcel && !_.isEqual(targetParcel, sourceParcel)) {
      // if (
      //   !_.isEqual(targetParcel.lastTimestamps, sourceParcel.lastTimestamps) ||
      //   !_.isEqual(targetParcel.lastEvent, sourceParcel.lastEvent) ||
      //   !_.isEqual(targetParcel.lastDescription, sourceParcel.lastDescription)
      // ) {
      //   Logger.log(
      //     `ParcelRepository trackingNumber:${targetParcel.trackingNumber} tracking updated and need to be sync(value=false)`,
      //   );
      //   targetParcel.sync = false;
      // }
      targetParcel.sync = false;
      // Logger.log('update parcel');
      await this.update(
        { trackingNumber: targetParcel.trackingNumber },
        _.omit(classToPlain(targetParcel), [
          'id',
          'createdAt',
          'updatedAt',
          'trackingNumber',
          'platform',
          'shippingNumber',
        ]),
      );
    }
  }

  async dailyParcelStats(startDate, endDate) {
    try {
      const results = await this.createQueryBuilder('parcel')
        .select(['parcel.clientId', 'parcel.platform', 'parcel.transporter'])
        .addSelect('count(*)', 'parcelQuantity')
        .addSelect("to_char(parcel.declaredAt, 'yyyy-mm-dd')", 'declaredDate')
        .where('parcel.declaredAt between :startDate and :endDate', { startDate, endDate })
        .groupBy('parcel.platform')
        .addGroupBy('parcel.clientId')
        .addGroupBy('parcel.transporter')
        .addGroupBy('declaredDate')
        .orderBy({
          'parcel.platform': 'ASC',
          'parcel.clientId': 'ASC',
          'parcel.transporter': 'ASC',
        })
        .getRawMany();
      return results;
    } catch (e) {
      Logger.log(`dailyParcelStats: occur exception... ${e.message}`);
    }
    return [];
  }

  async dailyScanParcelStats(startDate, endDate) {
    try {
      const results = await this.createQueryBuilder('parcel')
        .select(['parcel.clientId', 'parcel.platform', 'parcel.transporter'])
        .addSelect('count(*)', 'parcelQuantity')
        .addSelect("to_char(parcel.transferredAt, 'yyyy-mm-dd')", 'transferredDate')
        .where('parcel.transferredAt between :startDate and :endDate', { startDate, endDate })
        .groupBy('parcel.platform')
        .addGroupBy('parcel.clientId')
        .addGroupBy('parcel.transporter')
        .addGroupBy('transferredDate')
        .orderBy({
          'parcel.platform': 'ASC',
          'parcel.clientId': 'ASC',
          'parcel.transporter': 'ASC',
        })
        .getRawMany();
      return results;
    } catch (e) {
      Logger.log(`dailyScanParcelStats: occur exception... ${e.message}`);
    }
    return [];
  }

  async dailyClientTransferredParcelStats(startDate, endDate, clientId, transporter) {
    try {
      const results = await this.createQueryBuilder('parcel')
        .select('count(*)', 'parcelQuantity')
        .addSelect("to_char(parcel.transferredAt, 'yyyy/mm/dd')", 'date')
        .where('parcel.transferredAt between :startDate and :endDate', { startDate, endDate })
        .andWhere('parcel.clientId = :clientId', { clientId })
        .andWhere('parcel.transporter = :transporter', { transporter })
        .groupBy('date')
        .orderBy('date')
        .getRawMany();
      return results;
    } catch (e) {
      Logger.log(`dailyTransferredParcelStats: occur exception... ${e.message}`);
    }
    return [];
  }

  async dailyClientCreatedParcelStats(startDate, endDate, clientId, transporter) {
    try {
      const results = await this.createQueryBuilder('parcel')
        .select('count(*)', 'parcelQuantity')
        .addSelect("to_char(parcel.createdAt, 'yyyy/mm/dd')", 'date')
        .where('parcel.createdAt between :startDate and :endDate', { startDate, endDate })
        .andWhere('parcel.clientId = :clientId', { clientId })
        .andWhere('parcel.transporter = :transporter', { transporter })
        .groupBy('date')
        .orderBy('date')
        .getRawMany();
      return results;
    } catch (e) {
      Logger.log(`dailyClientCreatedParcelStats: occur exception... ${e.message}`);
    }
    return [];
  }

  /**
   * @deprecated
   */
  async findByTrackingNumber(trackingNumber) {
    return this.createQueryBuilder('p')
      .select()
      .where('p.trackingNumber IN (:...trackingNumber)', { trackingNumber })
      .getMany();
  }

  async getYesterdayParcels() {
    return await this.createQueryBuilder()
      .select(
        '"id","trackingNumber","transferredAt","arrivedAt","status","transporter","createdAt","updatedAt","declaredAt","error","shippingNumber","platform","deletedAt","aging","isReturned","returnedAt","receiverCountryCode","receiverPostalCode","lastEvent","lastDescription","lastTimestamps","isArrived","isLost","sync","clientId","transporterAccountId","insuranceValue","channel","apiVersion"',
      )
      .addSelect('TO_CHAR("createdAt",\'YYYY-MM-DD\')', 'createdDate')
      .addSelect('DATE_PART(\'hour\', "createdAt")', 'createdHour')
      .addSelect('TO_CHAR("declaredAt",\'YYYY-MM-DD\')', 'declaredDate')
      .addSelect('DATE_PART(\'hour\', "declaredAt")', 'declaredHour')
      .where({
        createdAt: MoreThan(
          moment(new Date().setDate(new Date().getDate() - 1))
            .utc()
            .format(),
        ),
      })
      .getRawMany();
  }

  public async fetchTrackingNumbers(where, limit, offset, order?: 'ASC' | 'DESC'): Promise<any[]> {
    return await this.createQueryBuilder('p')
      .select('p.trackingNumber', 'trackingNumber')
      .addSelect('p.transporterAccountId', 'transporterAccountId')
      .addSelect('p.receiverPostalCode', 'receiverPostalCode')
      .addSelect('p.shippingNumber', 'shippingNumber')
      .where(where)
      .orderBy('p.id', order)
      .limit(limit)
      .offset(offset)
      .getRawMany();
  }

  public async fetchTrackingNumbersNotCollected(where, limit, order?: 'ASC' | 'DESC'): Promise<any[]> {
    return await this.createQueryBuilder('p')
      .leftJoin(
        CrawlerTarget,
        'target',
        'p.trackingNumber = target.trackingNumber and p.transporterAccountId = target.transporterAccountId',
      )
      .where('target.id is null')
      .andWhere(where)
      .select('p.trackingNumber', 'trackingNumber')
      .addSelect('p.transporterAccountId', 'transporterAccountId')
      .addSelect('p.receiverPostalCode', 'receiverPostalCode')
      .addSelect('p.shippingNumber', 'shippingNumber')
      .orderBy('p.id', order)
      .limit(limit)
      .getRawMany();
  }

  public async trackingNumberCountByPlatform(where): Promise<any[]> {
    return await this.createQueryBuilder('p')
      .select('count(*)', 'quantity')
      .addSelect('p.platform', 'platform')
      .where(where)
      .groupBy('platform')
      .getRawMany();
  }
  public async countByPlatformNotCollected(where): Promise<any[]> {
    return await this.createQueryBuilder('p')
      .leftJoin(
        CrawlerTarget,
        'target',
        'p.trackingNumber = target.trackingNumber and p.transporterAccountId = target.transporterAccountId',
      )
      .where('target.id is null')
      .andWhere(where)
      .select('count(*)', 'quantity')
      .addSelect('p.platform', 'platform')
      .groupBy('platform')
      .getRawMany();
  }

  async importAlgeriaParcel(bucket, s3Key) {
    return await this.manager.query(`
      SELECT aws_s3.table_import_from_s3 (
        ${this.metadata.tableName},
        'tracking_number,status,transporter,declared_at,shipping_number,platform,receiver_country_code,receiver_postal_code,client_id,transporter_account_id,insurance_value,channel,api_version,receiver_city',
        '(format csv, header on, DELIMITER $$,$$)',
        '${bucket}',
        '${s3Key}',
        'eu-west-1',
        '${process.env.SERVERLESS_ACCESSKEY || process.env.CLOUD_S3_ACCESSKEY}',
        '${process.env.SERVERLESS_SECRETKEY || process.env.CLOUD_S3_SECRETKEY}'
      );
    `);
  }

  async findYesterdayArrivedTrackingNumber() {
    await this.createQueryBuilder('p')
      .comment('\r\n收集昨日送达包裹，构造含有 DI1 轨迹事件的法邮轨迹文件推送给 YUN\r\n执行1次/日\r\n')
      .select('p.trackingNumber', 'trackingNumber')
      .addSelect('p.transporterAccountId', 'transporterAccountId')
      .where({
        transporter: 'COLISSIMO',
        transporterAccountId: In(['816272', '897769']),
        status: 'ARRIVED',
        declaredAt: Between(moment('2021-01-01', 'YYYY-MM-DD'), moment('2022-12-31', 'YYYY-MM-DD')),
        arrivedAt: Between(
          moment()
            .add(-1, 'days')
            .startOf('days'),
          moment()
            .add(-1, 'days')
            .endOf('days'),
        ),
      })
      .maxExecutionTime(9 * 1000)
      .getRawMany();
  }

  async countParcelQuantity(startDate, endDate, target) {
    const where = {};
    where[`${target}At`] = Between(startDate, endDate);
    return await this.createQueryBuilder('p')
      .select(`to_char(p.${target}At,'YYYY-MM-DD')`, 'date')
      .addSelect('transporter')
      .addSelect('platform')
      .addSelect('p.transporterAccountId', 'transporterAccountId')
      .addSelect('channel')
      .addSelect('p.clientId', 'clientId')
      .addSelect(`substr(p.trackingNumber,1,2)`, 'trackingNumberPrefix')
      .addSelect('count(id)', `${target}Quantity`)
      .where(where)
      .groupBy('date')
      .addGroupBy('transporter')
      .addGroupBy('platform')
      .addGroupBy('p.transporterAccountId')
      .addGroupBy('channel')
      .addGroupBy('p.clientId')
      //Note: 改表名引发问题     .addGroupBy('p.trackingNumberPrefix') 解析出的sql为 p.trackingNumberPrefix 但不存在于表中
      .addGroupBy('"trackingNumberPrefix"')
      .getRawMany();
  }

  public async importOutsideParcelOrIgnore(parcelArray) {
    return await this.createQueryBuilder('p')
      .insert()
      .into(Parcel)
      .values(parcelArray)
      .orIgnore(true)
      .execute();
  }

  async findExpressInactiveTrackingNumber() {
    const moreThanTime = moment()
      .subtract(3, 'month')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss');
    return await this.createQueryBuilder('p')
      .select('p.trackingNumber', 'trackingNumber')
      .addSelect('p.transporter', 'transporter')
      .leftJoin(CrawlerTarget, 't', 't.trackingNumber = p.trackingNumber')
      .where("p.platform = 'FTL-EXPRESS'")
      .andWhere('t.active = false')
      .andWhere("t.status NOT IN ('CREATED','ARRIVED')")
      .andWhere('p.created_at>= :moreThanTime', { moreThanTime: moreThanTime })
      .getRawMany();
  }
}
