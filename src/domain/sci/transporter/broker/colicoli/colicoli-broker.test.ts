import { ColicoliBroker } from '@/domain/sci/transporter/broker/colicoli/colicoli.broker';
import _ from 'lodash';
// import { writeLabelAndLog } from "@/common/test-utils";

const shipment: any = {
  receiverAddress: {
    city: 'hangzhoushi',
    countryCode: 'FR',
    email: 'ddd@ggla.com',
    firstName: 'firstR',
    lastName: 'lastR',
    phoneNumber: '13595339176',
    postalCode: '28563',
    street1: 'receiver street address 1 ds',
    street2: 'receiver street address 2 ds',
    province: '95535',
  },
  senderAddress: {
    lastName: 'firstS',
    firstName: 'lastS',
    city: 'hangzhoushi',
    countryCode: 'FR',
    email: 'ddd@ggla.com',
    phoneNumber: '13595339176',
    postalCode: '28563',
    street1: 'receiver street address 1 ds',
    street2: 'receiver street address 2 ds',
    province: '95535',
  },
  parcel: {
    reference: 'YT20203101585649599',
    weight: 59.2,
  },
  options: {
    labelLogoUrl:
      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic.jj20.com%2Fup%2Fallimg%2F1114%2F0I120152936%2F200I1152936-5-1200.jpg&refer=http%3A%2F%2Fpic.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1659511277&t=e269d5a4255928ec52c21ba424be9bc3',
  },
  clientId: 'BJYW',
  platform: 'FTL-OMS',
  description: 'ce shi xiong',
};
const config: any = {
  accountInfo: {
    apiToken:
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1ODg1Iiwicm9sZXMiOiJST0xFX0NPTElDT0xJX1NVUFBMSUVSIiwidXNlcm5hbWUiOiJjY19zdXBwbGllciIsInR5cGUiOiJBRE1JTiIsImdyb3VwIjoiQWRtaW5pc3RyYXRldXIiLCJvd25lciI6IkFkbWluaXN0cmF0ZXVyIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4zIiwidG9rZW5UeXBlIjoiQVBQIiwiYXBwIjoiajZuam8yakoyQThqaU5WS0t2UjlLWTkwYzJwbWV2RFYiLCJlbnYiOiJzdGFnaW5nIiwianRpIjoiZDQxM2FhZTc2ZTc3NDQxOWEzOTMzZGUxM2FlZDc1NDkifQ.VoRUDipLsGUfG4lL_TbysYdu09Obir0eweFjXfKKqK8-7QsBHVzDgIDIEUEPJnU1S7cMTGLA9u1lsNtbc_NYoA',
  },
  labelFormat: {
    labelType: 'A4_PARCEL',
    value: 'pdf',
  },
  shipmentUrl: 'https://gateway-staging.ftlapp.io/api/cc/shipment',
};

describe('Colicoli Client', () => {
  const client = new ColicoliBroker();
  // const transporter = 'Colicoli';

  it('should create', async function() {
    const result = await client.create(shipment, config);
    expect(result).toEqual(
      expect.objectContaining({
        label: expect.any(String),
        labelFormat: expect.any(String),
        trackingNumber: expect.any(String),
        shippingNumber: expect.any(String),
        labelUrl: expect.any(String),
      }),
    );
    // await writeLabelAndLog(transporter, result);
  });

  it('fetch Tracking', async () => {
    const trackingNumberArray = ['CC10100009831230', 'CC10100011198877'];
    const accountInfo = {
      apiToken:
        'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzNDczIiwicm9sZXMiOiJST0xFX0NDXzEwMiIsInVzZXJuYW1lIjoiZnRsX2NtcyIsInR5cGUiOiJDTElFTlQiLCJncm91cCI6IjEwMiIsIm93bmVyIjoiMTAyIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4yLjEiLCJ0b2tlblR5cGUiOiJDTElFTlQiLCJhcHAiOiJqNm5qbzJqSjJBOGppTlZLS3ZSOUtZOTBjMnBtZXZEViIsImp0aSI6IjQxODY0Yzk0Y2ZmYTQxZDdiN2FkMjdhZWEzNjg0NDFhIn0.TMO22FhLPaA6ZtlgW8Uou_5NosB9bnGowjwl5OMKwGTCE3VSNrNi0KkJro3F-KaCMU2y1-iejmjvLV2EHN7wWw',
    };
    await client.fetchTrackingOfficial({ trackingNumberArray, accountInfo });
  });

  it('test rete limit', async () => {
    // 测试60秒内只能发送1000个请求
    const trackingNumberArray = [];
    for (let i = 0; i < 1000; i++) {
      trackingNumberArray.push(i);
    }
    const start = new Date().valueOf();
    await client.fetchTrackingOfficial({ trackingNumberArray, accountInfo: {} });
    const end = new Date().valueOf();
    console.log(`${end}-${start}=${end - start}`);
    // 控制在60秒发送1000个请求
    expect(end - start > 60 * 1000).toEqual(true);
  });

  it('test concurrency', async () => {
    // 模拟并行
    const planCount = 5;
    const trackingNumberArray = [];
    for (let i = 0; i < planCount; i++) {
      const chunk = [];
      for (let j = 0; j < 1000; j++) {
        chunk.push(j);
      }
      trackingNumberArray.push(chunk);
    }
    const start = new Date().valueOf();
    const promises = trackingNumberArray.map(async (chunkTrackingNumberArray, index) => {
      await new Promise(resolve => setTimeout(resolve, 4000 * index));
      console.log(new Date().valueOf() + ' job start ' + index);
      await client.fetchTrackingOfficial({ trackingNumberArray: chunkTrackingNumberArray, accountInfo: {} });
      console.log(new Date().valueOf() + ' job finish ' + index);
    });
    await Promise.all(promises);
    const end = new Date().valueOf();
    console.log(planCount + ' trackingPlans cost time ' + (end - start));
    expect(end - start > planCount * 60 * 1000).toEqual(true);
  });
});
