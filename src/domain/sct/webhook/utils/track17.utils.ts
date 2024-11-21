import axios, { AxiosRequestConfig } from 'axios';
import _ from 'lodash';
import { BusinessException } from '@/app/exception/business-exception';

class Track17Utils {
  private baseUrl = 'https://api.17track.net/track/v2/';

  /**
   * 注册单号
   * @param registerData
   * @param apiKey
   */
  async register(
    registerData: { trackingNumber: string; receiverPostalCode: string; carrierCode17track: string }[],
    apiKey: string,
  ) {
    const data = registerData.map(m => {
      if (m.receiverPostalCode) {
        return {
          number: m.trackingNumber,
          param: m.receiverPostalCode,
          carrier: m.carrierCode17track,
        };
      } else {
        return {
          number: m.trackingNumber,
          carrier: m.carrierCode17track,
        };
      }
    });

    //已在17tracks设置白名单，不需要加系统环境变量  || !process.env.NODE_ENV.includes('production')
    if (_.isEmpty(registerData)) {
      return {
        code: 0,
        accepted: data,
        rejected: [],
      };
    }

    const option: AxiosRequestConfig = {
      method: 'POST',
      baseURL: this.baseUrl,
      url: 'register',
      headers: {
        'content-type': 'application/json',
        '17token': apiKey,
      },
      data,
    };

    try {
      const result = await axios.request(option);
      return result.data;
    } catch (e) {
      console.error(e);
      throw new BusinessException(_.get(e, 'response.data.data.errors[0].message', e));
    }
  }
}

export const Track17Util = new Track17Utils();
