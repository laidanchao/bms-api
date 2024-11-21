import fs from 'fs';
import Xml2js from 'xml2js';
import _ from 'lodash';
import { BusinessException } from '@/app/exception/business-exception';

export class XMLParser {
  parser: any;
  constructor(options = { explicitArray: false }) {
    this.parser = new Xml2js.Parser(options);
  }

  /**
   * 解析xml string/buffer to obj
   * @param xmlString/buffer
   */
  parseXmlString2Obj(xmlString) {
    let data = {};
    this.parser.parseString(xmlString, (err, result) => {
      if (err) {
        throw new BusinessException(err);
      }
      data = result;
    });
    // return mapDeepWith(data);
    return data;
  }

  parserXml2Obj(filePath) {
    const data = fs.readFileSync(filePath);
    const xmlObj = this.parseXmlString2Obj(data);
    // return mapDeepWith(xmlObj);
    return xmlObj;
  }
}

/**
 * {id: { name: {}}}
 * {id: [{name: [{}]}]}
 * @param data
 */
/* eslint-disable */
function mapDeepWith(data) {
  if (_.isArray(data)) {
    if (data.length === 1) {
      if (_.isObject(data[0])) {
        return mapDeepWith(data[0]);
      }
      return data[0];
    }
    return _.map(data, item => {
      return mapDeepWith(item);
    });
  }
  if (_.isObject(data)) {
    return _.mapValues(data, item => {
      return mapDeepWith(item);
    });
  }
  return data;
}
/* eslint-enable */
