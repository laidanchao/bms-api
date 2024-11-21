import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InvoiceTypeEnum, ScbInvoice } from '@/domain/scb/invoice/entities/invoice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { CreateScbInvoiceDto } from '@/domain/scb/invoice/dto/create-scb-invoice.dto';
import { AnalysisStatusEnum } from '@/domain/scb/invoice/entities/invoice.entity';
import { FuelRate } from '@/domain/scb/fuel-rate/entities/fuel-rate.entity';
import moment from 'moment';
import { getRepository, In, Like, MoreThan } from 'typeorm';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';
import { BillDetail } from '@/domain/scb/bill/entity/bill-detail.entity';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import _ from 'lodash';
import { BusinessException } from '@/app/exception/business-exception';
import XLSX from 'xlsx';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { OmsService } from '@/domain/external/oms/oms.service';
import { ParcelAll } from '@/domain/ord/parcel/entity/parcel-all.entity';
import { IndemnityDetail } from '@/domain/scb/bill/entity/indemnity-detail.entity';

@Injectable()
export class ScbInvoiceService extends TypeOrmCrudService<ScbInvoice> {
  private readonly bucketConfig: Record<string, any>;

  constructor(
    @InjectRepository(ScbInvoice) repo,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
    private readonly xPushService: XPushService,
    private readonly omsService: OmsService,
  ) {
    super(repo);
    this.bucketConfig = this.configService.get('Bucket');
  }

  /**
   * 创建法邮账单
   * @param file
   */
  buildCMInvoiceInfo(file) {
    // 拿文件的信息 组装metadata 保存
    const account = file.name.split('.')[1];
    return {
      month: moment
        .tz(file.accessTime, 'Europe/Paris')
        .subtract(1, 'months')
        .format('YYYY-MM'),
      billType: InvoiceTypeEnum.colissimo,
      account,
      originalFileUrl: `invoice/sftp_source_file/${file.sftpAccount}/${account}/${file.name}`,
      uploadOriginalFileAt: moment(file.accessTime)
        .utc()
        .format('YYYY-MM-DD HH:mm:ss Z'),
      transporter: 'COLISSIMO',
      status: AnalysisStatusEnum.surchargeConfirming,
      result: {},
      name: file.name,
      size: file.size,
      sftpAccount: file.sftpAccount,
    };
  }

  /**
   * 上传 invoice 新增一条记录
   */
  async parseInvoice(body: CreateScbInvoiceDto) {
    body.name = body.originalFileUrl.split('/').pop();
    const status = await this.whetherParsing(body);
    if (status === AnalysisStatusEnum.parsing) {
      await this.moveTriggerInvoice(body);
    }
    await this.repo.save({
      ...body,
      uploadOriginalFileAt: moment().toDate(),
      status,
    });
    return 'success';
  }

  /**
   * 人工点击确认额外费，开始解析法邮账单
   * 将账单移到触发解析文件夹
   * @param id 账单id
   */
  async startParseCMInvoice(id: number) {
    const resolveBill = await this.repo.findOne({ where: { id } });
    await this.moveTriggerInvoice(resolveBill);
    await this.repo.update({ id: resolveBill.id }, { status: AnalysisStatusEnum.parsing });
    return '额外费已确认，开始解析账单';
  }

  /**
   * 重新解析 invoice
   */
  async reResolveInvoice(id: number, operator: string) {
    const scbInvoice: CreateScbInvoiceDto = await this.repo.findOne({ where: { id } });
    // cp 需要确认燃油费是否配置
    const status = await this.whetherParsing(scbInvoice);
    await this.repo.update(
      { id: scbInvoice.id },
      {
        status,
        operator,
      },
    );
    if (status === AnalysisStatusEnum.parsing) {
      this.startReParse(scbInvoice).then();
    }
  }

  /**
  开始重新解析
   */
  async startReParse(scbInvoice) {
    try {
      console.log('开始删除');
      const billList = await getRepository(Bill).find({
        select: ['id', 'invoiceId'],
        where: {
          invoiceId: scbInvoice.id,
        },
      });
      const billIds = _.map(billList, 'id');
      if ([InvoiceTypeEnum.ccIndemnity, InvoiceTypeEnum.cnIndemnity].includes(scbInvoice.billType)) {
        await getRepository(IndemnityDetail).delete({ billId: In(billIds) });
      } else {
        await getRepository(BillDetail).delete({ billId: In(billIds) });
      }

      await getRepository(Bill).delete({ invoiceId: scbInvoice.id });
      console.log('结束删除');
      await this.moveTriggerInvoice(scbInvoice);
    } catch (e) {
      await getRepository(ScbInvoice).update(
        { id: scbInvoice.id },
        { status: AnalysisStatusEnum.failed, result: { failReason: e.message } },
      );
      await this.xPushService.sendDingDing(`${scbInvoice.originalFileUrl},账单重新解析失败，${e.message}`, 'bill');
    }
  }

  /**
   * 根据类型判断是否需要配置燃油费才能解析
   * @param body
   */
  async whetherParsing(body: CreateScbInvoiceDto) {
    let status = AnalysisStatusEnum.parsing;
    if (body.billType === InvoiceTypeEnum.colisprive) {
      const fuelRate = await getRepository(FuelRate).findOne({
        where: {
          month: body.month,
          transporter: 'COLISPRIVE',
          isDeleted: false,
        },
      });
      status = !fuelRate || !fuelRate?.value ? AnalysisStatusEnum.fuelRateConfirming : status;
    }
    return status;
  }

