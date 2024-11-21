import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { Cacheable } from 'type-cacheable';
import { CacheTtlSeconds } from '@/domain/external/cache/cache.service';
import { SsmSystemVariable } from './system-variable.entity';

@Injectable()
export class SystemVariableService extends TypeOrmCrudService<SsmSystemVariable> {
  constructor(@InjectRepository(SsmSystemVariable) repo) {
    super(repo);
  }

  @Cacheable({ cacheKey: args => `DICTIONARY_${args[0]}`, ttlSeconds: CacheTtlSeconds.ONE_WEEK })
  async findByKey(key: string) {
    return super.findOne({ key });
  }

  async getValue(key: string, defaultValue = ''): Promise<string> {
    const dict = await this.findByKey(key);
    return dict.value || defaultValue;
  }
}
