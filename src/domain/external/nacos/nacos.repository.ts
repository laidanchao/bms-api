import { Injectable, OnModuleInit } from '@nestjs/common';
import { NacosService } from '@/domain/external/nacos/nacos.service';
import { ConfigDataIdEnum } from '../aws/enum/config-data-id.enum';
import _ from 'lodash';

@Injectable()
export class NacosRepository implements OnModuleInit {
  // 收件限制配置
  private addressRestrictionConfig: any;
  // 尾程派送商识别配置
  private lastmileProviderIdentificationConfig: any;
  // 渠道配置
  private channelConfig: any;
  // 账号配置
  private accountConfig: any;
  // 派送商产品码配置
  private transporterProductConfig: any;
  // 面单格式配置
  private labelFormatConfig: any;
  // 派送商配置
  private transporterConfig: any;

  // 平台配置
  private platformConfig: any;

  private senderAddressConfig: any;

  constructor(private service: NacosService) {}

  /**
   * 初始化配置到内存中并监听数据变化
   */
  async onModuleInit() {
    await this.getConfig();
    this.subScribeConfig();
  }

  async getConfig() {
    this.addressRestrictionConfig = await this.service.getConfig(ConfigDataIdEnum.ADDRESS_RESTRICTION);

    this.lastmileProviderIdentificationConfig = await this.service.getConfig(
      ConfigDataIdEnum.LASTMILE_PROVIDER_IDENTIFICAITON,
    );

    this.channelConfig = await this.service.getConfig(ConfigDataIdEnum.CHANNEL);

    this.accountConfig = await this.service.getConfig(ConfigDataIdEnum.ACCOUNT);

    this.transporterProductConfig = await this.service.getConfig(ConfigDataIdEnum.TRANSPORTER_PRODUCT);

    this.labelFormatConfig = await this.service.getConfig(ConfigDataIdEnum.LABEL_FORMAT);

    this.transporterConfig = await this.service.getConfig(ConfigDataIdEnum.TRANSPORTER);

    this.platformConfig = await this.service.getConfig(ConfigDataIdEnum.PLATFORM);

    this.senderAddressConfig = await this.service.getConfig(ConfigDataIdEnum.SENDER_ADDRESS);
  }

  subScribeConfig() {
    this.service.subscribe(ConfigDataIdEnum.ADDRESS_RESTRICTION, (newConfig: any) => {
      this.addressRestrictionConfig = JSON.parse(newConfig);
    });

    this.service.subscribe(ConfigDataIdEnum.LASTMILE_PROVIDER_IDENTIFICAITON, (newConfig: any) => {
      this.lastmileProviderIdentificationConfig = JSON.parse(newConfig);
    });

    this.service.subscribe(ConfigDataIdEnum.CHANNEL, (newConfig: any) => {
      this.channelConfig = JSON.parse(newConfig);
    });

    this.service.subscribe(ConfigDataIdEnum.ACCOUNT, (newConfig: any) => {
      this.accountConfig = JSON.parse(newConfig);
    });

    this.service.subscribe(ConfigDataIdEnum.TRANSPORTER_PRODUCT, (newConfig: any) => {
      this.transporterProductConfig = JSON.parse(newConfig);
    });

    this.service.subscribe(ConfigDataIdEnum.LABEL_FORMAT, (newConfig: any) => {
      this.labelFormatConfig = JSON.parse(newConfig);
    });

    this.service.subscribe(ConfigDataIdEnum.TRANSPORTER, (newConfig: any) => {
      this.transporterConfig = JSON.parse(newConfig);
    });

    this.service.subscribe(ConfigDataIdEnum.PLATFORM, (newConfig: any) => {
      this.platformConfig = JSON.parse(newConfig);
    });

    this.service.subscribe(ConfigDataIdEnum.SENDER_ADDRESS, (newConfig: any) => {
      this.senderAddressConfig = JSON.parse(newConfig);
    });
  }

  async setAllConfig() {
    await this.setAddressRestrictionConfig();
    await this.setLastmileProviderIdentificationConfig();
    await this.setChannelConfig();
    await this.setAccountConfig();
    await this.setProductConfig();
    await this.setLabelFormatConfig();
    await this.setTransporterConfig();
    await this.setPlatformConfig();
    await this.setSenderAddressConfig();
  }

  async setAddressRestrictionConfig() {
    await this.service.setAddressRestrictionConfig();
  }

  async setLastmileProviderIdentificationConfig() {
    await this.service.setLastmileProviderIdentificationConfig();
  }

  async setChannelConfig() {
    await this.service.setChannelConfig();
  }

  async setAccountConfig() {
    await this.service.setAccountConfig();
  }

  async setProductConfig() {
    await this.service.setProductConfig();
  }

  async setLabelFormatConfig() {
    await this.service.setLabelFormatConfig();
  }

  async setTransporterConfig() {
    await this.service.setTransporterConfig();
  }

  async setPlatformConfig() {
    await this.service.setPlatformConfig();
  }

  async setSenderAddressConfig() {
    await this.service.setSenderAddressConfig();
  }

  /**
   * 收件限制config
   */
  getAddressRestriction() {
    return this.addressRestrictionConfig;
  }

  /**
   * 尾程派送config
   */
  getLastmileProvider() {
    return this.lastmileProviderIdentificationConfig;
  }

  /**
   * 下单渠道相关配置信息
   * @param code
   */
  getChannelCodeConfig(code) {
    const channel = this.channelConfig?.find(c => c.code === code);
    if (!channel) return channel;

    const productInfo = this.transporterProductConfig?.find(t => t.ftlRoute === channel.ftlRoute);
    const accountInfo = this.accountConfig?.find(a => a.account === channel.account);
    const transporter = this.transporterConfig?.find(t => t.id === channel.transporterId);
    const labelFormats = this.labelFormatConfig?.filter(l => l.transporterId === channel.transporterId) || [];

    return {
      ..._.pick(channel, [
        'id',
        'code',
        'transporterId',
        'isActive',
        'isSupportMulti',
        'isSupportInsurance',
        'isUploadS3',
        'platform',
        'account',
        'ftlRoute',
        'isClientAccount',
        'senderAddressCode',
      ]),
      productCode: productInfo.productCode,
      accountInfo: channel.isClientAccount ? {} : accountInfo.accountInfo,
      maxInsuranceValue: transporter.maxInsuranceValue,
      labelFormats,
    };
  }

  getChannelConfig() {
    return this.channelConfig;
  }

  /**
   * 派送商config
   * @param transporter
   */
  getTransporterConfig(transporter: string) {
    return this.transporterConfig?.find(t => t.id === transporter);
  }

  /**
   * 面单url
   */

  getLabelFormatConfig(transporterId: string) {
    return this.labelFormatConfig.filter(l => l.transporterId === transporterId);
  }

  getPlatformConfig() {
    return this.platformConfig;
  }

  getSenderAddressConfig() {
    return this.senderAddressConfig;
  }
}
