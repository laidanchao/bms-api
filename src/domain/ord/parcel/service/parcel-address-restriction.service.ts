import removeAccents from 'remove-accents';
import { BusinessException } from '@/app/exception/business-exception';
import { Inject, Injectable } from '@nestjs/common';
import { CreateParcelDto } from '@/domain/ord/parcel/dto';
import { IChannelConfig } from '@/domain/ord/parcel/dto/i-channel-config';
import _ from 'lodash';
import { AddressRestriction } from '@/domain/cam/address-restriction/entity/address-restriction.entity';
import { RestrictionTypeEnum } from '@/domain/cam/address-restriction/enum/restriction-type.enum';
import {
  GLS_GR_ZIPCODE,
  RestrictionTypeRegularEnum,
  RANDOM_EMAIL,
} from '@/domain/cam/address-restriction/enum/restriction-type-regular.enum';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';
import { TransporterZoneService } from '@/domain/sci/transporter-zone/transporter-zone.service';
import { TransporterZoneRouteEnum } from '@/domain/sci/transporter-zone/enum/transporter-zone-route.enum';

@Injectable()
export class ParcelAddressRestrictionService {
  constructor(
    @Inject(TransporterZoneService) private transporterZoneService: TransporterZoneService,
    private nacosRepository: NacosRepository,
  ) {}

  /**
   * colissimo特殊处理和校验
   * @param dto
   * @param config
   */
  async validate(dto: CreateParcelDto, config: IChannelConfig) {
    const addressRestrictionConfig = this.nacosRepository.getAddressRestriction();

    const matchRestrictions = _.chain(addressRestrictionConfig)
      .filter((restriction: AddressRestriction) => {
        return (
          (restriction.platform === dto.platform || restriction.platform === '*') &&
          restriction.transporter === config.transporterId &&
          restriction.country === dto.receiverAddress.countryCode
        );
      })
      .map('restrictionType')
      .value();

    if (!matchRestrictions.length) return;

    // 海外省邮编校验
    if (matchRestrictions.includes(RestrictionTypeEnum.FR_OVERSEAS_TERRITORY)) {
      this._validOverseasTerritory(dto);
    }

    // 军事地址校验
    if (matchRestrictions.includes(RestrictionTypeEnum.FR_MILITARY_ADDRESS)) {
      this._validMilitaryAddress(dto);
    }

    // 校验本地邮编库6A名单
    if (matchRestrictions.includes(RestrictionTypeEnum.COLISSIMO_FR_6A_ZONE)) {
      await this._valid6AZone(dto, config);
    }

    // CP的邮编库校验
    if (matchRestrictions.includes(RestrictionTypeEnum.COLISPRIVE_FR_ALLOWED_POSTAL_CODE)) {
      await this._cpAllowedPostalCode(dto, config);
    }

    //GLS GR黑名单
    if (matchRestrictions.includes(RestrictionTypeEnum.GLS_GR_BLACKLIST_AREA)) {
      if (GLS_GR_ZIPCODE.includes(dto.receiverAddress.postalCode)) {
        throw new BusinessException(
          `GLS报错：该派送商不支持此收件地址 ${dto.receiverAddress.postalCode}。Address ${dto.receiverAddress.postalCode} is not supported.`,
        );
      }
    }

    // GLS,黑名单
    // IT,PT,GB,ES 统一可以使用正则
    const regularKey = _.keys(RestrictionTypeRegularEnum);
    const regularList = _.intersection(matchRestrictions, regularKey);

    for (const key of regularList) {
      this._validRegularPostalCode(RestrictionTypeRegularEnum[key], dto.receiverAddress.postalCode);
    }

    // 寄件随机邮箱
    if (matchRestrictions.includes(RestrictionTypeEnum.RANDOM_EMAIL_FOR_SENDER)) {
      const randomIndex = Math.floor(Math.random() * RANDOM_EMAIL.length);
      dto.senderAddress.email = RANDOM_EMAIL[randomIndex];
    }
  }

