import moment from 'moment-timezone';
import _ from 'lodash';
import { ParcelPolicy } from './parcel-policy';
import { trackingSort } from '@/domain/sct/core/service/tracking-handler.service';
import { ParcelStatus } from '@/domain/utils/Enums';

export function parse(rawTrackings, fileName = '', lastModifyAt) {
  return _.chain(rawTrackings)
    .filter(item => item[6] > '2017')
    .map(item => {
      let event;
      if (!_.isEmpty(item[4]) && !_.isEmpty(item[5])) {
        event = `${item[4]}_${item[5]}`;
      } else {
        event = _.isEmpty(item[4]) ? item[5] : item[4];
      }
      return {
        trackingNumber: getTrackingNumber(item[1], item[2]),
        reference: _.trim(item[3]),
        event: event,
        description: '',
        timestamp: toUTCDate(item[6]),
        location: `${item[9]}` || '',
        fileName: fileName,
        fromFile: true,
        getFileTime: lastModifyAt,
        supplierWeight: +item[7] || null,
        transporter: 'COLISSIMO',
      };
      // supplier_weight需过滤为0的数据
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
  return moment.tz(time, 'YYYYMMDDHH:mm', 'Europe/Paris').toDate();
}

/**
 * Get tracking number by combining product part and tracking part
 * @param {String} productPart
 * @param {String} trackingPart
 * @returns {string}
 */
export function getTrackingNumber(productPart, trackingPart) {
  if (productPart === 'EY') {
    if (trackingPart.substr(0, 2) !== '00') {
      this.dingTalkService.send(`ftp 文件出现未以‘00’开始的EY单号${trackingPart}`, ['15858242019'], false, 'markdown');
    }
    trackingPart = trackingPart.slice(2, 10);
    return `${productPart}${trackingPart}${getEYControlKey(trackingPart)}FR`;
  } else {
    return `${productPart}${trackingPart}${getControlKey(trackingPart)}`;
  }
}

/**
 * Get control key by tracking part
 * @param {String} trackingPart
 * @returns {number|string}
 */
function getControlKey(trackingPart) {
  // Europe ends with FR
  if (trackingPart.endsWith('F')) {
    return 'R';
  }
  const trackArray = trackingPart.split('');
  let total = 0;
  const number = trackArray.map(Number);
  number.forEach((item, index) => {
    if ((index + 1) % 2 === 0) {
      total += item * 3;
    } else {
      total += item;
    }
  });
  return (10 - (total % 10)) % 10;
}

// 根据法邮给出的单号计算规则
function getEYControlKey(trackingPart) {
  const provideWeight = '86423597';
  const trackArray = trackingPart.split('');
  let total = 0;
  const number = trackArray.map(Number);
  number.forEach((item, index) => {
    total = total + item * Number(provideWeight[index]);
  });
  let mantissa;
  const remainder = total % 11;
  switch (remainder) {
    case 1:
      mantissa = 0;
      break;
    case 0:
      mantissa = 5;
      break;
    default:
      mantissa = 11 - remainder;
      break;
  }
  return mantissa;
}
