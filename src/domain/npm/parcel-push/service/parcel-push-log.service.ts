import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParcelPushLogRepository } from '@/domain/npm/parcel-push/repository/parcel-push-log.repository';

@Injectable()
export class ParcelPushLogService {
  constructor(
    @InjectRepository(ParcelPushLogRepository) private readonly parcelPushLogRepository: ParcelPushLogRepository,
  ) {}

  async bulkInsert(parcelPushLogArray) {
    return await this.parcelPushLogRepository.bulkInsert(parcelPushLogArray);
  }
}
