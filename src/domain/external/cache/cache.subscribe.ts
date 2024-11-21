import { Injectable } from '@nestjs/common';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheSubscribe {
  private readonly channel: string = '';
  private readonly db: number;

  constructor(private redisService: RedisCacheNewService, private config: ConfigService) {
    this.db = this.config.get('REDIS_DB');
    this.channel = `__keyevent@${this.db}__:expired`;
  }

  public sub(cb?, channel?: string) {
    if (channel || this.db) {
      this.redisService.sub([channel || this.channel]).then(() => {
        this.redisService.message(cb);
      });
    }
  }
}
