import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import moment from 'moment';
import axios from 'axios';
import 'moment-timezone';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { Injectable } from '@nestjs/common';
import { BusinessException } from '@/app/exception/business-exception';
import { TransporterException } from '@/app/exception/transporter-exception';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';
import { Transporter } from '@/domain/utils/Enums';
import { Logger } from '@/app/logger';
import * as cheerio from 'cheerio';
import { delay, getHttpAgent } from '@/domain/utils/util';

// TODO xiewenzhen 注意isUploadS3 这里是自定义的一个参数 JS.json和FTL-OMS.JSON中有配置 优化
@Injectable()
export class ColispriveBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const { receiverAddress, senderAddress, parcel } = shipment;
    const { accountInfo: account, labelFormat } = channelConfig;
    if (receiverAddress.countryCode !== 'FR') {
      throw new BusinessException(`ColisPrive不支持该国家: ${receiverAddress.countryCode}`);
    }

    const reference = parcel.reference || TransporterUtils.uuid23();

    // 是否需要签字后交货，不传默认为false
    const IsPclWithPOD = shipment.options.signDelivery || false;
    const body = {
      SetParcelRequest: {
        SecurityID: {
          CPCustoID: account.CPCustoID,
          AccountID: account.AccountID,
        },
        OrderID: reference, //必填且唯一
        Brand: senderAddress.company || '',
        CltNum: account.AccountID, //ClientNumber
        CsgAdd: {
          DlvrName: TransporterUtils.getColispriveName(receiverAddress), //full name
          DlvrAddress: {
            Add1: receiverAddress.street1,
            Add2: receiverAddress.street2,
            Add3: receiverAddress.street3,
            Add4: '',
            ZC: receiverAddress.postalCode,
            City: receiverAddress.city,
            Country: receiverAddress.countryCode,
          },
          DlvrEmail: receiverAddress.email,
          DlvrPhon: receiverAddress.phoneNumber,
          DlvrGsm: receiverAddress.mobileNumber,
          // DlvrDCode: 'string',//door code
          // DlvrComments: receiverAddress.comment
        },
        PclShipDate: formatShippingDate(shipment.shippingDate), //YYYYMMDD
        PclWeight: parseInt(String(MathCalculator.mul(parcel.weight, 1000))), //重量单位为grs(克)
        IsPclWithPOD,
        LabelFormat: labelFormat.value, //['PDF_DEFAUT','PDF_ZEBRA','ZPL_200']
      },
    };
    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/colisprive/Shipment.wsdl`,
      url: channelConfig.shipmentUrl,
      header: {
        'tns:AuthenticationHeader': {
          'tns:UserName': '{{username}}',
          'tns:Password': '{{password}}',
        },
      },
      timeout: 7000,
    };
    const client: any = await new Soap().createClient(labelConfig, account);
    let responses: any;
    try {
      responses = await client['SetParcelAsync'](body);
    } catch (e) {
      throw new TransporterException('ColisPrive', e, client.lastRequest);
    }

    //save request and response
    // await saveSoapLog(this.app, client, 'COLISPRIVE', requestId);

    const { RtnCode: statusCode, RtnMessage } = responses[0].SetParcelResult.WSResp;

    if (statusCode === -26) {
      throw new TransporterException('ColisPrive', `不支持该邮编: ${receiverAddress.postalCode}`, client.lastRequest);
    }
    if (statusCode !== 0) {
      throw new TransporterException('ColisPrive', RtnMessage, client.lastRequest);
    }
    const {
      LabelUrl: url,
      CABCode: trackingNumber,
      CPPclCode: shippingNumber,
      RegOffCode: sortCode,
      CLPFlwCab: waybillNumber,
    } = responses[0].SetParcelResult;

    // todo
    // await this.parcelService.getDuplicatesParcel(trackingNumber,reference);

    const label = await this._transformerBase64(url);
    return {
      sortCode,
      waybillNumber,
      shippingNumber,
      trackingNumber,
      labelFormat: labelFormat.labelType,
      label,
      transporterRequest: client.lastRequest,
      transporterResponse: client.lastResponse,
      lastmileProviderTrackingNumber: waybillNumber,
    };
  }

  /**
   *
   * @param url
   * @return {Promise<*>}
   * @private
   */
  async _transformerBase64(url) {
    const data = await this._getLabel(url);
    try {
      const result = data.toString('base64');
      return result;
    } catch (e) {
      throw new Error('Error during PDF combination: ' + e.message);
    }
  }

  /**
   *
   * @param url
   * @return {Promise<void>}
   * @private
   */
  async _getLabel(url) {
    // get label from colis prive
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
    });

    return response.data;
  }

  async fetchTrackingUnofficial2({ trackingNumberPostCodeArray }, cmsEvents) {
    const firstTrackingNumber = 'cp:' + trackingNumberPostCodeArray[0]?.trackingNumber;

    try {
      const trackingArray = [];
      console.time(firstTrackingNumber);

      console.log(`${firstTrackingNumber}等等${trackingNumberPostCodeArray.length}个单号开始爬取...`);
      for (const { trackingNumber } of trackingNumberPostCodeArray) {
        const result = await this.singleTrackingRequest(trackingNumber);
        trackingArray.push(...result);
        await delay(1000);
      }
      console.timeLog(firstTrackingNumber, `${firstTrackingNumber}等等,爬取结束!`);

      console.timeEnd(firstTrackingNumber);
      const result = await super.descMapHandle(Transporter.COLISPRIVE, trackingArray, cmsEvents, false);
      return {
        ...result,
        failedTrackingNumberArray: [],
      };
    } catch (e) {
      console.timeEnd(firstTrackingNumber);
      Logger.warn('COLISPRIVE tracking: ' + e.message);
      return {
        clearCache: true,
        trackingArray: [],
        failedTrackingNumberArray: [],
      };
    }
  }

  private async singleTrackingRequest(trackingNumber: string) {
    const url = `https://colisprive.com/moncolis/pages/detailColis.aspx?numColis=${trackingNumber}&lang=FR`;
    const agent = getHttpAgent();
    try {
      const response = await axios.request({
        url,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Host: 'colisprive.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
          'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        httpAgent: agent,
        httpsAgent: agent,
      });

      const rawTrackingArray = await this.getRawTrackingArray(response.data);
      return rawTrackingArray.map(rawTracking => {
        return {
          trackingNumber: trackingNumber,
          event: '',
          timestamp: moment.tz(rawTracking.date, 'DD/MM/YYYY', 'Europe/Paris').toDate(),
          description: rawTracking.desc,
          fromFile: false,
        };
      });
    } catch (e) {
      Logger.warn(`CP trackingNumber:${trackingNumber},${e.message}`);
      return [];
    }
  }

  private async getRawTrackingArray(data: string) {
    const $ = cheerio.load(data);
    const array = [];
    $('.historiqueColis tr:gt(1)').each(function() {
      array.push({
        date: $(this)
          .find('td')
          .eq(0)
          .text(),
        desc: $(this)
          .find('td')
          .eq(1)
          .text(),
      });
    });
    return array;
  }
}

function formatShippingDate(date) {
  return moment.tz(date, 'Europe/Paris').format('YYYYMMDD');
}
