import { Injectable } from '@nestjs/common';
import { NacosConfigClient } from 'nacos';
import { ConfigService } from '@nestjs/config';
import { getConnection, getRepository } from 'typeorm';
import { Platform } from '@/domain/base/ssm/platform/entities/platform.entity';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { ConfigDataIdEnum } from '@/domain/external/aws/enum/config-data-id.enum';
import { AddressRestriction } from '@/domain/cam/address-restriction/entity/address-restriction.entity';
import { LastmileProviderIdentification } from '@/domain/sci/lastmile-provider/entity/lastmile-provider-identification.entity';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import { LabelFormat } from '@/domain/sci/transporter/entities/label-format.entity';
import { TransporterProduct } from '@/domain/sci/transporter/entities/transporter-product.entity';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { CamSenderAddress } from '@/domain/cam/sender-address/entity/sender-address.entity';

@Injectable()
export class NacosService {
  private nacosConfigClient: NacosConfigClient;
  private nacosSetting: any = {};
  private masterQueryRunner = getConnection().createQueryRunner('master');

  constructor(private readonly configService: ConfigService, private readonly xPushService: XPushService) {
    this.nacosSetting = this.configService.get('Nacos');

    this.nacosConfigClient = new NacosConfigClient({
      serverAddr: this.nacosSetting.serverAddr,
      ssl: true,
      namespace: this.nacosSetting.namespace,
      username: this.nacosSetting.username,
      password: this.nacosSetting.password,
      requestTimeout: 6000,
    });
  }

  /**
   *  获取远程数据
   * @param dataId
   * @param group
   */
  async getConfig(dataId: string, group = 'CMS_GROUP') {
    try {
      const content = await this.nacosConfigClient.getConfig(dataId, group);
      return JSON.parse(content);
    } catch (error) {
      await this.xPushService.sendDingDing(`Error fetching Nacos config: ${error?.message}`);
    }
  }

  /**
   * 监听远程数据
   * @param dataId
   * @param listener
   * @param group
   */
  subscribe(dataId: string, listener: (newConfig: any) => void, group = 'CMS_GROUP'): void {
    try {
      this.nacosConfigClient.subscribe(
        {
          dataId,
          group,
        },
        listener,
      );
    } catch (error) {
      console.error('Error subscribe config:', error);
    }
  }

  async setAddressRestrictionConfig() {
    const addressRestrictions = await getRepository(AddressRestriction)
      .createQueryBuilder('r')
      .setQueryRunner(this.masterQueryRunner)
      .where('r.isActive is true')
      .getMany();
    await this.publishSingle(ConfigDataIdEnum.ADDRESS_RESTRICTION, addressRestrictions);
  }

  async setLastmileProviderIdentificationConfig() {
    const lastmileProviderIdentifications = await getRepository(LastmileProviderIdentification)
      .createQueryBuilder()
      .setQueryRunner(this.masterQueryRunner)
      .getMany();
    await this.publishSingle(ConfigDataIdEnum.LASTMILE_PROVIDER_IDENTIFICAITON, lastmileProviderIdentifications);
  }

  async setChannelConfig() {
    const channels = await getRepository(CamChannel)
      .createQueryBuilder()
      .setQueryRunner(this.masterQueryRunner)
      .getMany();
    await this.publishSingle(ConfigDataIdEnum.CHANNEL, channels);
  }

  async setAccountConfig() {
    const accounts = await getRepository(Account)
      .createQueryBuilder()
      .setQueryRunner(this.masterQueryRunner)
      .getMany();
    await this.publishSingle(ConfigDataIdEnum.ACCOUNT, accounts);
  }

  async setLabelFormatConfig() {
    const labelFormats = await getRepository(LabelFormat)
      .createQueryBuilder()
      .setQueryRunner(this.masterQueryRunner)
      .getMany();
    await this.publishSingle(ConfigDataIdEnum.LABEL_FORMAT, labelFormats);
  }

  async setProductConfig() {
    const transporterProducts = await getRepository(TransporterProduct)
      .createQueryBuilder()
      .setQueryRunner(this.masterQueryRunner)
      .getMany();
    await this.publishSingle(ConfigDataIdEnum.TRANSPORTER_PRODUCT, transporterProducts);
  }

  async setTransporterConfig() {
    const transporters = await getRepository(Transporter)
      .createQueryBuilder()
      .setQueryRunner(this.masterQueryRunner)
      .getMany();
    await this.publishSingle(ConfigDataIdEnum.TRANSPORTER, transporters);
  }

  async setPlatformConfig() {
    const platforms = await getRepository(Platform)
      .createQueryBuilder()
      .setQueryRunner(this.masterQueryRunner)
      .getMany();
    await this.publishSingle(ConfigDataIdEnum.PLATFORM, platforms);
  }

  async setSenderAddressConfig() {
    const senderAddress = await getRepository(CamSenderAddress)
      .createQueryBuilder()
      .setQueryRunner(this.masterQueryRunner)
      .getMany();
    await this.publishSingle(ConfigDataIdEnum.SENDER_ADDRESS, senderAddress);
  }

  /**
   *  修改远程数据
   * @param dataId
   * @param content
   * @param group
   */
  async publishSingle(dataId: string, content: any, group = 'CMS_GROUP') {
    try {
      await this.nacosConfigClient.publishSingle(dataId, group, JSON.stringify(content));
    } catch (error) {
      console.error('Error publishSingle config:', error);
    }
  }
}
