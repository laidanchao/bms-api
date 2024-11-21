import { PaackBroker } from '@/domain/sci/transporter/broker/paack/paack-broker.service';

describe('PAACK Client', () => {
  const client = new PaackBroker();

  it('singleTrackingRequest', async () => {
    const trackingNumber = 'BG-24042858TMQNK6X5';
    const postCode = '21342';
    const tracking = await client.singleTrackingRequest(trackingNumber, postCode);
    expect(tracking).not.toBeNull();
  });
});
