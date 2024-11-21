import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BillSurchargeEntity } from '@/domain/scb/bill/entity/bill-surcharge.entity';
import { FuelRate } from '@/domain/scb/fuel-rate/entities/fuel-rate.entity';
import _ from 'lodash';
import { IndemnityDetail } from '@/domain/scb/bill/entity/indemnity-detail.entity';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import request from 'request-promise';
import { Between, getRepository, In, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BillRepository } from '@/domain/scb/bill/repository/bill.repository';
import { BillDetailRepository } from '@/domain/scb/bill/repository/bill-detail.repository';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { IndemnityDetailRepository } from '@/domain/scb/bill/repository/indemnity-detail.repository';
import moment from 'moment';
import { InvoiceLogService } from '@/domain/scb/invoice-log/invoice-log.service';
import { AnalysisStatusEnum } from '@/domain/scb/invoice/entities/invoice.entity';
import { ColissimoVerifier } from '@/domain/scb/bill/verifier/colissimo-verifier';
import { InvoiceVerifier } from '@/domain/scb/bill/verifier/invoice-verifier';
import { InvoiceTypeEnum, ScbInvoice } from '@/domain/scb/invoice/entities/invoice.entity';
import { ScbInvoiceService } from '@/domain/scb/invoice/invoice.service';
import { SystemVariableService } from '@/domain/base/ssm/system/system-variable.service';
import { MagicBIService } from '@/domain/external/magicBI/magicBI.service';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';

@Injectable()
export class BillService extends TypeOrmCrudService<Bill> {
  private readonly bucketConfig: Record<string, any>;
  private readonly indemnityConfig: Record<string, any>;
  private readonly colissimoVerifier: ColissimoVerifier = new ColissimoVerifier();
  private readonly invoiceVerifier: InvoiceVerifier = new InvoiceVerifier();

  constructor(
    @InjectRepository(BillRepository) private billRepository: BillRepository,
    @InjectRepository(BillDetailRepository) private readonly billDetailRepository: BillDetailRepository,
    @InjectRepository(IndemnityDetailRepository) private readonly indemnityDetailRepository: IndemnityDetailRepository,
    @InjectRepository(BillSurchargeEntity) private readonly extraFeeRepo,
    @InjectRepository(IndemnityDetailRepository) private readonly indemnityRepo,
    @InjectRepository(FuelRate) private readonly fuelRateRepo,
    @InjectRepository(Parcel) private readonly parcelRepo,
    private readonly configService: ConfigService,
    private readonly xPushService: XPushService,
    private readonly invoiceLogService: InvoiceLogService,
    private readonly systemVariableService: SystemVariableService,
    private readonly scbInvoiceService: ScbInvoiceService,
    private readonly magicBIService: MagicBIService,
    private readonly redisCacheNewService: RedisCacheNewService,
  ) {
    super(billRepository);
    this.bucketConfig = this.configService.get('Bucket');
    this.indemnityConfig = this.configService.get('OMS');
  }

  public async fetch(query: Record<string, any>): Promise<Bill[]> {
    return await this.repo.find(query);
  }

  public async bms(month: string, transporterId: string, transporterAccountId: string): Promise<Bill[]> {
    return await this.repo.find({
      where: {
        month,
        transporterId,
        transporterAccountId,
      },
      relations: ['extraFees'],
    });
  }

  public async bmsByMonthTransporter(month: string, transporterId: string, billType: string, platform: string) {
    const data: any[] = await this.repo
      .createQueryBuilder('b')
      .leftJoinAndMapMany('b.extraFees', BillSurchargeEntity, 'extraFees', 'extraFees.billId = b.id')
      .leftJoinAndMapOne('b.invoice', ScbInvoice, 'invoice', 'invoice.id = b.invoiceId')
      .where('b.month =:month', { month })
      .andWhere('b.transporterId =:transporterId', { transporterId })
      .andWhere('b.platform =:platform', { platform })
      .andWhere('invoice.billType =:billType', { billType })
      .getMany();
    data.forEach(it => {
      it.billType = it.invoice.billType;
      delete it.invoice;
    });
    return data;
  }

