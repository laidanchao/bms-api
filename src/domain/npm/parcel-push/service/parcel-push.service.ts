import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ParcelPush } from '@/domain/npm/parcel-push/entity/parcel-push.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ParcelPushService extends TypeOrmCrudService<ParcelPush> {
  constructor(@InjectRepository(ParcelPush) repo) {
    super(repo);
  }
}
