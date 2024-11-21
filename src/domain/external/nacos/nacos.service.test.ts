import { NacosService } from '@/domain/external/nacos/nacos.service';

process.env.NODE_ENV = 'staging';
describe('NacosService test', function() {
  const nacosService = new NacosService();

  it('testGetConfig', async () => {
    await nacosService.getConfig('cms-test', 'CMS-TEST');
  });
});
