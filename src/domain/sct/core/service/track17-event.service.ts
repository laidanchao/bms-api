import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { Track17Event } from '@/domain/sct/webhook/entity/track17-event.entity';
import _ from 'lodash';
import { DeepPartial, getRepository, IsNull, Not } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';

@Injectable()
export class Track17EventService extends TypeOrmCrudService<Track17Event> {
  private key = 'TRACK17_EVENTS';
  constructor(@InjectRepository(Track17Event) repo, private redisCacheNewService: RedisCacheNewService) {
    super(repo);
  }

  async createOne(req: CrudRequest, dto: DeepPartial<Track17Event>) {
    const result = super.createOne(req, dto);
    await this.redisCacheNewService.del(this.key);
    return result;
  }

  async replaceOne(req: CrudRequest, dto: DeepPartial<Track17Event>) {
    const result = super.replaceOne(req, dto);
    await this.redisCacheNewService.del(this.key);
    return result;
  }

  async getEvents() {
    const events = await this.redisCacheNewService.get(this.key);
    if (!_.isEmpty(events)) {
      return JSON.parse(events);
    }

    const track17Events = await getRepository(Track17Event).find({ type: Not(IsNull()) });
    await this.redisCacheNewService.set(this.key, JSON.stringify(track17Events));
    return track17Events;
  }
}
