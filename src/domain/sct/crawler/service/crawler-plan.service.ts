import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrawlerPlan } from '@/domain/sct/crawler/entity/crawler-plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CrawlerPlanRepository } from '@/domain/sct/crawler/repository/crawler-plan.repository';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { CrawlerPlanCreateDTO } from '@/domain/sct/crawler/dto/crawler-plan-create.dto';
import { SctService } from '@/domain/utils/sct.service';
import { Between, getManager, getRepository, In, LessThan, LessThanOrEqual, MoreThan, Not } from 'typeorm';
import { CrawlerTarget } from '@/domain/sct/crawler/entity/crawler-target.entity';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { BusinessException } from '@/app/exception/business-exception';
import { CrawlerConfigService } from '@/domain/sct/crawler/service/crawler-config.service';
import moment from 'moment/moment';
import _ from 'lodash';
import { FindConditions } from 'typeorm/find-options/FindConditions';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';

const logger = new Logger('crawler-plan-service');

@Injectable()
export class CrawlerPlanService extends TypeOrmCrudService<CrawlerPlan> {
  constructor(
    @InjectRepository(CrawlerPlanRepository) private crawlerPlanRepository: CrawlerPlanRepository,
    private readonly aws: AwsService,
    private readonly configService: ConfigService,
    private readonly crawlerConfigService: CrawlerConfigService,
    private readonly xPushService: XPushService,
  ) {
    super(crawlerPlanRepository);
  }

  async save(crawlerPlan) {
    return await this.crawlerPlanRepository.save(crawlerPlan);
  }

  async update(options, crawlerPlan) {
    return await this.crawlerPlanRepository.update(options, crawlerPlan);
  }

  async insert(crawlerPlan) {
    return await this.crawlerPlanRepository.insert(crawlerPlan);
  }

  async getSignatureUrl(id) {
    const crawlerPlan = await this.repo.findOne(id);
    if (!crawlerPlan) {
      throw new NotFoundException('The crawler plan not found!');
    }
    return this.aws.getSignedUrl(crawlerPlan.filePath, this.configService.get('Bucket.cms'), 900);
  }

  async createCrawlerPlan(dto: CrawlerPlanCreateDTO) {
    //trackingNumber 必须都在parcel表，不在需要找出并报错
    dto.trackingNumbers = _.uniq(dto.trackingNumbers);
    const crawlerParcel = await getRepository(Parcel).find({
      where: {
        trackingNumber: In(dto.trackingNumbers),
      },
      select: ['trackingNumber', 'shippingNumber', 'transporterAccountId', 'receiverPostalCode'],
    });
    if (crawlerParcel.length !== dto.trackingNumbers.length) {
      const notExistTrackingNumber = _.difference(
        dto.trackingNumbers,
        crawlerParcel.map(it => it.trackingNumber),
      );
      throw new BusinessException(`Fail to crawl,parcel (${notExistTrackingNumber.join(',')}) not found in CMS`);
    }
    const { filePath, csv } = await SctService.buildCsvAndPath(
      crawlerParcel,
      dto.transporter,
      dto.schedule,
      dto.platform,
      dto.official ? 'official' : 'unofficial',
    );
    await this.aws.uploadFile(csv, filePath, this.configService.get('Bucket.cms'));
    //需要根据爬虫配置生成大于当前时间的plan
    const trackingPlans = await this.createdPlanByConfig(dto, filePath);
    trackingPlans.push({
      transporter: dto.transporter,
      filePath,
      schedule: dto.schedule,
      status: 'READY',
      result: `0/0/${dto.trackingNumbers.length}`,
      automatic: false,
      platform: dto.platform,
      official: dto.official,
    });
    await getManager().transaction(async manager => {
      await manager.getRepository(CrawlerPlan).save(trackingPlans);
      const crawlerTargetArray: Array<any> = crawlerParcel.map(parcel => {
        return {
          transporter: dto.transporter,
          filePath,
          trackingNumber: parcel.trackingNumber,
          shippingNumber: parcel.shippingNumber,
          maxCount: dto.maxTimes,
          status: 'READY',
          count: 0,
          active: true,
          transporterAccountId: parcel.transporterAccountId,
          trackAimStatus: dto.trackAimStatus,
          receiverPostalCode: parcel.receiverPostalCode,
        };
      });
      await manager.getRepository(CrawlerTarget).save(crawlerTargetArray, { chunk: 1000 });
    });
    return 'success';
  }

  /**
   * 手动生成plan需要根据爬虫配置生成大于当前时间的plan
   * @param dto
   * @param filePath
   */
  async createdPlanByConfig(dto: CrawlerPlanCreateDTO, filePath) {
    const date = moment().format('YYYY-MM-DD');
    const hour = moment().format('HH:mm:ss');
    const crawlerConfig = await this.crawlerConfigService.findOne({
      where: {
        enabled: true,
        transporter: dto.transporter,
        platform: In([dto.platform, '*']),
      },
    });
    const executeMultiplePoints = crawlerConfig.multiplePoints.filter(time => time > hour);
    const trackingPlans = [];
    for (const pointTime of executeMultiplePoints) {
      const schedule = `${date} ${pointTime}`;
      const trackingPlan = {
        transporter: dto.transporter,
        filePath,
        schedule,
        status: 'READY',
        result: `0/0/${dto.trackingNumbers.length}`,
        platform: dto.platform,
        official: dto.official,
      };
      trackingPlans.push(trackingPlan);
    }
    return trackingPlans;
  }

  async findByWhere(options) {
    return await this.crawlerPlanRepository.find(options);
  }

