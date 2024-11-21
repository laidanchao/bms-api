import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrackingPush } from '@/domain/npm/tracking-push/entities/tracking-push.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CrudRequest, Override } from '@nestjsx/crud';

@Injectable()
export class TrackingPushService extends TypeOrmCrudService<TrackingPush> {
  constructor(@InjectRepository(TrackingPush) private trackingPushRepository: Repository<TrackingPush>) {
    super(trackingPushRepository);
  }

  @Override()
  async createOne(req: CrudRequest, dto: DeepPartial<TrackingPush>): Promise<TrackingPush> {
    dto.clientId = dto.clientId || '';
    return super.createOne(req, dto);
  }

  @Override()
  async updateOne(req: CrudRequest, dto: DeepPartial<TrackingPush>): Promise<TrackingPush> {
    dto.clientId = dto.clientId || '';
    return super.updateOne(req, dto);
  }
}
