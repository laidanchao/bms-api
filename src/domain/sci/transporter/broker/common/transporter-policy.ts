import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import request from 'request-promise';
// TODO xiewenzhen 请改造这块代码
export const TransporterUtils = {
  getOutputFormat(formats, format) {
    return _.find(formats, { outputFormat: format }) || _.find(formats, { labelFormat: format }) || formats[0];
  },

  omitEmptyProps(object) {
    if (!_.isObject(object)) {
      return;
    }
    Object.keys(object).forEach(key => {
      if (!object[key]) {
        delete object[key];
      }
      if (_.isArray(object[key])) {
        object[key].forEach(element => this.omitEmptyProps(element));
        return;
      }
      if (_.isObject(object[key])) {
        this.omitEmptyProps(object[key]);
      }
    });
  },

  getAddressName(address) {
    if (address.company) {
      return address.company;
    }
    return this.getFullName(address);
  },

  getFullName({ firstName, lastName }) {
    if (firstName && lastName) {
      const name = `${firstName} ${lastName}`;
      if (name.length <= 35) {
        return name;
      }
    }
    return firstName || lastName;
  },

  streetsToString(address) {
    return [address.street1, address.street2, address.street3].filter(street => street).join(' ');
  },

  uuid23() {
    return uuidv4().substr(0, 23);
  },

  getColispriveName({ firstName, lastName }) {
    if (firstName && lastName) {
      const name = `${lastName} ${firstName}`;
      if (name.length <= 35) {
        return name;
      }
    }
    return firstName || lastName;
  },

  getPhoneNumber(addr): string {
    return addr.mobileNumber || addr.phoneNumber;
  },

  getBuffer(requestOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks = [];
      request(requestOptions)
        .on('data', chunk => {
          chunks.push(chunk);
        })
        .on('end', () => {
          resolve(Buffer.concat(chunks));
        })
        .on('error', e => reject(e));
    });
  },
};
