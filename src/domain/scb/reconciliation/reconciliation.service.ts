import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { getConnection, getRepository, IsNull, MoreThan, Not } from 'typeorm';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';
import { BusinessException } from '@/app/exception/business-exception';
import { BillDetail } from '@/domain/scb/bill/entity/bill-detail.entity';
import _ from 'lodash';
import { FuelRate } from '@/domain/scb/fuel-rate/entities/fuel-rate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import XLSX from 'xlsx';
import { Response } from 'express';
import { multiply } from './number.utils';
import { Reconciliation } from './entities/reconciliation.entity';
import { ReconciliationTaskDto } from '@/domain/scb/reconciliation/dto/reconciliationTask.dto';
import { ReconciliationPrice } from '@/domain/scb/reconciliation/entities/reconciliation-price.entity';
import { ReconciliationDetail } from '@/domain/scb/reconciliation/entities/reconciliation-detail.entity';

@Injectable()
export class ReconciliationService extends TypeOrmCrudService<Reconciliation> {
  constructor(
    @InjectRepository(Reconciliation) repo,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) {
    super(repo);
  }

  /**
   * 创建对账任务
   * @param body
   */
  async createReconcileTask(body: ReconciliationTaskDto) {
    // 获取账单列表
    const { transporterId, billYearMonth: yearMonth, productCodes } = body;
    const bills = await getRepository(Bill).find({
      where: {
        transporterId,
        month: yearMonth,
      },
    });
    if (_.isEmpty(bills)) {
      throw new BusinessException(`未找到当月账单，无法校对`);
    }

    // 获取账单明细列表
    const billIds = bills.map(m => m.id);
    const billDetails = await getRepository(BillDetail)
      .createQueryBuilder('detail')
      .where('detail.billId in (:...billIds)', { billIds })
      .andWhere('detail.product in (:...productCodes)', { productCodes })
      .groupBy('detail.transporterAccountId')
      .addGroupBy('detail.product')
      .addGroupBy('detail.weightRange')
      .addGroupBy('detail.countryCode')
      .select('detail.transporterAccountId', 'transporterAccountId')
      .addSelect('detail.product', 'productCode')
      .addSelect('detail.weightRange', 'weightRange')
      .addSelect('detail.countryCode', 'countryCode')
      .addSelect('count(detail.weightRange)', 'parcelQuantity')
      .addSelect('sum(detail.shippingFeeAfterRemise)', 'actualShippingFee')
      .addSelect('sum(detail.fuelFee)', 'actualFuelFee')
      .getRawMany();

    if (_.isEmpty(billDetails)) {
      throw new BusinessException(`未找到月账单明细，无法校对`);
    }

    // 添加一条对账记录
    const billReconcile = await getRepository(Reconciliation).save({
      transporterId,
      yearMonth,
      productCodes,
      total: billDetails.length,
      success: 0,
      failed: 0,
      isFinished: false,
    });

    // 添加对账记录明细后生成excel上传到s3
    this.addReconcileDetailsAndUploadS3(transporterId, yearMonth, billReconcile.id, billDetails).then();
  }

  /**
   * 添加对账记录明细后生成excel上传到s3
   * @param transporterId
   * @param yearMonth
   * @param billReconcileId
   * @param billDetails
   * @private
   */
  private async addReconcileDetailsAndUploadS3(
    transporterId: string,
    yearMonth: string,
    billReconcileId: number,
    billDetails: any[],
  ) {
    // 添加对账记录明细
    const reconcileDetails = await this.addReconcileDetails(transporterId, yearMonth, billReconcileId, billDetails);

    // 生成excel(共2个sheet)
    const file = await this.buildExcel(reconcileDetails);

    // 上传S3
    const filePath = await this.getFilePath(transporterId);
    await this.awsService.uploadFile(file, filePath, this.configService.get('Bucket').cms);
    const fileUrl = `${this.configService.get('BaseUrl').CMSNestApi}/reconciliation/file/${billReconcileId}`;

    // 更新对账记录
    await getRepository(Reconciliation).update(
      {
        id: billReconcileId,
      },
      {
        filePath,
        fileUrl,
        isFinished: true,
      },
    );
  }

