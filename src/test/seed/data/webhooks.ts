import { ProcessType } from '@/domain/npm/parcel-push/entity/parcel-push.entity';

export const webhooks = [
  {
    platform: 'FTL-OMS',
    clientId: 'FTL-OMS',
    url: 'http://localhost:6000/api/parcelAging/receiveData',
    header: {
      'api-key': 'vxVnHxyAGUuZuFZv6Y728NLpFmFnf3xf',
    },
    transporters: ['UPS', 'DPD', 'CORREOS', 'GLS', 'ASENDIA', 'COLISPRIVE', 'COLISSIMO'],
    enabled: true,
  },
  {
    platform: 'ESENDEO',
    clientId: 'ESENDEO',
    url: 'http://dev.esendeo.com/api/subscribe/updateParcelStatus',
    header: {
      'api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImF',
    },
    transporters: ['UPS', 'DPD', 'GLS', 'CHRONOPOST', 'COLISSIMO'],
    enabled: true,
  },
  {
    platform: 'FTL-OMS',
    clientId: 'YUN',
    url: 'http://ftl-oms-api-staging.herokuapp.com/api/parcelAging/receiveData',
    header: {
      'api-key': 'test',
    },
    processType: ProcessType.NOT_INCREMENT,
    transporters: ['ASENDIA', 'COLISPRIVE'],
    enabled: false,
  },
  {
    platform: 'FTL-OMS',
    clientId: 'SFI',
    url: 'http://ftl-oms-api-staging.herokuapp.com/api/parcelAging/receiveData',
    header: {
      'api-key': 'test',
    },
    processType: ProcessType.INCREMENT,
    handlerFunc: 'rebuildSfMessage',
    transporters: ['ASENDIA', 'COLISSIMO'],
    enabled: false,
    responseHandler: 'responseHandlerSFI',
  },
];
