import { dataConvertToImage } from '@/domain/utils/util';
import fs from 'fs';

describe('canvas test', () => {
  it('canvas test', () => {
    const columnNames = ['派送商', '状态', '爬虫收集', 'FTP解析', '17Track注册', '新增轨迹', '轨迹推送'];
    const data = [
      {
        transporter: 'colissimo',
        status: '异常',
        parcelCollect: '100/200',
        ftp: '200/200',
        track17: '100/200/300',
        newTracking: '999',
        pushTracking: '400/400',
      },
      {
        transporter: 'colisprive',
        status: '正常',
        parcelCollect: '1000/1000',
        ftp: '2000/2000',
        track17: '3000/2000/3000',
        newTracking: '9998',
        pushTracking: '4000/4000',
      },
    ];
    const buffer = dataConvertToImage('2024-05-12内部监控', columnNames, data);
    fs.writeFileSync('table.png', buffer);
    expect(buffer).not.toBeNull();
  });
});