  /**
   * 添加对账记录明细
   * @param transporterId
   * @param yearMonth
   * @param billReconcileId
   * @param billDetails
   * @private
   */
  private async addReconcileDetails(
    transporterId: string,
    yearMonth: string,
    billReconcileId: number,
    billDetails: any[],
  ) {
    // 获取成本价格列表
    const costPrices = await getRepository(ReconciliationPrice).find({ transporterId });
    // 获取燃油费率列表
    const fuelRates = await getRepository(FuelRate).find({ transporter: transporterId });

    // 添加对账记录明细
    const reconcileDetails: ReconciliationDetail[] = [];
    const queryRunner = getConnection().createQueryRunner();
    for (let i = 0; i < billDetails.length; i++) {
      const {
        transporterAccountId,
        productCode,
        weightRange,
        parcelQuantity,
        actualShippingFee,
        actualFuelFee,
        countryCode,
      } = billDetails[i];
      // 获取成本价
      const costPrice = costPrices.find(
        f =>
          f.productCodes.includes(productCode) &&
          f.weightRange === weightRange &&
          (f.zones.includes(countryCode) || f.zones.includes('ALL')),
      );

      // 获取燃油费率
      const fuelRate = fuelRates.find(
        f =>
          f.month === yearMonth &&
          f.transporterAccountId === transporterAccountId &&
          f.trackingNumberPrefix === productCode,
      );

      const unitPrice = costPrice ? costPrice.unitPrice : null;
      const payableShippingFee = costPrice ? multiply(parcelQuantity, costPrice.unitPrice, 6) : null;
      const payableFuelFee = costPrice && fuelRate ? multiply(payableShippingFee, fuelRate.value / 100, 6) : null;

      const reconcileDetail = ReconciliationDetail.create({
        billReconcileId,
        transporterAccountId,
        productCode,
        weightRange,
        parcelQuantity,
        actualShippingFee: _.round(actualShippingFee, 6),
        actualFuelFee: _.round(actualFuelFee, 6),
        lineNumber: i + 1,
        countryCode,
        unitPrice,
        payableShippingFee,
        payableFuelFee,
        isError: !(costPrice && fuelRate),
      });

      if (!costPrice || !fuelRate) {
        let errorMessage = '';
        if (!costPrice) {
          errorMessage += '未找到该产品单价配置,';
        }
        if (!fuelRate) {
          errorMessage += '未找到燃油费率配置';
        }
        reconcileDetail.errorMessage = _.trimEnd(errorMessage, ',');
      }

      reconcileDetails.push(reconcileDetail);
      await getRepository(ReconciliationDetail).save(reconcileDetail);

      // 更新对账记录成功/失败条数
      queryRunner.manager.increment(
        Reconciliation,
        { id: billReconcileId },
        reconcileDetail.isError ? 'failed' : 'success',
        1,
      );
    }

    return reconcileDetails;
  }

  /**
   * 生成excel(共2个sheet)
   * @param reconcileDetails
   * @private
   */
  private async buildExcel(reconcileDetails: ReconciliationDetail[]) {
    // 汇总信息 按照账号分组
    const sheetData1 = _.chain(reconcileDetails)
      .groupBy('transporterAccountId')
      .map((value, key) => ({
        账号: key,
        应收折后运费: _.sumBy(value, 'payableShippingFee'),
        应收燃油费: _.sumBy(value, 'payableFuelFee'),
        实收折后运费: _.sumBy(value, 'actualShippingFee'),
        实收燃油费: _.sumBy(value, 'actualFuelFee'),
      }))
      .value();

    const sheetData2 = reconcileDetails.map(detail => ({
      账号: detail.transporterAccountId,
      产品: detail.productCode,
      区域: detail.countryCode,
      重量段: detail.weightRange,
      计数: detail.parcelQuantity,
      单价: detail.unitPrice,
      应收折后运费: detail.payableShippingFee,
      应收燃油费: detail.payableFuelFee,
      实收折后运费: detail.actualShippingFee,
      实收燃油费: detail.actualFuelFee,
    }));

    const book = XLSX.utils.book_new();
    const sheet1 = XLSX.utils.json_to_sheet(sheetData1, { skipHeader: false });
    const sheet2 = XLSX.utils.json_to_sheet(sheetData2, { skipHeader: false });

    XLSX.utils.book_append_sheet(book, sheet1, '总表');
    XLSX.utils.book_append_sheet(book, sheet2, '所有明细');

    const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'buffer' });
    return buffer;
  }

  /**
   * 获取文件路径
   * @param transporterId
   * @private
   */
  private async getFilePath(transporterId: string) {
    const utcDate = moment.utc().format('YYYYMMDD');
    let index = 1;

    // 获取该派送商，当天的最新的账单校验记录
    const billReconcile = await this.repo.findOne({
      where: {
        createdAt: MoreThan(
          moment
            .utc()
            .startOf('day')
            .toDate(),
        ),
        transporterId,
        filePath: Not(IsNull()),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (billReconcile) {
      // 获取文件的序号
      const oldIndex = _.chain(billReconcile.filePath)
        .split('-')
        .last()
        .split('.')
        .head()
        .toNumber()
        .value();
      index = (oldIndex || 1) + 1;
    }

    return `scb/reconciliation/${transporterId}/${transporterId}成本校验-${utcDate}-${index}.xlsx`;
  }

  /**
   * 获取文件
   * @param id
   */
  async getFile(id: number, res: Response) {
    const billReconcile = await getRepository(Reconciliation).findOne(id);
    if (!billReconcile) {
      throw new BusinessException(`未找到文件`);
    }

    const fileName = _.last(billReconcile.filePath.split('/'));
    const readStream = await this.awsService.downloadStream(
      billReconcile.filePath,
      this.configService.get('Bucket').cms,
    );
    res.set({
      'Content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'inline;filename=' + encodeURI(fileName),
    });
    readStream.pipe(res);
  }
}
