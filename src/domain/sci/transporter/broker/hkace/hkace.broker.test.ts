import { basicConfig, buildShipment } from '@/domain/sci/transporter/broker/hkace/hkace-test-data';
import { HkaceBroker } from '@/domain/sci/transporter/broker/hkace/hkace.broker';

// 下单_测试请求
it('BY_CLIENT_CN_OVERSEA_DL_CREATE_PACKAGE', async () => {
  const client = new HkaceBroker();
  const shipment = buildShipment('FR') as any;
  const channelConfig = basicConfig;
  const result = await client.create(shipment, channelConfig);
  console.log(result, 'result');
  expect(result).not.toBeNull();
});
