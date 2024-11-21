import { Moment } from '@softbrains/common-utils';
import _ from 'lodash';

export const MRTrackingPolicy = {
  parse,
};

function parse(rawTrackings, fileName = '', lastModifyAt) {
  return _.tail(rawTrackings).map(([item]) => {
    const timestamp = Moment.tz(item.slice(40, 54), 'DD.MM.YYYYHHmm', 'Europe/Paris').toDate();
    const trackingNumber = `${item.slice(16, 24)}`;
    const event = item.slice(54, 60);
    return {
      trackingNumber,
      event,
      timestamp,
      fileName,
      fromFile: true,
      getFileTime: lastModifyAt,
      transporter: 'MONDIAL_RELAY',
    };
  });
}
