import { NormalJob } from '@/domain/job/base/normal.job';
import { Injectable } from '@nestjs/common';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';

@Injectable()
export class DingtalkJob extends NormalJob {
  constructor(private xPushService: XPushService, private redis: RedisCacheNewService) {
    super();
  }

  async execute(options?) {
    const { count } = options;
    const result = await this.redis.multiExec('exception', count || 50);
    if (result[0][0]) {
      const content = `### redis 读取exception数据异常 \n\n` + `* ${result[0][0].toString()}`;
      await this.xPushService.sendDingDing(content, 'it_robot');
    }
    const messages = result[0][1];
    if (messages.length > 0) {
      const content =
        `### 异常信息提示 \n\n` +
        messages
          .map(m => {
            return `*  ${m} `;
          })
          .join('\n ');
      await this.xPushService.sendDingDing(content, 'it_robot');
      await this.redis.sRem('exception', messages);
    }
  }
}