  /**
   * 根据传入的keys 返回相应结构的树
   * @param keys
   */
  async fetchAmountAnalysisMenu(keys) {
    const treeDataRange = await this.billRepository.fetchAmountAnalysisMenu();
    if (_.isEmpty(treeDataRange)) {
      return [];
    }
    if (!keys) {
      // 提供默认的树的结构
      keys = Object.keys(treeDataRange[0]);
    }
    return toTree(treeDataRange, keys);
  }

  async fetchExtraFeeAnalysisData(target, wheres) {
    const { data } = await this.magicBIService.getDataFromBI('statistics/getSurchargeStatistics', wheres);
    return data;
  }

  async fetchExtraFeeAnalysisMenu(keys) {
    const tree = await this.redisCacheNewService.get('SURCHARGE_STATISTICS_TREE');
    let data = [];
    if (tree) {
      data = JSON.parse(tree);
    } else {
      const result = await this.magicBIService.getDataFromBI('statistics/getSurchargeStatisticsTree', {});

      const array = _.chain(result.data)
        .map('info')
        .uniq()
        .value();

      array.forEach(item => {
        const codes = _.chain(result.data)
          .filter(f => f.info === item)
          .flatMap(m => {
            return JSON.parse(m.code);
          })
          .uniq()
          .value();

        data = data.concat(
          codes.map(code => {
            return {
              transporterId: item.split('|')[1],
              transporterAccountId: item.split('|')[2],
              year: item.split('|')[0],
              name: code,
            };
          }),
        );
      });
      // 缓存保存30天
      this.redisCacheNewService.set('SURCHARGE_STATISTICS_TREE', JSON.stringify(data), 3600 * 24 * 30).then();
    }

    if (!keys) {
      // 提供默认的树的结构
      keys = Object.keys(data[0]);
    }
    return toTree(data, keys);
  }

  fetchAnalysisData(target: string, wheres: Record<string, string>) {
    return this.billRepository.fetchAnalysisData(target, wheres);
  }

  public async saveServerlessPurchaseBill(purchaseBill: Bill) {
    const bill = await this.repo.save(purchaseBill);
    if (purchaseBill['purchaseBillExtras'] && purchaseBill['purchaseBillExtras'].length > 0) {
      purchaseBill['purchaseBillExtras'].forEach(extra => (extra.bill = bill));
      await this.extraFeeRepo.save(purchaseBill['purchaseBillExtras']);
    }
    return bill;
  }

