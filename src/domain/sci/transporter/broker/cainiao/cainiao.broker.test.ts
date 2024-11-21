import axios from 'axios';
import { CainiaoBroker } from '@/domain/sci/transporter/broker/cainiao/cainiao.broker';
import {
  basicConfig,
  buildShipment,
  orderParams,
  traceParams,
} from '@/domain/sci/transporter/broker/cainiao/cainiao-test-data';

// 下单_测试请求
it('BY_CLIENT_CN_OVERSEA_DL_CREATE_PACKAGE', async () => {
  const client = new CainiaoBroker();
  const shipment = buildShipment('FR') as any;
  const channelConfig = basicConfig;
  const result = await client.create(shipment, channelConfig);
  expect(result).not.toBeNull();
});

// 下单_原始测试请求
it('ORIGINAL_CN_OVERSEA_DL_CREATE_PACKAGE', async () => {
  const { data } = await axios.request(orderParams as any);
  expect(data).not.toBeNull();
});

// 面单获取_原始测试请求
it('ORIGINAL_CN_OVERSEA_DL_GET_LABEL', async () => {
  const { data } = await axios.request(traceParams as any);
  expect(data).not.toBeNull();
});
