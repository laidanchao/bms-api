import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CmsEvent } from '@/domain/sct/core/entity/cms-event.entity';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { CrudRequest } from '@nestjsx/crud';
import { DeepPartial } from 'typeorm';

@Injectable()
export class CmsEventService extends TypeOrmCrudService<CmsEvent> {
  private key = 'CMSEVENTS';
  constructor(@InjectRepository(CmsEvent) repo, private redisCacheNewService: RedisCacheNewService) {
    super(repo);
  }

  async createOne(req: CrudRequest, dto: DeepPartial<CmsEvent>) {
    const result = super.createOne(req, dto);
    await this.clearCache();
    return result;
  }

  async replaceOne(req: CrudRequest, dto: DeepPartial<CmsEvent>) {
    const result = super.replaceOne(req, dto);
    await this.clearCache();
    return result;
  }

  /**
   * 获取所有描述映射的数据
   */
  async getCmsEventData() {
    const cmsEvents = await this.redisCacheNewService.get(this.key);
    if (cmsEvents) {
      return JSON.parse(cmsEvents);
    }

    const data = await this.repo.find();
    await this.redisCacheNewService.set(this.key, JSON.stringify(data));
    return data;
  }

  async clearCache() {
    await this.redisCacheNewService.del(this.key);
  }
}
