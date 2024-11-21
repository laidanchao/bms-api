import { defaultShipment } from '@/domain/sci/transporter/contants';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import crypto from 'crypto';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';
import { v4 as uuidv4 } from 'uuid';
import { DpdZzBroker } from '@/domain/sci/transporter/broker/dpd/zz/dpd-zz.broker';

describe('DpdZzClient test', () => {
  const client = new DpdZzBroker();
  const transporter = 'DpdZz';

  const config: BaseConfig = {
    accountInfo: {},
    labelFormat: {
      value: 'PDF',
      labelType: 'pdf',
    },
    shipmentUrl: 'http://testapi.rpx.com.cn/roms_api',
    // shipmentUrl: 'http://interface.rpx.com.cn/roms_api',
    productCode: 'DPD Home',
  };

  it('should create label success', async () => {
    defaultShipment.parcel.reference = uuidv4().substring(0, 18);
    const results: any = await client.create(defaultShipment, config);
    for (const result of results) {
      await writeLabelAndLog(transporter, result);
    }
  });

  it('should create multi label success', async () => {
    const parcel2 = Object.assign({}, defaultShipment.parcel, { reference: 'ref test 222' });
    defaultShipment.parcels = [defaultShipment.parcel, parcel2];
    const results: any = await client.create(defaultShipment, config);
    for (const result of results) {
      await writeLabelAndLog(transporter, result);
    }
  });

  it('should login success', async function() {
    const loginData = {
      userName: 'FXWLAPI',
      password: '20210623@!.',
    };
    client.shipmentUrl = config.shipmentUrl;
    const result: any = await client.login(loginData);
    console.log(result);
  });

  it('rsa', () => {
    // The `generateKeyPairSync` method accepts two arguments:
    // 1. The type ok keys we want, which in this case is "rsa"
    // 2. An object with the properties of the key
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      // The standard secure default length for RSA keys is 2048 bits
      modulusLength: 1024,
    });
    expect(publicKey).not.toBeNull();
    expect(privateKey).not.toBeNull();
  });
});
