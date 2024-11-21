import { Moment } from '@softbrains/common-utils';

export const ColispriveTrackingPolicy = {
  parse,
};

function parse(rawTrackings, events) {
  return rawTrackings.slice(1, -1).map(item => {
    const timestamp = Moment.tz(item[0].slice(2, 12), 'DDMMYYHHmm', 'Europe/Paris').toDate();
    const trackingNumber = `${item[0].slice(12, 24)}`;
    const event = item[0].slice(44, 48) + item[0].slice(58, 60);
    const existEvent = events.find(f => f.event === event);
    const description = existEvent ? existEvent.fr : `${event} can't not find in status database`;
    return {
      trackingNumber,
      event: event,
      description,
      timestamp,
    };
  });
}
