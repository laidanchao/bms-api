import { XbsBroker } from '@/domain/sci/transporter/broker/xbs/xbs.broker';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { xbsShipment } from '@/domain/sci/transporter/contants';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';

// 测试url & 账号信息
const config: BaseConfig = {
  // 账号同生产
  accountInfo: {
    login: 'FTLExpress',
    password: 'XBS3469',
  },
  // 测试地址
  shipmentUrl: 'https://mtapi.net/?testMode=1',
  labelFormat: {
    value: 'PDF',
    labelType: 'pdf',
  },
};

describe('Xbs Client', () => {
  const client = new XbsBroker();
  const transporter = 'Xbs';

  it('sec-create parcel', async () => {
    xbsShipment.parcel.reference = `ref ${new Date().getTime()}`;
    xbsShipment['options'] = {};
    xbsShipment['options']['declarationType'] = 'Gift';
    const result = await client.create(xbsShipment, config);
    expect(result.label).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  it('fetch Tracking Official', async () => {
    const trackingNumberArray = [
      'EI002877586NL',
      'EI002955748NL',
      'EI002887827NL',
      'EI002918232NL',
      'EI002937951NL',
      'EI002937965NL',
      'EI002891747NL',
      'EI002913005NL',
      'EI002913045NL',
      'EI002918161NL',
    ];
    const accountInfo = {
      login: 'FTLEXPRESS',
      password: 'W3469',
    };
    const trackingArray = await client.fetchTrackingOfficial({ trackingNumberArray, accountInfo });
  });
});
