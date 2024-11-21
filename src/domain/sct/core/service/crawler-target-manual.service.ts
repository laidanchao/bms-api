import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrawlerTargetManual, TARGET_MANUAL_STATUS } from '@/domain/sct/core/entity/crawler-target-manual.entity';
import { CrawlerTargetManualDto, SiteType } from '@/domain/sct/core/dto/crawler-target-manual.dto';
import XLSX from 'xlsx';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import _ from 'lodash';
import { In } from 'typeorm';
import { BusinessException } from '@/app/exception/business-exception';
import { CrawlerTargetManualRepository } from '@/domain/sct/core/repository/crawler-target-manual.repository';

@Injectable()
export class CrawlerTargetManualService extends TypeOrmCrudService<CrawlerTargetManual> {
  constructor(
    @InjectRepository(CrawlerTargetManualRepository) private crawlerTargetManualRepo: CrawlerTargetManualRepository,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
    private readonly trackingService: TrackingService,
  ) {
    super(crawlerTargetManualRepo);
  }

  /**
   * 校验批量抓取文件并上传
   * 考虑数据量大 用临时表校验包裹是否存在在parcel表中
   * @param file
   */
  async validAndUploadManualTrackingFile(file) {
    // 创建临时表并插入要查询的数据
    const { buffer, originalname } = file;

    const filePath = `tracking/crawlerTargetManual/${new Date().getTime().toString()}-${originalname}`;
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    // defval须给空字符串，表示没有数据的列用空字符串填充
    const csvData: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    const array = _.chain(csvData)
      .map(item => `('${item.trackingNumber}')`)
      .join(',')
      .value();
    if (!array.length) {
      throw new BusinessException('请上传正确的表格!');
    }
    try {
      await this.createTemporaryTable(array);

      // 执行查询并比较数据
      const query = `select temp.tracking_number from manual_temp temp
                  left join ord_parcel_hot p
                  on temp.tracking_number = p.tracking_number
                  where p.tracking_number is null limit 1 `;

      const result = await this.crawlerTargetManualRepo.query(query);

      // 返回报错
      if (result.length) {
        throw new BusinessException(`Fail to upload,parcel (${result[0].tracking_number}) not found in CMS`);
      } else {
        await this.awsService.uploadFile(buffer, filePath, this.configService.get('Bucket').cms);
      }
      return filePath;
    } finally {
      // 删除临时表
      await this.dropTemporaryTable();
    }
  }

  /*
  创建临时表
   */
  private async createTemporaryTable(array): Promise<void> {
    const query = `
      CREATE TEMPORARY TABLE manual_temp (tracking_number varchar(255));

      INSERT INTO manual_temp (tracking_number)
      VALUES  ${array};
    `;

    await this.crawlerTargetManualRepo.query(query);
  }

  /*
  删除临时表
   */
  private async dropTemporaryTable(): Promise<void> {
    const query = `
      DROP TABLE IF EXISTS manual_temp;
    `;
    await this.crawlerTargetManualRepo.query(query);
  }

  /**
   * 处理批量单次爬取轨迹的文件
   * @param body
   */
  async handlerManualTracking(body: CrawlerTargetManualDto) {
    // 解析文件
    const buffer = await this.awsService.download(body.filePath, this.configService.get('Bucket').cms);
    const wb = XLSX.read(buffer, { raw: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const csvData: any[] = XLSX.utils.sheet_to_json(ws, { defval: null });
    const targetManualArray = csvData.map(item => {
      return {
        trackingNumber: item.trackingNumber,
        transporter: body.transporter,
        transporterSite: body.transporterSite || '',
        transporterAccountId: body.transporterAccountId || '',
        filePath: body.filePath,
        status: TARGET_MANUAL_STATUS.READY,
      };
    });
    // 存入数据库
    await this.crawlerTargetManualRepo.bulkInsert(<CrawlerTargetManual[]>targetManualArray);
    // 返回结果
    this.startCrawlerTracking(_.map(csvData, 'trackingNumber'), body).then();
    return 'start crawler tracking';
  }

  /**
   * 抓取批量上传的单号轨迹
   * @param trackingNumberArray
   * @param body: CrawlerTargetManualDto
   */
  async startCrawlerTracking(trackingNumberArray, body: CrawlerTargetManualDto) {
    for (const chunkTrackingNumbers of _.chunk(trackingNumberArray, 200)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const transporter = body.transporter;
      try {
        if (body.transporterSite === SiteType.OSC) {
          await this.trackingService.fetchLatestTrackingByOSC(
            transporter,
            chunkTrackingNumbers,
            body.transporterAccountId,
          );
        } else {
          await this.trackingService.validAndFetchLatestTracking(
            transporter,
            chunkTrackingNumbers,
            body.transporterSite === SiteType.OFFICIAL_SITE,
          );
        }
        await this.crawlerTargetManualRepo.update(
          { trackingNumber: In(chunkTrackingNumbers) },
          {
            status: TARGET_MANUAL_STATUS.SUCCESS,
            filePath: body.filePath,
          },
        );
      } catch (e) {
        await this.crawlerTargetManualRepo.update(
          { trackingNumber: In(chunkTrackingNumbers) },
          {
            status: TARGET_MANUAL_STATUS.FAILED,
            filePath: body.filePath,
            failReason: JSON.stringify(e).slice(0, 200),
          },
        );
      }
    }
  }

  /**
   * 获取当前排队包裹总数
   */
  async getReadyTrackingCount() {
    return await this.crawlerTargetManualRepo.count({ status: TARGET_MANUAL_STATUS.READY });
  }
}
