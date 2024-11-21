import { getTrackingNumber } from '@/domain/job/sct/policy/colissimo-tracking-policy';
import moment from 'moment-timezone';
import _ from 'lodash';

export function parse(rawTrackings, fileName = '', lastModifyAt) {
  return _.chain(rawTrackings)
    .map(item => {
      let event;
      if (!_.isEmpty(item['Situ']) && !_.isEmpty(item['Justi'])) {
        event = `${item['Situ']}_${item['Justi']}`;
      } else {
        event = _.isEmpty(item['Situ']) ? item['Justi'] : item['Situ'];
      }
      return {
        trackingNumber: _getTrackingNumber(_.trim(item['ReferenceTransporteur'])),
        reference: _.trim(item['ReferenceDispeo']),
        event: event,
        description: item['Description'],
        timestamp: toUTCDate(item['Date']),
        location: `${item['Localisation']}` || '',
        fileName: fileName,
        fromFile: true,
        getFileTime: lastModifyAt,
        supplierWeight: null,
        transporter: 'DISPEO',
      };
    })
    .orderBy(['timestamp'], ['asc'])
    .value();
}

/**
 * Convert timestamp string of timezone Paris to Date object of timezone UTC
 * @param {String} time in france
 * @returns {Date}
 */
function toUTCDate(time) {
  return moment.tz(time, 'DD/MM/YYYY hh:mm:ss', 'Europe/Paris').toDate();
}

/**
 * Get tracking number by combining product part and tracking part
 * @returns {string}
 * @param trackingNumber
 */
export function _getTrackingNumber(trackingNumber) {
  if(trackingNumber.length === 13) return trackingNumber;
  const productPart = trackingNumber.slice(0, 2);
  const trackingPart = trackingNumber.slice(2, 12);
  return getTrackingNumber(productPart, trackingPart);
}


