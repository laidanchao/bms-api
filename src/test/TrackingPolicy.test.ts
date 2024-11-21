import { getTrackingNumber } from '@/domain/job/sct/policy/colissimo-tracking-policy';

describe('cm tracking policy', function() {
  it('should trackingNumber', function() {
    const trackingNumber = getTrackingNumber('CA', '332210318F');
    expect(trackingNumber).toEqual('CA332210318FR');
  });
});
