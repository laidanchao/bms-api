import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { EspostBroker } from '@/domain/sci/transporter/broker/espost/espost.broker';

const config: BaseConfig = {
  // 测试账号
  accountInfo: {
    Key: 'p8N38ZrKyDXMw0D4',
    Password: 'K6rQaGLd2hT8vbVC1Rs8vdrI7',
    MeterNumber: '118576214',
    AccountNumber: '510087488',
  },
  shipmentUrl: 'http://tms-api.ifbird.cn',
  labelFormat: {
    value: 'PAPER_4X8',
    labelType: 'PNG',
  },
};

describe.skip('Espost Client', () => {
  const client = new EspostBroker();
  let result;
  const transporter = 'Espost';

  it('get token', async () => {
    const token = await client.getToken(config.shipmentUrl);
    console.log(token);
  });
});
