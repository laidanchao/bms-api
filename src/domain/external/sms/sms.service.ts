import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Axios from 'axios';
import _ from 'lodash';

@Injectable()
export class SmsService {
  config: any;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get('SMS');
  }

  /**
   * 推送分拣包裹给SMS
   * @param parcel
   */
  async pushSortingParcelBatch(
    smsProductCode: string,
    parcels: {
      trackingNumber: string;
      postalCode: string;
      transporter: string;
      clientId: string;
      platform: string;
      waybillNumber: string;
      barcode: string;
    }[],
  ) {
    if (_.isEmpty(parcels)) {
      return;
    }

    const { url: baseURL, token } = this.config;
    const url = '/batch/createBatch';

    const data = this.buildData(parcels, smsProductCode);

    const params: any = {
      method: 'POST',
      baseURL,
      url,
      data,
      headers: {
        Authorization: token,
      },
    };
    try {
      const res = await Axios.request(params);
      if (res.data?.code === 200) {
        return res.data;
      } else {
        throw new Error(res.data?.message || JSON.stringify(res.data));
      }
    } catch (e) {
      throw e;
    }
  }

  private buildData(
    parcels: {
      trackingNumber: string;
      postalCode: string;
      transporter: string;
      clientId: string;
      platform: string;
      waybillNumber: string;
      barcode: string;
    }[],
    productCode: string,
  ) {
    const data = {
      productCode,
      platform: 'CMS',
      parcels: parcels.map(parcel => {
        const { trackingNumber, postalCode, transporter, clientId, platform, barcode, waybillNumber } = parcel;

        const { requestTrackingNumber, requestTransporter } = this.getSMSTrackingNumberAndTransporter(
          platform,
          transporter,
          trackingNumber,
          barcode,
          waybillNumber,
        );

        // todo delete applicationToPlatform
        return {
          trackingNumber: requestTrackingNumber,
          zipCode: postalCode || '000000',
          transporter: requestTransporter,
          client: clientId,
          platform,
          application: platform,
        };
      }),
    };

    return data;
  }

  private getSMSTrackingNumberAndTransporter(
    platform: string,
    transporter: string,
    trackingNumber: string,
    barcode: string,
    waybillNumber: string,
  ) {
    const info = {
      requestTrackingNumber: trackingNumber,
      requestTransporter: transporter,
    };

    if (platform === 'ESENDEO') {
      // chronopost：包裹号以XR、XT开头的，使用barcode申报sms，且barcode去掉前面%
      if (transporter === 'CHRONOPOST') {
        if (trackingNumber.startsWith('XR') || trackingNumber.startsWith('XT')) {
          info.requestTrackingNumber = barcode.replace('%', '') || trackingNumber;
        }
      }

      // GLS有区分GLS和GLS_V2，但是在申报时，派送商统一改为GLS
      if (transporter.includes('GLS')) {
        info.requestTransporter = 'GLS';
      }

      // cp存在换单colissimo，申报数据时如果有换单，就使用waybillNumber申报，没有正常使用trackingNumber申报
      if (transporter === 'COLISPRIVE' && waybillNumber) {
        info.requestTrackingNumber = waybillNumber;
        info.requestTransporter = 'COLISSIMO';
      }
    }

    return info;
  }
}
