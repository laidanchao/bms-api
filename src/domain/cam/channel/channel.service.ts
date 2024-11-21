import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import { Injectable } from '@nestjs/common';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';
import { CrudRequest, Override } from '@nestjsx/crud';
import { DeepPartial } from 'typeorm';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import _ from 'lodash';

@Injectable()
export class ChannelService extends TypeOrmCrudService<CamChannel> {
  constructor(
    @InjectRepository(CamChannel) repo,
    private nacosRepository: NacosRepository,
    private xPushService: XPushService,
  ) {
    super(repo);
  }

  @Override()
  async createOne(req: CrudRequest, dto: DeepPartial<CamChannel>): Promise<CamChannel> {
    const result = await super.createOne(req, dto);
    await this.nacosRepository.setChannelConfig();
    return result;
  }

  @Override()
  async replaceOne(req, dto) {
    const result = await super.replaceOne(req, dto);
    await this.nacosRepository.setChannelConfig();
    return result;
  }

  /**
   * @param platform
   */
  getList(platform: string) {
    const channel = this.nacosRepository.getChannelConfig();
    return _.chain(channel)
      .filter(it => it.platform === platform)
      .map('code')
      .value();
  }

  /**
   * 更新渠道的寄件人配置
   * @param channel
   * @param senderAddressCode
   * @param platform
   */
  async setSenderAddressCode(channel: string, senderAddressCode: string, platform: string) {
    const result = await this.repo.update({ code: channel, platform: platform }, { senderAddressCode });
    if (result.affected > 0) {
      await this.nacosRepository.setChannelConfig();
      await this.xPushService.sendDingDing(`渠道 ${channel} 默认寄件人配置已更新为 ${senderAddressCode} `, 'default');
      return 'success';
    }
    return;
  }
}
