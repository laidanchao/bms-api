import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import 'moment-timezone';
import { Injectable } from '@nestjs/common';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import _ from 'lodash';
import axios from 'axios';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { delay, getHttpAgent } from '@/domain/utils/util';
import { Transporter } from '@/domain/utils/Enums';

@Injectable()
export class CronoBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    return {
      trackingNumber: '',
      shippingNumber: '',
      label: '',
      labelFormat: '',
      labelUrl: '',
      transporterRequest: '',
      transporterResponse: '',
    };
  }

  async fetchTrackingUnofficial2({ trackingNumberArray }, cmsEvents) {
    const trackingArray = [];
    if (!trackingNumberArray || !trackingNumberArray.length) {
      return {
        clearCache: false,
        trackingArray: [],
        failedTrackingNumberArray: [],
      };
    }
    console.log('CRONO:' + trackingNumberArray[0] + '开始爬取');

    const agent = getHttpAgent('EVERY_TIME');
    for (const chunkData of _.chunk(trackingNumberArray, 10)) {
      try {
        const result = (
          await axios.request({
            url: 'https://www.poste.it/online/dovequando/DQ-REST/ricercamultipla',
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              Host: 'www.poste.it',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
              'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
              Accept: 'application/json',
              'Accept-Encoding': 'gzip, deflate, br',
            },
            data: {
              tipoRichiedente: 'WEB',
              listaCodici: chunkData,
            },
            httpAgent: agent,
            httpsAgent: agent,
          })
        ).data;

        const array = _.flatMapDeep(
          result.map(parcelTracking => {
            const trackingNumber = parcelTracking.idTracciatura;
            return parcelTracking.listaMovimenti.map(item => {
              return {
                trackingNumber,
                event: '',
                description: item.statoLavorazione,
                timestamp: new Date(item.dataOra),
                location: item.luogo || '',
                fromFile: false,
              };
            });
          }),
        );
        trackingArray.push(...array);
        await delay(2000);
        console.log(trackingArray.length);
      } catch (e) {
        console.error(e.response?.data || e.message);
      }
    }
    console.log('CRONO:' + trackingNumberArray[0] + '爬取结束');

    const result = await super.descMapHandle(Transporter.CRONO, trackingArray, cmsEvents, false);
    return {
      ...result,
      failedTrackingNumberArray: [],
    };
  }
}