  /**
   * 移动账单触发解析
   * @param body
   */
  async moveTriggerInvoice(body) {
    // 用于触发账单解析
    const bucket = this.configService.get('Bucket').cms;
    let targetFilePath = '';
    switch (body.billType) {
      case InvoiceTypeEnum.colisprive:
        targetFilePath = 'COLISPRIVE_INVOICE';
        break;
      case InvoiceTypeEnum.colissimo:
        targetFilePath = 'COLISSIMO_INVOICE';
        break;
      case InvoiceTypeEnum.colicoli:
        targetFilePath = 'COLICOLI_INVOICE';
        break;
      case InvoiceTypeEnum.cainiao:
        targetFilePath = 'CAINIAO_INVOICE';
        break;
      case InvoiceTypeEnum.express37:
        targetFilePath = 'EXPRESS37_INVOICE';
        break;
      case InvoiceTypeEnum.ccIndemnity:
        targetFilePath = 'COLICOLI_INDEMNITY';
        break;
      case InvoiceTypeEnum.cnIndemnity:
        targetFilePath = 'CAINIAO_INDEMNITY';
        break;
      default:
        throw new BusinessException(`出现未知的账单类型${body.billType}`);
    }
    await this.awsService.copyObject({
      targetBucket: bucket,
      targetPath: `serverless/trigger/${targetFilePath}/${body.name}`,
      sourcePath: body.originalFileUrl,
    });
  }

  /**
   * 通知oms出账
   */
  async notifyInvoiceOms(month: string, transporter: string, billType: string, operator: string) {
    const exitOne = await this.repo.count({ month, transporter, billType, isPushed: true });
    if (exitOne) {
      throw new BadRequestException('已通知平台出账，请勿重复');
    }
    await this.omsService.notifyBill(month, transporter, billType);
    await this.repo.update(
      { month, transporter, billType, status: AnalysisStatusEnum.success },
      { isPushed: true, operator },
    );

    return 'success';
  }

  /**
   * 账单根据平台（platform）拆分
   * @param transporter
   * @param originFilePath
   * @param saveRootPath
   * @param startTime 查归档数据
   */
  async splitInvoice(transporter: string, originFilePath: string, saveRootPath: string, startTime = null) {
    const bucket = this.configService.get('Bucket').cms;
    // 获取S3文件
    const fileName = _.last(originFilePath.split('/'));
    const originBuffer = await this.awsService.download(originFilePath, bucket);
    const excelData = this.getExcelData(originBuffer);

    const excelDataWithPlatform = [];
    const result: { platform; filePath; details }[] = [];
    let repository = getRepository(Parcel);
    if (startTime) {
      repository = getRepository(ParcelAll);
    }
    for (const data of _.chunk(excelData, 1000)) {
      const trackingNumbers: string[] = data.map(m => m['trackingNumber']);
      const where = {
        trackingNumber: In(trackingNumbers),
        createdAt: MoreThan(startTime),
      };
      if (!startTime) {
        delete where.createdAt;
      }
      const parcels = await repository.find({
        where,
        select: ['trackingNumber', 'platform'],
      });

      const dataWithPlatform = data.map(m => {
        return {
          ...m,
          platform: parcels.find(f => f.trackingNumber === m['trackingNumber'])?.platform || 'UNKNOWN',
        };
      });
      excelDataWithPlatform.push(...dataWithPlatform);
    }

    const groupExcelData = _.groupBy(excelDataWithPlatform, 'platform');
    for (const platform in groupExcelData) {
      const buffer = this.jsonToExcel(groupExcelData[platform]);
      const timeStamp = moment()
        .utc()
        .format('x');
      const filePath = `${saveRootPath}/${transporter}/${timeStamp}-${platform}-${fileName}`;
      await this.awsService.uploadFile(buffer, filePath, bucket);
      result.push({ platform, filePath, details: groupExcelData[platform] });
    }

    return result;
  }

  private getExcelData(buffer: any): any[] {
    // csv转json
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    // defval须给空字符串，表示没有数据的列用空字符串填充
    const csvData = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (_.isEmpty(csvData)) {
      throw new BusinessException('没有需要解析的数据');
    }
    return csvData;
  }

  private jsonToExcel(data) {
    const book = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(data, { skipHeader: false });
    XLSX.utils.book_append_sheet(book, sheet);
    const buffer = XLSX.write(book, { bookType: 'biff8', type: 'buffer' });
    return buffer;
  }

  async create(invoice) {
    return await this.repo.save(invoice);
  }

  async downloadInvoice(path: string) {
    return await this.awsService.getSignedUrl(path, this.configService.get('Bucket').cms, 60);
  }

  /**
   * 账单解析已完成
   * 将账单移到触发生成销售账单和parquet目录
   */
  async generateCustomsBill(id: number, month: string) {
    const resolveBill = await getRepository(Bill).find({ where: { invoiceId: id } });
    // 用于触发生成销售账单
    const bucket = this.configService.get('Bucket').cms;
    const promises = _.map(resolveBill, async bill => {
      if (bill.detailFileUrl) {
        const purchaseDetailUrlList = bill.detailFileUrl.split(',');
        for (const item of purchaseDetailUrlList) {
          const targetPath = item.replace('purchase_detail_wait_confirm', 'purchase_detail');
          await this.awsService.copyObject({
            targetBucket: bucket,
            targetPath,
            sourcePath: item,
          });
        }
      }
    });
    try {
      await Promise.all(promises);
    } catch (e) {
      // 5.发消息提示
      await this.xPushService.sendDingDing(`${resolveBill[0].detailFileUrl}移动失败`, 'bill');
      throw new BusinessException(`${resolveBill[0].detailFileUrl}移动失败`);
    }
  }

  async updateInvoiceStatus(name: string, status: AnalysisStatusEnum, reason: string) {
    const result = {};
    result['failReason'] = reason;
    return this.repo.update({ name }, { status, result });
  }
}
