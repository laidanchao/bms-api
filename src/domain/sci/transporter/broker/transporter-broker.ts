/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CancelParcelDto, CreateParcelResponse, UploadEtdFileDto } from '@/domain/ord/parcel/dto';
import { CreatePickupDto } from '@/domain/ord/parcel/dto/create-pickup.dto';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { RelayPointDTO } from '@/domain/sci/transporter/broker/mr/mr.constraint';
import { CmsEvent } from '@/domain/sct/core/entity/cms-event.entity';
import { CreatePickupResponse } from '@/domain/ord/parcel/dto/response/create-pickup-response';
import _ from 'lodash';
import { ParcelStatus, Transporter } from '@/domain/utils/Enums';
import { getRepository } from 'typeorm';
import { Event } from '@/domain/sct/core/entity/event.entity';

export abstract class TransporterBroker {
  abstract create(
    shipment: CreateClientDto,
    channelConfig: BaseConfig,
  ): Promise<CreateParcelResponse | CreateParcelResponse[]>;

  async uploadEtdFile(dto: UploadEtdFileDto, channelConfig: BaseConfig) {
    return {};
  }

  async cancelShipment(dto: CancelParcelDto, config: BaseConfig) {
    return {};
  }

  async schedulePickup(dto: CreatePickupDto, config: BaseConfig): Promise<CreatePickupResponse> {
    return null;
  }

  async cancelPickup(dto, config: BaseConfig) {
    return {};
  }

  async fetchTrackingOfficial(fetchTrackingDto: FetchTrackingDto) {
    return [];
  }

  async fetchTrackingFromOSC(fetchTrackingDto: FetchTrackingDto) {
    return [];
  }

  async fetchTrackingUnofficial(fetchTrackingDto: FetchTrackingDto) {
    return [];
  }

  async fetchTrackingUnofficial2(fetchTrackingDto: FetchTrackingDto, cmsEvents: CmsEvent[]) {
    return { clearCache: false, trackingArray: [], failedTrackingNumberArray: [] };
  }

  async fetchTrackingUnofficial3(fetchTrackingDto: FetchTrackingDto) {
    return { trackingArray: [], failedTrackingNumberArray: [] };
  }

  async handleTracking(parcel, trackingArray): Promise<Parcel> {
    return parcel;
  }

  async getLabel({ trackingNumber = '', account = {}, labelFormat = {}, labelConfig = {} }): Promise<string> {
    return undefined;
  }

  async getShipmentRate(dto: CreateClientDto, config: BaseConfig) {
    return [];
  }

  async searchShipmentInfo(reference, channelConfig: BaseConfig) {
    return undefined;
  }

  async modifyShipment(shipment: CreateClientDto, channelConfig: BaseConfig) {
    return undefined;
  }

  async searchRelayPointLocation(relayPointDTO: RelayPointDTO, channelConfig: BaseConfig): Promise<any[]> {
    return undefined;
  }

  /**
   * 匹配轨迹映射表，没有则新增
   * @param transporter
   * @param trackingArray
   * @param cmsEvents
   * @param needSameDesc 是否要求完全匹配轨迹描述
   */
  async descMapHandle(transporter: Transporter, trackingArray: any[], cmsEvents: CmsEvent[], needSameDesc = true) {
    cmsEvents = cmsEvents.filter(f => f.transporter === transporter);
    // 过滤掉描述为空的轨迹
    trackingArray = trackingArray.filter(f => f.description);

    let clearCache = false;
    // 将轨迹的描述映射到code
    trackingArray.forEach(f => {
      let existDesc;
      if (needSameDesc) {
        existDesc = cmsEvents.find(item => item.description === f.description);
      } else {
        existDesc = _.chain(cmsEvents)
          .filter(item => f.description.includes(item.description))
          .sortBy('priority')
          .last()
          .value();
      }

      // 描述匹配到记录时，直接用code覆盖event
      if (existDesc) {
        f.event = existDesc.code;
      } else {
        // 未精准匹配到时，通过模糊匹配获取映射的code,并保存映射记录
        const code = this._getEventCode(f.event, cmsEvents, transporter);

        let transporters = [transporter];

        // 菜鸟和COLISSIMO需要同时加DescriptionMap
        if ([Transporter.CAINIAO, Transporter.COLISSIMO].includes(transporter)) {
          transporters = [Transporter.CAINIAO, Transporter.COLISSIMO];
        }

        const { mapEntities, eventEntities } = this._buildMapAndEventEntity(transporters, code, f.description);

        getRepository(CmsEvent)
          .insert(mapEntities)
          .then();
        if ([Transporter.CAINIAO, Transporter.COLISSIMO].includes(transporter)) {
          getRepository(Event)
            .insert(eventEntities)
            .then();
        }

        cmsEvents.push(mapEntities.find(f => f.transporter === transporter));

        f.event = code;
        clearCache = true;
      }
    });

    return {
      clearCache,
      trackingArray,
    };
  }

  /**
   * 通过模糊匹配获取映射的code
   * @param event
   * @param cmsEvents
   */
  private _getEventCode(event: string, cmsEvents: CmsEvent[], transporter: Transporter) {
    let code;

    if (!event) {
      event = transporter === Transporter.CAINIAO ? 'CN' : transporter;
    }

    // 用event模糊匹配映射
    const lastData = _.chain(cmsEvents)
      .filter(item => item.code.startsWith(event))
      .orderBy('code')
      .last()
      .value();

    if (lastData) {
      const number =
        _.chain(lastData.code)
          .split('_')
          .last()
          .toNumber()
          .value() + 1;
      code = `${event}_${number.toString().padStart(3, '0')}`;
    } else {
      code = `${event}_001`;
    }

    return code;
  }

  private _buildMapAndEventEntity(transporters: Transporter[], code: string, description: string) {
    const mapEntities = [];
    const eventEntities = [];
    for (const transporter of transporters) {
      mapEntities.push({
        transporter,
        description,
        code,
      });

      eventEntities.push({
        transporter,
        event: code,
        parcelStatus: ParcelStatus.UNKNOWN,
        zh: description,
        en: description,
        fr: description,
      });
    }

    return {
      mapEntities,
      eventEntities,
    };
  }

  /*

  // Copied from TrackingClient.ts
  async getRemoteTracking(options) {
    const tracking = await this.getTrackingUnofficial(options);
    // sort data
    return _.orderBy(tracking, ['timestamp'], ['asc']);
  }
  */
}

class FetchTrackingDto {
  trackingNumberArray?: string[];
  accountInfo?: any;
  language?: string;
  webServiceUrl?: string;
  trackingNumberPostCodeArray?: { trackingNumber; postCode; shippingNumber }[];
}
