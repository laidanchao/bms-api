import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class MagicBIService {
  config: any;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get('biMagicConfig');
  }

  /**
   * 防止统计造成数据库压力
   * 并提高查询效率
   * 采用从BI同步库查询数据
   * @param path
   * @param where
   */
  public async getDataFromBI(path, where) {
    const url = this.config.url;
    const token = this.config.token;
    const option: AxiosRequestConfig = {
      method: 'POST',
      baseURL: `${url}/cms/${path}`,
      headers: {
        'content-type': 'application/json',
        Authorization: token,
      },
      data: {
        ...where,
      },
    };
    const { data } = await axios.request(option);
    return data;
  }
}
