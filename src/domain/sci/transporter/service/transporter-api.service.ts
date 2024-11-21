import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { TransporterApi } from '@/domain/sci/transporter/entities/transporter-api.entity';
import { CrudRequest } from '@nestjsx/crud';
import { DeepPartial } from 'typeorm';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { CacheClear } from 'type-cacheable';

@Injectable()
export class TransporterApiService extends TypeOrmCrudService<TransporterApi> {
  constructor(@InjectRepository(TransporterApi) repo, private redisCacheNewService: RedisCacheNewService) {
    super(repo);
  }

  @CacheClear({ cacheKey: 'CMS_TRANSPORTER_API', isPattern: true })
  async createOne(req: CrudRequest, dto: DeepPartial<TransporterApi>) {
    return super.createOne(req, dto);
  }

  @CacheClear({ cacheKey: 'CMS_TRANSPORTER_API', isPattern: true })
  async replaceOne(req: CrudRequest, dto: DeepPartial<TransporterApi>) {
    return super.replaceOne(req, dto);
  }
}
