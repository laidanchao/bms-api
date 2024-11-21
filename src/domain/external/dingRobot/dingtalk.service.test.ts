import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/app/config/configuration';
import { ExternalModule } from '@/domain/external/external.module';
import { XPushService } from '@/domain/external/xpush/x-push.service';

describe('test DingTalkService', () => {
  let xPushService: XPushService;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          envFilePath: `${process.env.NODE_ENV}.env`,
        }),
        ExternalModule,
      ],
    }).compile();
    await testingModule.createNestApplication().init();
    xPushService = await testingModule.resolve(XPushService);
  });

  it('send message', async () => {
    /**
     * 结论
     *
     * text类型 可以不在文本中增加@手机号 传入手机号数组后在最后增加一行被@人
     * markdown类型 必须要在文本中增加@手机号和手机号数组 否则不会出现被@效果
     */
    await xPushService.sendDingDing('test', 'default', ['17338472520']);
    await xPushService.sendDingDing('test@17338472520', 'bill',['17338472520']);
  });

  /**
   * 此处测试的代码为
   * {@link PurchaseBillService._notifyAccountants}
   */
  it('bill parse notify test', async () => {
    const envTitle =
      'production' === process.env.NODE_ENV
        ? '<font color="#ff0000">生产环境</font>'
        : '<font color="#00bfff">测试环境</font>';
    const transporter = 'transporter1';
    const month = 'month1';
    const account = 'account1';
    let content = `### ${envTitle} \n\n已经将${transporter}-${month}-${account}账单数据推送给OMS，可以开始对账\n\n`;
    const atMobileList = [];
    if ('staging' === process.env.NODE_ENV) {
      content += '@17338472520 ';
      atMobileList.push('17338472520');
    }
    await xPushService.sendDingDing(content, 'bill', atMobileList );
  });
});
