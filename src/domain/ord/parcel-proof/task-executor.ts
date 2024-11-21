import { AccountInfoDto } from '@/domain/ord/parcel-proof/dto/account-info.dto';
import { ReceiverInfoDto } from '@/domain/ord/parcel-proof/dto/receiver-info.dto';

export abstract class TaskExecutor {
  /**
   * 抓取包裹重量截图
   * @param trackingNumber
   * @param accountInfo
   */
  async crawlWeightPicture(
    trackingNumber: string,
    accountInfo: AccountInfoDto,
  ): Promise<{
    buffer: Buffer;
    extension: string;
  }> {
    return null;
  }

  /**
   * 抓取POD证明
   * @param trackingNumber
   * @param accountInfo
   */
  async crawlPod(
    trackingNumber: string,
    accountInfo: AccountInfoDto,
    language?: string,
  ): Promise<{
    buffer: Buffer;
    extension: string;
  }> {
    return null;
  }

  /**
   * 生成POD
   * @param trackingNumber
   * @param receiverInfo
   * @param language
   */
  async generatePod(
    trackingNumber: string,
    receiverInfo: ReceiverInfoDto,
    language?: string,
  ): Promise<{
    buffer: Buffer;
    extension: string;
  }> {
    return null;
  }
}
