import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import _ from 'lodash';
import { BusinessException } from '@/app/exception/business-exception';

@Injectable()
export class TransporterBrokerFactory {
  brokerMap = {};

  constructor(private moduleRef: ModuleRef) {}

  public getBroker(transporter: string): TransporterBroker {
    if (this.brokerMap[transporter]) {
      return this.brokerMap[transporter];
    } else {
      const brokerName = `${_.chain(transporter)
        .camelCase()
        .upperFirst()
        .value()}Broker`;
      const transporterBroker = this.moduleRef.get(brokerName);
      this.brokerMap[transporter] = transporterBroker;
      if (!transporterBroker) {
        throw new BusinessException(`Transporter '${transporter}' is not supported`);
      }
      return transporterBroker;
    }
  }
}
