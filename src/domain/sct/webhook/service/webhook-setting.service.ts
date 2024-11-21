import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WebhookSetting } from '@/domain/sct/webhook/entity/webhook-setting.entity';
import { Cacheable } from 'type-cacheable';
import { CacheTtlSeconds } from '@/domain/external/cache/cache.service';
import { CrudRequest } from '@nestjsx/crud';
import { DeepPartial } from 'typeorm';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';

@Injectable()
export class WebhookSettingService extends TypeOrmCrudService<WebhookSetting> {
  constructor(@InjectRepository(WebhookSetting) repo, private redisCacheNewService: RedisCacheNewService) {
    super(repo);
  }

  @Cacheable({ cacheKey: args => `WEBHOOK_SETTING_${args[0]}`, ttlSeconds: CacheTtlSeconds.ONE_WEEK })
  async findSettingRedis(platform) {
    return await this.repo.find({ transporter: platform, enabled: true });
  }

  async replaceOne(req: CrudRequest, dto: DeepPartial<WebhookSetting>) {
    const result = super.replaceOne(req, dto);
    await this.deleteCachePattern(dto.transporter);
    return result;
  }

  /**
   * 模糊匹配删除缓存
   * @private
   */
  private async deleteCachePattern(transporter) {
    await this.redisCacheNewService.del(`WEBHOOK_SETTING_${transporter}`, false);
  }
}
