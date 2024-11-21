import { GpxBroker } from '@/domain/sci/transporter/broker/gpx/gpx.broker';

describe('GPX Client', () => {
  const client = new GpxBroker();

  it('singleTrackingRequest', async () => {
    const trackingNumber = '15284200143';
    const tracking = await client.singleTrackingRequest(trackingNumber);
    expect(tracking).not.toBeNull();
  });
});
