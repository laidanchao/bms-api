import { BaseRepository } from '@/domain/base/repository/base.repository';
import { Event } from '@/domain/sct/core/entity/event.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(Event)
export class EventRepository extends BaseRepository<Event> {
  async createOrIgnore(trackingEventArray) {
    return await this.createQueryBuilder()
      .insert()
      .into(Event)
      .values(trackingEventArray)
      .orIgnore()
      .execute();
  }
}
