import Xml2js, { BuilderOptions } from 'xml2js';

export class XmlBuilder {
  builder: any;

  constructor(options?: BuilderOptions) {
    this.builder = new Xml2js.Builder(options);
  }

  buildXMLFile(XML_JSON, source, fileName) {
    // 1.构建XML JSON obj
    // 2.将DSA-XML对象转成XML文件
    const xmlFileString = this.obj2XMLString(XML_JSON);
    return { remoteFileFullPath: `${source}/${fileName}.xml`, buffer: Buffer.from(xmlFileString) };
  }

  /**
   * obj to xml string
   * @param data
   * @private
   */
  obj2XMLString(data) {
    return this.builder.buildObject(data);
  }
}
