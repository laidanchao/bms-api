import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Axios from 'axios';

@Injectable()
export class OmsService {
  private BaseUrl: string;
  private Token: string;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get('OMS');
    this.BaseUrl = config.url;
    this.Token = config.token;
  }

  /**
   * 获取客户列表
   */
  async getClients() {
    return this.get('/clients/array');
  }

  /**
   * 赔偿账单推送BMS
   * @param data
   */
  async pushIndemnity(data: { trackingNumber: string; amount: number }[]) {
    return this.post('/bms/fsc/indemnityCostDetail/importIndemnityCostDetail', data);
  }

  /**
   * 通知BMS平台出账
   * @param month
   * @param transporter
   * @param billType
   */
  async notifyBill(month: string, transporter: string, billType: string) {
    return this.get(`/bms/serverless/bill/executeTask/${month}/${transporter}/${billType}`);
  }

  private async post(url: string, data: any) {
    const params: any = {
      method: 'POST',
      baseURL: this.BaseUrl,
      url,
      data,
      headers: {
        Authorization: this.Token,
      },
    };
    try {
      const res = await Axios.request(params);
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  private async get(url: string, params = null) {
    const request: any = {
      method: 'GET',
      baseURL: this.BaseUrl,
      url,
      params,
      headers: {
        Authorization: this.Token,
        'Content-Type': 'application/json; charset=utf-8',
      },
    };
    try {
      const res = await Axios.request(request);
      return res.data;
    } catch (e) {
      throw e;
    }
  }
}

//
