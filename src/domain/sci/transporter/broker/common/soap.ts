import soap, { Client } from '@ftlab/node-soap';
import request from 'request';
import Mustache from 'mustache';
import { BusinessException } from '@/app/exception/business-exception';

/**
 * Soap Factory
 */
export class Soap {
  /**
   * Send SOAP Message with WSDL Config and data
   * @param {Object} config
   * @param {Object} data
   * @return {Promise<*>}
   */
  async send(config, data) {
    // create client
    const client: any = await this.createClient(config);

    if (!client[config.method]) {
      throw new BusinessException(`Soap method ${config.method} not supported`);
    }

    // send data
    return client[config.method](data);
  }

  /**
   * Create SOAP Client
   * @param config
   * @param account
   * @returns {Promise<Client>}
   */
  async createClient(config, account = {}): Promise<Client> {
    if (account) {
      config = this.parseConfigWithAccount(config, account);
    }
    const { wsdl, url, proxy = '', header, stream = false, auth, overrideRootElement, timeout } = config;
    const options = {
      request: request.defaults({ proxy, timeout }),
      stream,
      overrideRootElement,
    };
    const client = await soap.createClientAsync(wsdl, options, url);
    if (!client) {
      throw new BusinessException('Soap Client initialization fail, check config and wsdl');
    }
    if (auth) {
      client.setSecurity(new soap.BasicAuthSecurity(auth.username, auth.password));
    }
    client.addSoapHeader(header);
    return client;
  }

  parseConfigWithAccount(config, account) {
    const originString = JSON.stringify(config);
    const parsedString = Mustache.render(originString, account);
    return JSON.parse(parsedString);
  }
}
