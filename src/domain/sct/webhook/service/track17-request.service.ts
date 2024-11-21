import { Inject, Injectable } from '@nestjs/common';
import { Track17RequestRepository } from '../repository/track17-request.repository';

@Injectable()
export class Track17RequestService {
  constructor(@Inject(Track17RequestRepository) private readonly track17RequestRepository: Track17RequestRepository) {}

  async bulkInsert(track17RequestArray) {
    return await this.track17RequestRepository.bulkInsert(track17RequestArray);
  }
}