  /**
   * 获取一条可爬取的计划
   * @param jobName
   * @param transporter
   */
  async takeCrawlerPlan(jobName: string, transporter = null, official = false) {
    const oneMonthAgo = moment()
      .subtract(1, 'months')
      .format();

    const where: FindConditions<CrawlerPlan>[] = [
      {
        schedule: LessThan(moment().utc()),
        status: 'READY',
        createdAt: MoreThan(oneMonthAgo),
      },
    ];

    if (transporter) {
      where[0].transporter = transporter;
      where[0].official = official;
    } else {
      //没有transporter时，获取'COLISSIMO','CAINIAO','CTT','COLISPRIVE','ASENDIA'以外的计划,或者是MONDIAL_RELAY官网的爬虫计划
      where.push({
        ...where[0],
        transporter: 'MONDIAL_RELAY',
        official: true,
      });

      const transporters = await getRepository(Transporter).find({
        where: {
          id: Not(In(['COLISSIMO', 'CAINIAO', 'CTT', 'COLISPRIVE', 'MONDIAL_RELAY', 'ASENDIA'])),
        },
        select: ['id'],
      });
      where[0].transporter = In(transporters.map(m => m.id));
    }

    const trackingPlan = await this.crawlerPlanRepository.findOne({
      where,
      order: {
        schedule: 'ASC',
        id: 'ASC',
      },
    });
    if (!trackingPlan) {
      return null;
    }

    // 检查正在运行的包裹数量
    const runningParcelQuantity = await this._countRunningParcelQuantityIn20Minutes(trackingPlan);
    const currentPlanParcelQuantity = _.toNumber(trackingPlan.result.split('/').pop());
    const maximumQuantity = 70000;
    if (runningParcelQuantity + currentPlanParcelQuantity > maximumQuantity) {
      const judgment = `正在执行${runningParcelQuantity} + 等待执行${currentPlanParcelQuantity} > ${maximumQuantity}`;

      console['warn'](`${jobName}:当前任务队列已满(${judgment})，请稍后重试! `);
      return null;
    }

    // 更新这个任务的状态为 “执行中”
    await this.crawlerPlanRepository.update({ id: trackingPlan.id }, { status: 'RUNNING' });
    return trackingPlan;
  }

  async createNextCrawlerPlan(trackingPlan) {
    const hasNextPlanBool = await this._checkWhetherHasNextPlan(trackingPlan.filePath);
    if (hasNextPlanBool) {
      return;
    }
    await this._nextCrawlerPlan(trackingPlan);
  }

  private async _countRunningParcelQuantityIn20Minutes(trackingPlan) {
    const trackingPlanArray = await this.crawlerPlanRepository.find({
      select: ['result'],
      where: {
        schedule: LessThanOrEqual(trackingPlan.schedule),
        status: 'RUNNING',
        updatedAt: Between(
          moment()
            .add(-20, 'minutes')
            .toDate(),
          moment().toDate(),
        ),
      },
    });
    return _.sumBy(
      trackingPlanArray.map(trackingPlan => trackingPlan.result),
      result => _.toNumber(result.split('/').pop()),
    );
  }

  private async _checkWhetherHasNextPlan(filePath) {
    const readyCrawlerPlan = await this.crawlerPlanRepository.find({
      where: {
        filePath,
        status: 'READY',
      },
    });
    return !!(readyCrawlerPlan && readyCrawlerPlan.length);
  }

  private async _nextCrawlerPlan(crawlerPlan: any) {
    const targetCount = await getRepository(CrawlerTarget).count({ filePath: crawlerPlan.filePath, active: true });
    if (targetCount === 0) {
      await this.crawlerPlanRepository.update(
        { filePath: crawlerPlan.filePath, status: 'READY' },
        { status: 'DONE', endAt: new Date(), comment: '所有包裹均满足到达或者最大爬取次数，任务置为结束！' },
      );
      logger.log(`filePath [${crawlerPlan.filePath}] is done`);
    } else {
      logger.log('当日计划执行结束，生成明日计划');
      const crawlerConfig = await this.crawlerConfigService.findOne({
        transporter: crawlerPlan.transporter,
        platform: In([crawlerPlan.platform, '*']),
        enabled: true,
        official: crawlerPlan.official,
      });
      if (crawlerConfig) {
        await this.insertIntoCrawlerPlan(
          crawlerConfig.multiplePoints,
          crawlerConfig.transporter,
          crawlerPlan.platform,
          crawlerPlan.filePath,
          crawlerPlan.result,
          crawlerPlan.official,
          moment()
            .add(1, 'days')
            .format('YYYY-MM-DD'),
        );
      }
    }
  }

  /**
   * 第一次生成爬虫计划/当天爬虫计划执行后生成下一次（明天）的爬虫计划
   * @param executeMultiplePoints
   * @param transporter
   * @param platform
   * @param filePath
   * @param result
   * @param crawlerExecuteDate
   * @private
   */
  async insertIntoCrawlerPlan(
    executeMultiplePoints,
    transporter,
    platform,
    filePath,
    result,
    official,
    crawlerExecuteDate,
  ): Promise<boolean> {
    try {
      const trackingPlans = [];
      for (const pointTime of executeMultiplePoints) {
        const schedule = `${crawlerExecuteDate} ${pointTime}`;
        const trackingPlan = {
          transporter,
          filePath,
          schedule,
          status: 'READY',
          result,
          platform,
          official,
        };
        trackingPlans.push(trackingPlan);
      }
      await this.crawlerPlanRepository.insert(trackingPlans);
      return true;
    } catch (e) {
      this.xPushService
        .sendDingDing(`transporter: ${transporter} 的任务创建失败，异常信息为：${e.message}`, 'tracking')
        .then();
      return false;
    }
  }
}
