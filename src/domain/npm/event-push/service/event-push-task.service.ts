import { Injectable, Post } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, In, MoreThan, Repository } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { BusinessException } from '@/app/exception/business-exception';
import _ from 'lodash';
import { EventPushTask, EventPushTaskStatus } from '@/domain/npm/event-push/entity/event-push-task.entity';
import { excelToJson } from '@/domain/utils/util';
import moment from 'moment';
import { EventCode, EventPushRequest, EventPushStatus } from '@/domain/npm/event-push/entity/event-push-request.entity';
import { UserDto } from '@/app/decorators/user.decorator';
import { Event } from '@/domain/sct/core/entity/event.entity';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { GetManyDefaultResponse } from '@nestjsx/crud/lib/interfaces';

@Injectable()
export class EventPushTaskService extends TypeOrmCrudService<EventPushTask> {
  private ThreeMonthAgo = moment()
    .subtract(3, 'month')
    .startOf('day')
    .format('YYYY-MM-DD');

  constructor(
    @InjectRepository(EventPushTask) private repository: Repository<EventPushTask>,
    private readonly xPushService: XPushService,
    private readonly trackingService: TrackingService,
  ) {
    super(repository);
  }

  /**
   * 批量导入
   * @param file
   * @param user
   */
  async bulkInsert(file: any, user: UserDto) {
    // 校验并保存文件
    const { parcels, trackingNumbers } = await this.bulkInsertValidate(file, user);
    const details = await getRepository(EventPushRequest).find({
      where: {
        trackingNumber: In(trackingNumbers),
        createdAt: MoreThan(this.ThreeMonthAgo),
        status: In([EventPushStatus.PUSHED, EventPushStatus.TO_BE_PUSHED]),
      },
    });

    const platform = parcels[0].platform;
    const client = parcels[0].clientId;

    const task = await getRepository(EventPushTask).save({
      platform,
      client,
      status: EventPushTaskStatus.TO_BE_PUSHED,
      parcelQuantity: trackingNumbers.length,
      createdBy: user.userName,
    });

    const taskDetails = [];
    for (const trackingNumber of trackingNumbers) {
      const taskDetail = EventPushRequest.create({
        trackingNumber,
        eventCode: EventCode.COM_CLI,
        eventTime: new Date(),
        status: EventPushStatus.TO_BE_PUSHED,
        platform: platform,
        taskId: task.id,
        failedReason: null,
      });
      const parcel = parcels.find(f => f.trackingNumber === trackingNumber);
      const detail = details.find(f => f.trackingNumber === trackingNumber);

      if (!parcel) {
        taskDetail.status = EventPushStatus.FAILED;
        taskDetail.failedReason = '包裹不存在';
      } else if (detail) {
        taskDetail.status = EventPushStatus.FAILED;
        taskDetail.failedReason = '已存在虚仓轨迹';
      } else if (parcel.transporter !== 'COLISSIMO') {
        taskDetail.status = EventPushStatus.FAILED;
        taskDetail.failedReason = '仅支持COLISSIMO推送虚仓轨迹';
      }

      taskDetails.push(taskDetail);
    }

    await getRepository(EventPushRequest).save(taskDetails, { chunk: 200 });

    const trackingEvent = await getRepository(Event).findOne({ event: EventCode.COM_CLI.toString() });
    const trackingArray = taskDetails.map(taskDetail => {
      return {
        trackingNumber: taskDetail.trackingNumber,
        event: taskDetail.eventCode.toString(),
        timestamp: taskDetail.eventTime,
        description: trackingEvent.fr,
      };
    });

    const insertedIds = await this.trackingService.bulkInsert(trackingArray);
    if (_.isEmpty(insertedIds)) {
      throw new BusinessException('添加失败');
    }
    const successTrackingNumbers = (await getRepository(Tracking).findByIds(insertedIds)).map(m => m.trackingNumber);
    await this.xPushService.kafkaEnqueue('handle-tracking-new', { trackingNumbers: successTrackingNumbers });
  }

  /**
   * 批量导入校验
   * @param file
   * @param user
   * @private
   */
  private async bulkInsertValidate(file: any, user: UserDto) {
    const { buffer, originalname } = file;
    const excelData = excelToJson(buffer);

    if (_.isEmpty(excelData)) {
      throw new BusinessException('文件中没有数据');
    }

    const trackingNumbers = excelData.map(m => m['trackingNumber']);
    const parcels = await getRepository(Parcel).find({
      where: {
        trackingNumber: In(trackingNumbers),
        createdAt: MoreThan(this.ThreeMonthAgo),
      },
    });

    if (_.isEmpty(parcels)) {
      throw new BusinessException('包裹不存在');
    }

    const clients = _.chain(parcels)
      .groupBy(parcels, 'clientId')
      .keys()
      .value();
    if (clients.length > 1) {
      throw new BusinessException('只能提交同一个客户的任务');
    }

    return {
      parcels,
      trackingNumbers,
    };
  }

  async findList(body: {
    platform: string;
    client: string;
    startDate: string;
    endDate: string;
    trackingNumbers: string[];
    page: number;
    limit: number;
  }): Promise<GetManyDefaultResponse<EventPushTask>> {
    const { platform, client, startDate, endDate, trackingNumbers, page, limit } = body;
    let where = '1=1';

    if (platform) {
      where += ` and task.platform = '${platform}'`;
    }

    if (client) {
      where += ` and task.client = '${client}'`;
    }

    if (startDate) {
      where += ` and task.createdAt between '${startDate}' and '${endDate}'`;
    }

    if (!_.isEmpty(trackingNumbers)) {
      const trackingNumberStr = trackingNumbers.map(m => `'${m}'`).toString();
      where += ` and detail.trackingNumber in (${trackingNumberStr})`;
    }

    const [tasks, totalCount] = await this.repository
      .createQueryBuilder('task')
      .leftJoin(EventPushRequest, 'detail', 'task.id = detail.taskId')
      .where(where)
      .distinct(true)
      .orderBy({
        'task.createdAt': 'DESC',
      })
      .limit(limit)
      .offset((page - 1) * limit)
      .getManyAndCount();

    return {
      data: tasks,
      page,
      count: totalCount,
      pageCount: Math.ceil(totalCount / limit),
      total: totalCount,
    };
  }
}
