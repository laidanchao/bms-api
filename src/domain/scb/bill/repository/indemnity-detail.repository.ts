import { BaseRepository } from '@/domain/base/repository/base.repository';
import { IndemnityDetail } from '@/domain/scb/bill/entity/indemnity-detail.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(IndemnityDetail)
export class IndemnityDetailRepository extends BaseRepository<IndemnityDetail> {
  async createOrCover(indemnityFeeDetailArray) {
    return this.createQueryBuilder()
      .insert()
      .into(IndemnityDetail)
      .values(indemnityFeeDetailArray)
      .returning('*')
      .execute();
  }

  /**
   * TODO column
   * @param bucket
   * @param s3Key
   */
  async importDetailFromS3(bucket, s3Key) {
    const field = 'invoice_number,tracking_number,type,value,transporter,month,platform,transporter_account_id,bill_id';

    console.log(`开始存储 ‘${s3Key}’ 到数据库`);
    const result = await this.manager.query(`
      SELECT aws_s3.table_import_from_s3 (
        'scb_indemnity_detail',
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
}
