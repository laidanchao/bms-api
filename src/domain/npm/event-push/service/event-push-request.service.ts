import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventPushRequest, EventPushStatus } from '../entity/event-push-request.entity';
import { DeepPartial, getRepository, Repository } from 'typeorm';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { Event } from '@/domain/sct/core/entity/event.entity';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { BusinessException } from '@/app/exception/business-exception';
import _ from 'lodash';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { EventPushTask, EventPushTaskStatus } from '@/domain/npm/event-push/entity/event-push-task.entity';
import { UserDto } from '@/app/decorators/user.decorator';

@Injectable()
export class EventPushRequestService extends TypeOrmCrudService<EventPushRequest> {
  constructor(
    @InjectRepository(EventPushRequest) private repository: Repository<EventPushRequest>,
    private readonly xPushService: XPushService,
    private readonly trackingService: TrackingService,
  ) {
    super(repository);
  }

  /**
   * 添加轨迹节点，并添加tracking记录
   * @param req
   * @param dto
   */
  async create(dto: DeepPartial<EventPushRequest>, user: UserDto): Promise<EventPushRequest> {
    const parcel = await getRepository(Parcel).findOne({
      where: {
        trackingNumber: dto.trackingNumber,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    if (!parcel) {
      throw new BusinessException('包裹不存在');
    }
    if (!parcel.platform) {
      throw new BusinessException('platform有误');
    }
    const tackingEvent = await getRepository(Event).findOne({ event: dto.eventCode });

    const tracking = Tracking.create({
      trackingNumber: dto.trackingNumber,
      event: dto.eventCode,
      timestamp: dto.eventTime,
      description: tackingEvent.fr,
      transporter: parcel.transporter,
    });

    const insertedIds = await this.trackingService.bulkInsert([tracking]);
    if (!_.isEmpty(insertedIds)) {
      await this.xPushService.kafkaEnqueue('handle-tracking-new', { trackingNumbers: [dto.trackingNumber] });
    }

    const task = await getRepository(EventPushTask).save({
      platform: parcel.platform,
      client: parcel.clientId,
      status: EventPushTaskStatus.TO_BE_PUSHED,
      parcelQuantity: 1,
      createdBy: user.userName,
    });

    dto.platform = parcel.platform;
    dto.taskId = task.id;
    dto.status = EventPushStatus.TO_BE_PUSHED;
    return this.repository.save(dto);
    // return super.createOne(req, dto);
  }
}
