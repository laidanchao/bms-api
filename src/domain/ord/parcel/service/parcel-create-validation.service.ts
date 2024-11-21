import { BadRequestException } from '@nestjs/common';
import { IChannelConfig } from '@/domain/ord/parcel/dto/i-channel-config';
import { CreateParcelDto } from '@/domain/ord/parcel/dto';
import _ from 'lodash';
export class ParcelCreateValidationService {
  validateChannel({ config, dto }: { config: IChannelConfig; dto: CreateParcelDto }) {
    //是否激活
    if (!config.isActive) {
      throw new BadRequestException(
        'FTL:渠道尚未开通,请联系管理员。The channel is not available, please contact the administrator.',
      );
    }
    // 渠道码是否属于平台
    if (config.platform !== dto.platform) {
      throw new BadRequestException('FTL:渠道码未对平台开放。Channel code is not available to the platform.');
    }

    //parcel---单包裹;parcels----多包裹; 单包裹和多包裹只能选择一个
    if (!dto.parcel && !dto.parcels) {
      throw new BadRequestException('FTL:请验证包裹数据是否正确。Please check the data of your parcel.');
    }

    if (dto.parcel && _.isArray(dto.parcels) && dto.parcels.length > 0) {
      throw new BadRequestException(
        'FTL:下单请选择单包裹或多包裹。Please choose the parcel type for this order, single or multiple.',
      );
    }
    // 缺少一个是否支持周六派送的验证

    // 验证面单格式
    this._validateLabelFormats(config);

    // 验证保险服务
    this._validateInsurance(config, dto);

    // 验证多包裹
    this._validateMultiParcel(config, dto);
  }

  validateChannelSetting(config: any, dto: any) {
    //是否激活
    if (!config.isActive) {
      throw new BadRequestException(
        'FTL:渠道尚未开通,请联系管理员。The channel is not available, please contact the administrator.',
      );
    }
    // 渠道码是否属于平台
    if (config.platform !== dto.platform) {
      throw new BadRequestException('FTL:渠道码未对平台开放。Channel code is not available to the platform.');
    }
  }

  _validateLabelFormats(config: IChannelConfig) {
    if (!config.labelFormat) {
      throw new BadRequestException(
        'FTL:面单格式不正确,请填写正确的面单格式。The format of label is incorrect. Please choose the correct format.',
      );
    }
  }

  _validateInsurance(config: IChannelConfig, dto: CreateParcelDto) {
    //单包裹验证
    if (dto.parcel) {
      if (!config.isSupportInsurance && dto.parcel.insuranceValue) {
        throw new BadRequestException('FTL:该渠道不支持保险服务。The channel does not support insurance services.');
      }

      if (dto.parcel.insuranceValue > config.maxInsuranceValue && config.maxInsuranceValue) {
        throw new BadRequestException('FTL:保险金额超出最大值。The insured amount has exceeded the maximum.');
      }
    }

    // 多包裹验证
    if (dto.parcels) {
      if (!config.isSupportInsurance && dto.parcels.find(parcel => parcel.insuranceValue)) {
        throw new BadRequestException('FTL:该渠道不支持保险服务。The channel does not support insurance services.');
      }
      if (config.maxInsuranceValue && dto.parcels.find(parcel => parcel.insuranceValue > config.maxInsuranceValue)) {
        throw new BadRequestException('FTL:保险金额超出最大值。The insured amount has exceeded the maximum.');
      }
    }
  }

  _validateMultiParcel(config: IChannelConfig, dto: CreateParcelDto) {
    if (dto.parcels && dto.parcels.length > 0 && !config.isSupportMulti) {
      throw new BadRequestException('FTL:该渠道不支持多包裹。The channel only supports a single parcel.');
    }
  }
}