  /**
   * scbInvoice 解析数据导入
   * @param scbInvoice
   * @param purchaseBills
   * @param purchaseDetailUrl
   * @param billParseRecordArray
   */
  public async handleScbServerlessResult({
    scbInvoice,
    purchaseBills,
    fuelRateArray,
    billParseRecordArray,
    purchaseDetailSummary,
  }) {
    const month = scbInvoice.month;
    const transporter = scbInvoice.transporter;
    const account = scbInvoice.account || '';
    const channelAccount = scbInvoice.channelAccount;
    const platform = scbInvoice.platform;
    const title = `${transporter}-${account}-${month}-${moment()
      .utc()
      .format('x')}`;
    try {
      // 数据校验
      const { verifyResultBool, result } = await this.invoiceValid(scbInvoice, purchaseBills, purchaseDetailSummary);

      if (!verifyResultBool) {
        await this.xPushService.sendDingDing(`${title}\n\n**账单校验未通过！数据未导入!**\n\n${result}`, 'bill');
        await getRepository(ScbInvoice).update(
          { id: scbInvoice.id },
          {
            status: AnalysisStatusEnum.failed,
            result: {
              failReason: `${title}\n\n账单校验未通过！数据未导入`,
              ...scbInvoice.result,
            },
          },
        );
        return;
      } else {
        await this.xPushService.sendDingDing(
          `${title}\n\n**账单数据校验通过** \n\n${JSON.stringify(scbInvoice.result)}`,
          'bill',
        );
      }

      // 存储数据
      if (billParseRecordArray && billParseRecordArray.length) {
        await this.invoiceLogService.create(billParseRecordArray);
        for (const billParseRecord of billParseRecordArray) {
          if (billParseRecord.purchaseDetailUrl) {
            console.log(billParseRecord.purchaseDetailUrl, '开始处理');
            for (const purchaseDetailUrl of billParseRecord.purchaseDetailUrl.split(',')) {
              await this._importPurchaseDetailFromCSV(
                this.bucketConfig.cms,
                purchaseDetailUrl,
                transporter,
                scbInvoice.billType,
              );
            }
          }
        }
      }

      if (!_.isEmpty(purchaseBills)) {
        const billDetailUrl = purchaseBills.filter(it => it.detailFileUrl);
        for (const bill of billDetailUrl) {
          const fileForApplication = bill.detailFileUrl
            .replace('purchase_detail_wait_confirm', 'sendApplication')
            .replace('purchase_detail', 'sendApplication');
          await this.repo.update({ id: bill.id }, { detailFileUrl: bill.detailFileUrl, fileForApplication });
        }
      }

      if (fuelRateArray) {
        await this.saveFuelRateArray(month, transporter, fuelRateArray);
      }

      // 法邮需要生成销售账单
      if (scbInvoice.billType === InvoiceTypeEnum.colissimo) {
        await this.xPushService.sendDingDing(`${title}\n\n账单数据校验通过 数据导入成功，账单解析完成`, 'bill');
        await this.scbInvoiceService.generateCustomsBill(scbInvoice.id, scbInvoice.month);
      }

      await getRepository(ScbInvoice).update(
        { id: scbInvoice.id },
        { status: AnalysisStatusEnum.success, result: scbInvoice.result, account, channelAccount, platform },
      );
    } catch (e) {
      await getRepository(ScbInvoice).update(
        { id: scbInvoice.id },
        {
          status: AnalysisStatusEnum.failed,
          result: { failReason: e.message },
          account,
          channelAccount,
          platform,
        },
      );
      await this.xPushService.sendDingDing(` ${title},账单处理失败，${e.message}`, 'bill');
    }
  }

  /**
   * 账单校验
   */
  async invoiceValid(scbInvoice, purchaseBills, purchaseDetailSummary) {
    const billVerifyLimit = await this.systemVariableService.findByKey('billVerifyLimit');
    let verifyResultBool = true;
    let result = '';
    if (
      [
        InvoiceTypeEnum.colisprive,
        InvoiceTypeEnum.colicoli,
        InvoiceTypeEnum.cainiao,
        InvoiceTypeEnum.colissimo,
      ].includes(scbInvoice.billType)
    ) {
      verifyResultBool = this.invoiceVerifier.verify(null, purchaseBills, scbInvoice, Number(billVerifyLimit.value));
    } else if (scbInvoice.billType === InvoiceTypeEnum.colissimo) {
      verifyResultBool = this.colissimoVerifier.verify(
        null,
        purchaseBills,
        scbInvoice,
        Number(billVerifyLimit.value),
        purchaseDetailSummary,
      );
    }

    if (!verifyResultBool) {
      _.mapKeys(scbInvoice.result, (value, key) => {
        if (!value.result) {
          value = `<font color="#FF0000">${key}:${JSON.stringify(value)}</font>`;
        } else {
          value = `${key}:${JSON.stringify(value)}`;
        }
        result = `${result}\n\n${value}`;
      });
    }
    return {
      verifyResultBool,
      result,
    };
  }

