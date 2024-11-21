import { EntityRepository, MoreThan } from 'typeorm';
import { BillDetail } from '@/domain/scb/bill/entity/bill-detail.entity';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { BaseRepository } from '@/domain/base/repository/base.repository';
import { InvoiceTypeEnum } from '@/domain/scb/invoice/entities/invoice.entity';

@EntityRepository(BillDetail)
export class BillDetailRepository extends BaseRepository<BillDetail> {
  async fetchExtraFeeDetailByBillId(billId, extraFeeName, extraFeeId) {
    return this.createQueryBuilder('detail')
      .select(`'${billId}'`, 'billId')
      .addSelect(`'${extraFeeId}'`, 'extraFeeId')
      .addSelect(`'${extraFeeName}'`, 'name')
      .addSelect('parcel.clientId', 'clientId')
      .addSelect('detail.transporterAccountId', 'transporterAccountId')
      .addSelect(`sum(coalesce(cast(extra_fee_detail::jsonb ->> '${extraFeeName}' as FLOAT),0))`, 'amount')
      .addSelect('count(1)', 'quantity')
      .leftJoin(Parcel, 'parcel', 'detail.trackingNumber = parcel.trackingNumber')
      .where('detail.billId = :billId', { billId })
      .andWhere('detail.extraFee > 0')
      .andWhere('detail.extraFeeDetail :: JSONB ? :extraFeeName', { extraFeeName })
      .groupBy('parcel.clientId')
      .addGroupBy('detail.transporterAccountId')
      .getRawMany();
  }
  // .addSelect(`sum(coalesce(to_number(extraFeeDetail::jsonb ->> '${extraFeeName}', '9999.999'),0))`,'amount')

  /**
   * TODO column
   * @param bucket
   * @param s3Key
   */
  async importPurchaseDetailFromS3(bucket, s3Key, transporter) {
    let field =
      'invoice_number,tracking_number,shipping_number,transporter_account_id,weight_type,weight,weight_range,' +
      'rough_weight,country_code,region_range,route,postal_code,vat,shipping_fee,shipping_fee_after_remise,' +
      'fuel_fee,extra_fee,extra_fee_detail,invoiced_at';

    // 法邮需要增加两列（product和receive_country_code）
    if (InvoiceTypeEnum.colissimo === transporter) {
      field += ',extra_fee_minus,extra_fee_detail_minus,product,receive_country_code';
    } else if ([InvoiceTypeEnum.colicoli, InvoiceTypeEnum.cainiao, InvoiceTypeEnum.express37].includes(transporter)) {
      field += ',product,receive_country_code,pickup_fee';
    }

    field += ',archived,bill_id';

    console.log(`开始存储 ‘${s3Key}’ 到数据库`);
    const result = await this.manager.query(`
      SELECT aws_s3.table_import_from_s3 (
        'scb_bill_detail_hot',
        '${field}',
        '(format csv, header on, DELIMITER $$,$$)',
        '${bucket}',
        '${s3Key}',
        'eu-west-1',
        '${process.env.SERVERLESS_ACCESSKEY || process.env.CLOUD_S3_ACCESSKEY}',
        '${process.env.SERVERLESS_SECRETKEY || process.env.CLOUD_S3_SECRETKEY}'
      );
    `);

    console.log(`结束存储 ‘${s3Key}’ 到数据库`);
    return result;
  }

  async fetchExtraFeeDetailData(billId, clientId) {
    const where = {
      billId,
      extraFee: MoreThan(0),
    };
    const temp = this.createQueryBuilder('d')
      .select('d.trackingNumber', 'trackingNumber')
      .addSelect('d.extraFeeDetail', 'extraFeeDetail')
      .addSelect('p.clientId', 'clientId')
      .addSelect('p.receiverPostalCode', 'receiverPostalCode')
      .addSelect('p.receiverCity', 'receiverCity')
      .leftJoin(Parcel, 'p', 'd.trackingNumber = p.trackingNumber')
      .where(where);
    if (clientId) {
      return await temp.andWhere('p.clientId = :clientId', { clientId }).getRawMany();
    } else {
      return await temp.getRawMany();
    }
  }
}