  /**
   * 海外省邮编校验
   * 收件邮编为【97000-99999】之间的邮编，且不为98000时，拦截下单
   * @param dto
   */
  _validOverseasTerritory(dto: CreateParcelDto) {
    if (
      dto.receiverAddress.postalCode >= '97000' &&
      dto.receiverAddress.postalCode <= '99999' &&
      dto.receiverAddress.postalCode !== '98000'
    ) {
      throw new BusinessException('暂不支持邮寄海外省.The destination to France overseas province is not supported.');
    }
  }

  /**
   * 海外省邮编校验
   * @param dto
   */
  _validMilitaryAddress(dto: CreateParcelDto) {
    if (
      ['00100', '00200'].includes(dto.receiverAddress.postalCode) ||
      dto.receiverAddress.city.toUpperCase() === 'ARMEE' ||
      /\bARMEE\b|00100|00200/i.test(this.removeSpecialChar(dto.receiverAddress.street1)) ||
      /\bARMEE\b|00100|00200/i.test(this.removeSpecialChar(dto.receiverAddress.street2)) ||
      /\bARMEE\b|00100|00200/i.test(this.removeSpecialChar(dto.receiverAddress.street3))
    ) {
      throw new BusinessException('不支持邮寄军事地址。The destination to the military area is not supported.');
    }
  }

  /**
   * 校验本地邮编库6A
   * @param dto
   * @param config
   */
  async _valid6AZone(dto: CreateParcelDto, config: IChannelConfig) {
    let needValidatePostCode = true;

    // 退件 95928：ROISSY CDG CEDEX 2 不经过本地邮编库校验
    if (config.productCode === 'CORE' && needValidatePostCode) {
      needValidatePostCode = !(
        dto.receiverAddress.postalCode === '95928' && dto.receiverAddress.city === 'ROISSY CDG CEDEX 2'
      );
    }
    if (needValidatePostCode) {
      await this.postCodeValidate(dto.receiverAddress.postalCode, dto.receiverAddress.city, dto.clientId);
    }
  }

  /**
   * CP的邮编库校验
   * @param dto
   * @param config
   */
  async _cpAllowedPostalCode(dto: CreateParcelDto, config: IChannelConfig) {
    const zipcodesAccess = await this.transporterZoneService.findByPostCode(
      dto.receiverAddress.postalCode,
      config.ftlRoute,
    );

    if (!zipcodesAccess.length) {
      throw new BusinessException(`ColisPrive不支持该邮编: ${dto.receiverAddress.postalCode}`);
    }
  }

  /**
   * 正则校验邮编
   * @param regular
   * @param postalCode
   */
  _validRegularPostalCode(regular: any, postalCode: string) {
    if (regular.test(postalCode)) {
      throw new BusinessException(
        `GLS报错：该派送商不支持此收件地址 ${postalCode}。Address ${postalCode} is not supported.`,
      );
    }
  }

  /**
   * 带音标字母替换并转大写
   * 大写字母/数字/空格以外的字符替换成空格
   * @param char
   * @private
   */
  private removeSpecialChar(char: string): string {
    if (!char) {
      return char;
    }
    const temp = removeAccents(char).toUpperCase();
    return temp.replace(/[^A-Z0-9\s]/g, ' ');
  }

  /**
   * 收件邮编校验
   * @param postalCode
   * @param city
   * @param clientId
   * @private
   */
  private async postCodeValidate(postalCode: string, city: string, clientId: string) {
    const cityPostalCodeArray = await this.transporterZoneService.findByPostCode(
      postalCode,
      TransporterZoneRouteEnum['6A'],
    );

    // 如果邮编和城市都匹配到了，则直接返回
    if (!_.isEmpty(cityPostalCodeArray) && cityPostalCodeArray.some(s => s.city === city)) {
      return true;
    }

    // 如果匹配不到邮编
    if (_.isEmpty(cityPostalCodeArray)) {
      throw new BusinessException(
        `当前收件地址邮编无效(${city}:${postalCode}).The postal code of destination is invalid. Please check the data.`,
      );
    } else {
      // 如果匹配不到城市
      throw new BusinessException(
        `当前收件地址邮编与城市不匹配(${city}:${postalCode}).The postal code of destination does not match the city. ${clientId} Please check the data.`,
      );
    }
  }
}