  /**
   * 更新OMS售后数据
   * @param indemnity
   */
  private async notifySupport(indemnity: IndemnityDetail[]): Promise<void> {
    const ids: number[] = indemnity.map(item => item.id);
    const url = this.indemnityConfig.url;
    const token = this.indemnityConfig.token;
    const options = {
      uri: `${url}/supports/update/compensate`,
      json: true,
      method: 'POST',
      body: indemnity.map(item => {
        return { id: item.trackingNumber, paymentMonth: item.month, compensateAmount: item.value };
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: token,
      },
    };
    await request(options);
    await this.indemnityRepo.update({ id: In(ids) }, { sync: true });
    await this.xPushService.sendDingDing('更新OMS售后Indemnity数据', 'bill');
  }

  private async saveFuelRateArray(month, transporter, fuelRateArray) {
    const fuelRateArrayInDB = await this.fuelRateRepo.find({
      select: ['transporterAccountId', 'trackingNumberPrefix', 'value'],
      where: { month, transporter },
    });
    const diffFuelRateArray = fuelRateArray.filter(fuelRate => {
      return !fuelRateArrayInDB.find(
        fuelRateInDB =>
          _.isEqual(fuelRateInDB.transporterAccountId, fuelRate.transporterAccountId) &&
          _.isEqual(fuelRateInDB.trackingNumberPrefix, fuelRate.trackingNumberPrefix) &&
          _.isEqual(+fuelRateInDB.value, +fuelRate.value),
      );
    });
    await this.fuelRateRepo.save(
      diffFuelRateArray.map(fuelRate => {
        return {
          ...fuelRate,
          month,
          transporter,
        };
      }),
    );
  }

  private async _importPurchaseDetailFromCSV(bucket, purchaseDetailUrl, transporter, billType) {
    if ([InvoiceTypeEnum.ccIndemnity, InvoiceTypeEnum.cnIndemnity].includes(billType)) {
      return this.indemnityDetailRepository.importDetailFromS3(bucket, purchaseDetailUrl);
    } else {
      return this.billDetailRepository.importPurchaseDetailFromS3(bucket, purchaseDetailUrl, transporter);
    }
  }

  async fetchExtraFeeDataDetail(wheres: Record<string, string>) {
    const purchaseBill = await this.repo.findOne({
      select: ['id', 'month'],
      where: {
        month:
          wheres.month ||
          moment()
            .add(-1, 'months')
            .format('YYYY-MM'),
        transporterAccountId: wheres.transporterAccountId,
      },
    });
    if (!purchaseBill) {
      return [];
    }
    const result = await this.billDetailRepository.fetchExtraFeeDetailData(purchaseBill.id, wheres.clientId);
    return result.map(item => {
      return {
        month: wheres.month,
        transporterAccountId: wheres.transporterAccountId,
        ...item,
      };
    });
  }

  /**
   * 根据invoiceId 删除bill
   * for 重新解析删除之前的账单记录
   */
  async deleteByInvoiceId(invoiceId: number) {
    return await this.repo.delete({ invoiceId });
  }

  async updateFileForApplication(fileForApplication, sourceFileName) {
    const bill = await this.repo.findOne({ detailFileUrl: Like(`%${sourceFileName}%`) });
    const url = bill.fileForApplication ? bill.fileForApplication + ',' + fileForApplication : fileForApplication;
    await this.repo.update({ id: bill.id }, { fileForApplication: url });
  }

  async getBillByMonth(transporterId, startMonth, endMonth) {
    const where: any = {};
    if (transporterId) {
      where.transporterId = transporterId;
    }
    if (startMonth) {
      where.month = Between(startMonth, endMonth);
    }

    return await this.repo.find({
      where,
      select: [
        'transporterId',
        'month',
        'platform',
        'invoiceNumber',
        'transporterAccountId',
        'amount',
        'ht',
        'vat',
        'indemnity',
        'extraFee',
        'pickupFee',
        'discount',
        'shippingFee',
        'fuelFee',
        'parcelQuantity',
        'totalWeight',
        'shippingFeeAfterRemise',
        'diffFee',
      ],
      order: { month: 'DESC' },
    });
  }
}

function toTree(array, keys: string[]) {
  if (keys.length === 0) {
    return [];
  }
  const key = keys[0];
  return _.chain(array)
    .groupBy(key)
    .map((group, label) => {
      return {
        key: key,
        label: label,
        children: toTree(group, keys.slice(1)),
      };
    })
    .value();
}
