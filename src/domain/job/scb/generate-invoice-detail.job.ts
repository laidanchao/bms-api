import { Injectable } from '@nestjs/common';
import { NormalJob } from '@/domain/job/base/normal.job';
import { getRepository, IsNull } from 'typeorm';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';
import papa from 'papaparse';
import { BillDetail } from '@/domain/scb/bill/entity/bill-detail.entity';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
@Injectable()
export class GenerateInvoiceDetailJob extends NormalJob {
  constructor(private readonly awsService: AwsService, private readonly configService: ConfigService) {
    super();
  }

  /**
   * 生成历史账单数据
   * @param options
   */
  async execute(options?: any) {
    // 需要先关掉lambda 触发器
    // 十分钟执行一次
    //1. bill 中 找 fileForApplication 为空的一条数据
    //2. 查找所有的billId的detail
    //3. 生成csv 上传到s3
    //  如果数量超过 30万，就分片生成
    let bill: Bill;
    let detailFileUrl = '';
    if (options?.id) {
      bill = await getRepository(Bill).findOne({ id: options?.id });
    } else {
      bill = await getRepository(Bill).findOne({
        where: { fileForApplication: IsNull() },
        order: { parcelQuantity: 'ASC' },
      });
    }
    const detailCount = await getRepository(BillDetail).count({ billId: bill.id });
    const month = moment(bill.month).format('YYYYMM');
    if (detailCount < 300000) {
      const billDetail = await getRepository(BillDetail).find({
        where: { billId: bill.id },
        select: [
          'invoiceNumber',
          'trackingNumber',
          'shippingNumber',
          'transporterAccountId',
          'weightType',
          'weight',
          'weightRange',
          'roughWeight',
          'countryCode',
          'regionRange',
          'route',
          'postalCode',
          'vat',
          'shippingFee',
          'shippingFeeAfterRemise',
          'fuelFee',
          'extraFee',
          'extraFeeDetail',
          'invoicedAt',
          'extraFeeMinus',
          'extraFeeDetailMinus',
          'product',
          'receiveCountryCode',
          'pickupFee',
          'billId',
        ],
      });
      const filePath = `serverless/result/purchase_detail/${bill.transporterId}/${bill.invoiceNumber}-${bill.platform}-${bill.transporterId}-${month}-${bill.transporterAccountId}.csv`;
      const detailList = billDetail.map(it => {
        return {
          ...it,
          extraFeeDetail: JSON.stringify(it.extraFeeDetail),
          extraFeeDetailMinus: JSON.stringify(it.extraFeeDetailMinus),
        };
      });
      const csvStr = papa.unparse(detailList);
      const buffer = Buffer.from(csvStr, 'utf8');
      await this.awsService.uploadFile(buffer, filePath, this.configService.get('Bucket').cms);
      detailFileUrl = filePath;
    } else {
      let offset = 0;
      let i = 0;
      const limit = 300000;
      // if offset >= yesterdayParcelQuantity, 'select' will got empty set
      while (offset < detailCount) {
        const billDetail = await getRepository(BillDetail).find({
          where: { billId: bill.id },
          select: [
            'invoiceNumber',
            'trackingNumber',
            'shippingNumber',
            'transporterAccountId',
            'weightType',
            'weight',
            'weightRange',
            'roughWeight',
            'countryCode',
            'regionRange',
            'route',
            'postalCode',
            'vat',
            'shippingFee',
            'shippingFeeAfterRemise',
            'fuelFee',
            'extraFee',
            'extraFeeDetail',
            'invoicedAt',
            'extraFeeMinus',
            'extraFeeDetailMinus',
            'product',
            'receiveCountryCode',
            'pickupFee',
            'billId',
          ],
          take: limit,
          order: {
            id: 'ASC',
          },
          skip: offset,
        });
        const filePath = `serverless/result/purchase_detail/${bill.transporterId}/${bill.invoiceNumber}-${bill.platform}-${bill.transporterId}-${month}-${bill.transporterAccountId}-${i}.csv`;
        const detailList = billDetail.map(it => {
          return {
            ...it,
            extraFeeDetail: JSON.stringify(it.extraFeeDetail),
            extraFeeDetailMinus: JSON.stringify(it.extraFeeDetailMinus),
          };
        });
        const csvStr = papa.unparse(detailList);
        const buffer = Buffer.from(csvStr, 'utf8');
        await this.awsService.uploadFile(buffer, filePath, this.configService.get('Bucket').cms);
        offset += limit;
        i++;
        detailFileUrl = detailFileUrl ? detailFileUrl + ',' + filePath : filePath;
      }
    }
    await getRepository(Bill).update(
      { id: bill.id },
      {
        detailFileUrl: detailFileUrl,
        fileForApplication: detailFileUrl,
      },
    );
  }
}
