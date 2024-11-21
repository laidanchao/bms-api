import { TaskExecutor } from '@/domain/ord/parcel-proof/task-executor';
import { Logger } from '@nestjs/common';
import { AccountInfoDto } from '@/domain/ord/parcel-proof/dto/account-info.dto';
import axios from 'axios';
import _ from 'lodash';

export class ColiColiExecutor extends TaskExecutor {
  private logger = new Logger('ColiColiExecutor');
  private baseUrl = process.env.NODE_ENV.includes('production')
    ? 'http://gateway-v2-api.import-production'
    : 'http://gateway-v2-api.import-staging';

  async crawlPod(
    trackingNumber: string,
    accountInfo: AccountInfoDto,
  ): Promise<{
    buffer: Buffer;
    extension: string;
  }> {
    try {
      const url = `${this.baseUrl}/api/cc/shipment/downloadPod/${trackingNumber}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accountInfo.jwtToken}`,
        },
      });
      const { code, message, data: podUrl } = response.data;
      if (code !== 200) {
        throw new Error(message);
      }

      const { data: buffer } = await axios.get(podUrl, { responseType: 'arraybuffer' });
      return {
        buffer,
        extension: _.last(podUrl.split('.')),
      };
    } catch (e) {
      this.logger.error(e.stack || e.message);
      throw e;
    }
  }
}
