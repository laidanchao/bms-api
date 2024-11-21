import { Inject, Injectable } from '@nestjs/common';
import { ParcelPushRequestRepository } from '@/domain/npm/parcel-push/repository/parcel-push-request.repository';

@Injectable()
export class ParcelPushRequestService {
  constructor(
    @Inject(ParcelPushRequestRepository) private readonly parcelPushRequestRepository: ParcelPushRequestRepository,
  ) {}

  async find(options) {
    return await this.parcelPushRequestRepository.find(options);
  }

  async delete(options) {
    return await this.parcelPushRequestRepository.delete(options);
  }

  async bulkInsert(parcelArray) {
    return await this.parcelPushRequestRepository.bulkInsert(parcelArray);
  }

  async insert(parcel) {
    return await this.parcelPushRequestRepository.insert(parcel);
  }
}
