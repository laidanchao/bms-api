import removeAccents from 'remove-accents';
import { BusinessException } from '@/app/exception/business-exception';
import { Inject, Injectable } from '@nestjs/common';
import { CreateParcelDto } from '@/domain/ord/parcel/dto';
import { IChannelConfig } from '@/domain/ord/parcel/dto/i-channel-config';
import _ from 'lodash';
import { CityRuleService } from '@/domain/utils/cityRule.service';

@Injectable()
export class ParcelColissimoService {
  constructor() {}

  /**
   * colissimo特殊处理和校验
   * @param dto
   */
  async validate(dto: CreateParcelDto) {
    // 校验收寄件人的姓名、公司名
    this.nameValid(dto.senderAddress.firstName, '寄件人姓名');
    this.nameValid(dto.senderAddress.lastName, '寄件人姓名');
    this.nameValid(dto.senderAddress.company, '寄件人公司名');
    this.nameValid(dto.receiverAddress.firstName, '收件人姓名');
    this.nameValid(dto.receiverAddress.lastName, '收件人姓名');
    this.nameValid(dto.receiverAddress.company, '收件人公司名');

    // 替换收寄件人的手机、电话的特殊字符
    dto.senderAddress.mobileNumber = this.phoneNumberRemoveSpecialChar(dto.senderAddress.mobileNumber || '');
    dto.senderAddress.phoneNumber = this.phoneNumberRemoveSpecialChar(dto.senderAddress.phoneNumber || '');
    dto.receiverAddress.mobileNumber = this.phoneNumberRemoveSpecialChar(dto.receiverAddress.mobileNumber || '');
    dto.receiverAddress.phoneNumber = this.phoneNumberRemoveSpecialChar(dto.receiverAddress.phoneNumber || '');

    // city收件城市字符串处理
    // 1. 去除音标并转大写
    // 2. 用正则替换字符
    dto.receiverAddress.city = CityRuleService.receiveCityHandler(dto.receiverAddress.city);

    //street字段替换ISO_8859_1标准以外的字符为空格
    dto.receiverAddress.street1 = this.streetHandler(dto.receiverAddress.street1);
    dto.receiverAddress.street2 = this.streetHandler(dto.receiverAddress.street2);
    dto.receiverAddress.street3 = this.streetHandler(dto.receiverAddress.street3);

    if (!dto.receiverAddress.postalCode) {
      throw new BusinessException(
        '当前收件地址邮编无效.The postal code of destination is invalid. Please check the data.',
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
   * street字段替换ISO_8859_1标准以外的字符为空格
   * @param street
   * @private
   */
  private streetHandler(street: string): string {
    if (!street) {
      return street;
    }
    return street.replace(/[^\u0000-\u00FF]/g, ' ');
  }

  /**
   * 验证名字是否符合ISO_8859_1标准
   * @param name
   * @private
   */
  private nameValid(name: string, filed: string) {
    const errChar = [];
    for (const char of name) {
      if (/[^\u0000-\u00FF]/.test(char)) {
        errChar.push(char);
      }
    }

    if (!_.isEmpty(errChar)) {
      throw new BusinessException(`${filed}含特殊字符:${errChar.toString()}`);
    }
  }

  /**
   * 除了数字、“-”、“+”以外都去掉
   * @param phoneNumber
   * @private
   */
  private phoneNumberRemoveSpecialChar(phoneNumber: string) {
    return phoneNumber.replace(/[^\d\-\+]/g, '');
  }
}
