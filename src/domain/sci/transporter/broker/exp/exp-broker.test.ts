import { ExpBroker } from '@/domain/sci/transporter/broker/exp/exp.broker';

describe('exp broker test', () => {
  const shipment: any = {
    shippingDate: '2022-03-23T14:41:47.000Z',
    options: {
      receiverId: '110225196403026127',
    },
    senderAddress: {
      province: 'Seine-St-Denis (93)',
      city: 'ST DENIS',
      comment: '',
      company: '',
      countryCode: 'FR',
      email: '',
      firstName: 'Mme Johnson',
      lastName: '',
      mobileNumber: '0641241182',
      phoneNumber: '0641241182',
      postalCode: '93210',
      street1: '8 - 10 Mail Ada Lovelace',
      street2: '',
      street3: '',
      eori: '',
    },
    receiverAddress: {
      province: '湖南省',
      city: '株洲市',
      comment: '',
      company: '',
      countryCode: 'CN',
      email: '',
      firstName: '张婷',
      lastName: '',
      mobileNumber: '13612866559',
      phoneNumber: '13612866559',
      postalCode: '412000',
      street1: '芦淞区 姚家坝',
      street2: '',
      street3: '',
    },
    labelFormat: '100x150',
    parcel: {
      insuranceValue: 0,
      options: {},
      reference: 'FTL00904162FR',
      weight: 3.28,
      items: [
        {
          originCountry: 'FR',
          description: '法国Guigoz古戈士2段标准奶粉900g',
          quantity: 3,
          weight: 0.9,
          value: 168,
          hsCode: '0402291100',
        },
      ],
    },
    description: '法国Guigoz古戈士2段标准奶粉900g',
    code: 'SF_EXP_1981',
    platform: 'FTL-EXPRESS',
  };

  const channelConfig = {
    productCode: 'CB-CHINAEXPRESS',
    accountInfo: {
      appId: 'FTL0001',
      dno: 'FTL0001',
      appSecret: '123456aa',
    },
    shipmentUrl: 'http://121.41.56.246:6202',
    labelFormat: '',
  };

  it('encode data test', function() {
    const data = JSON.parse(
      '{"sender":{"name":"j_张三","phone":"j_12345678","mobile":"j_7854841","country":"j_CN","province":"j_河北省","city":"j_廊坊市","county":"j_固安县","street":"","houseno":"","address":"j_xxxxx详细地址","email":"","zip_code":"j_065500"},"receiver":{"name":"s_李四","phone":"s_12312345","mobile":"s_4843514","identity_no":"","identity_no_front":"","identity_no_back":"","country":"s_CN","province_code":"","province":"s_河北省","city":"s_衡水市","county":"s_安平县","houseno":"","street":"","address":"s_详细地址","address2":"","address3":"","company":"","email":"","zip_code":""},"buyer":{"name":"购买人","phone":"1231232131","mobile":"43241d1"},"parcels":[{"number":1,"length":"20","width":"20","height":"20","weight":"20","package_kind":"011"}],"itemList":[{"number":1,"index":"1","item":"112131","code":"112131","is_presente":2,"item_name":"中文品名","item_enname":"en name","item_category":"","hscode":"","cust_no":"","ciq_no":"","item_quantity":1,"item_net_weight":0.25,"item_weight":0.25,"price_declare":25.0,"price_code":"CNY","unit":"","unit1":"","qty1":0.0,"unit2":"","qty2":0.0,"brand":"","item_tax":"","assem_country":"","assem_area":"","spec":"","bar_code":"","prodUse":"","prod_material":"","oid":"","nots":"","wms_batch":"wms_batch0001","batch":"batch00001"}],"serciveList":[{"sercive_type":1}],"source":10,"dno":"EXPTEST01","business_model":20,"cp_code":"ZTO","tid":"","package_no":"","mail_no":"112321345","tran_no":"","logistics_id":"","seller_id":"","order_create_time":"2020-09-25 15:23:03","storehouse_id":"JWFYC","expno":"","trade_no":"TEST20210825001","post_type":"","post_no":"","poa":"","payment_enterprise":"","payment_enterprise_name":"","payment_transaction":"","payment_remark":"","payment_time":"","out_way_bill_url":"","declare_scheme_sid":"","product_code":"NO-ZY","total_freight":12.5,"total_code":"CNY","net_weight":0.25,"itemsum_weight":0.25,"bill":"","platform":"","is_trace_source":2,"zcode":"","taxId":"","total_package_no":"","isreturn":"","delayed_time":"","enforce_order":"","remark":""}',
    );
    const encodeData = new ExpBroker()['encodeData'](
      'TESTEXP',
      'd43f285f58114673a9ed42dee27283f2',
      'esdex.receive.receipt.create',
      data,
    );
  });

  it('sec-create', async () => {
    const expBroker = new ExpBroker();
    await expBroker.create(shipment, channelConfig);
  });

  it('fetchTrackingOfficial', async () => {
    const expBroker = new ExpBroker();
    const accountInfo = {
      appId: 'FTL0001',
      dno: 'FTL0001',
      appSecret: '123456aa',
    };
    const trackingNumberArray = ['EX8611015134', 'EX8611015134'];
    const trackingArray = await expBroker.fetchTrackingOfficial({ trackingNumberArray, accountInfo });
    if (1) {
      console.log(1);
    }
  });
});
