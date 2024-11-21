import { FedexBroker } from '@/domain/sci/transporter/broker/fedex/fedex.broker';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { fedexShipment } from '@/domain/sci/transporter/contants';
import { Logger } from '@nestjs/common';
import { FedexOption } from '@/domain/sci/transporter/broker/fedex/fedex.option';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';

const config: BaseConfig = {
  // 测试账号
  accountInfo: {
    Key: 'p8N38ZrKyDXMw0D4',
    Password: 'K6rQaGLd2hT8vbVC1Rs8vdrI7',
    MeterNumber: '118576214',
    AccountNumber: '510087488',
  },
  shipmentUrl: 'https://wsbeta.fedex.com/web-services/ship',
  labelFormat: {
    value: 'PAPER_4X8',
    labelType: 'PNG',
  },
};

describe.skip('Fedex Client', () => {
  const client = new FedexBroker(null);
  let result;
  const transporter = 'Fedex';

  /**
   * Fedex 下单测试后一定要取消掉
   */
  it('create parcel', async () => {
    const doucmentContent =
      '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';
    const data = {
      code: 'FEDEX',
      destinationCountryCode: 'FR',
      originCountryCode: 'CN',
      fileName: 'test.xls',
      documentContent: doucmentContent,
      documentType: 'PRO_FORMA_INVOICE',
    };
    const res = await client.uploadEtdFile(data, config);
    Logger.log(res);
    expect(res.Message).toEqual('SUCCESS');
    Object.assign(fedexShipment, {
      senderAddress: {
        province: 'Paris(75)',
        city: 'Paris 12e',
        comment: '',
        company: '',
        countryCode: 'FR',
        email: '',
        firstName: 'Wanshan AVERT',
        lastName: '',
        mobileNumber: '+33677040652',
        phoneNumber: '+33677040652',
        postalCode: '75012',
        street1: '127 rue de Reuilly',
        street2: '',
        street3: '',
        EORI: null,
      },
      receiverAddress: {
        province: 'tai wan',
        city: 'tai bei shi',
        comment: '',
        company: '',
        countryCode: 'TW',
        email: '',
        firstName: 'Shy Wei YANG',
        lastName: '',
        mobileNumber: '00886902236962',
        phoneNumber: '00886902236962',
        postalCode: '10053',
        street1: 'tai bei shi lin yi jie 61 xiang',
        street2: '21-1 hao 5 lou',
        street3: '',
      },
      labelFormat: '4X6.75_PNG',
      parcel: {
        reference: 'FTL00851162FR',
        weight: 13,
        items: [
          {
            originCountry: 'FR',
            description: 'Long sleeve T-shirt',
            quantity: 4,
            weight: 0.54,
            value: 3.33,
          },
          {
            originCountry: 'FR',
            description: 'chocolat',
            quantity: 10,
            weight: 0.54,
            value: 3.33,
          },
          {
            originCountry: 'FR',
            description: 'Biscuit',
            quantity: 10,
            weight: 0.54,
            value: 3.33,
          },
        ],
        insuranceValue: 79.92,
      },
      shippingDate: '2021-11-08T17:24:03+01:00',
      description: 'Long sleeve T-shirt,chocolat,Biscuit',
      options: {
        documentId: '090dbba197ea7e2F',
        insuranceValue: 80,
      },
      code: 'FDX_FTL_EXP_STD',
      platform: 'FTL-EXPRESS',
    });

    const options: FedexOption = {
      documentType: res.DocumentType,
      documentId: res.DocumentId,
    };
    fedexShipment.options = options;
    result = await client.create(fedexShipment, config);
    expect(result.label).not.toBeNull();
    expect(result.trackingNumber).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  it('cancel parcel', async () => {
    // 取消下单
    const cancelResult = await client.cancelShipment(
      { shippingNumber: '285883574010', trackingNumbers: ['285883574010'] },
      config,
    );
    expect(cancelResult).toMatchObject({
      HighestSeverity: 'SUCCESS',
      Notifications: [
        {
          Severity: 'SUCCESS',
          Source: 'ship',
          Code: '0000',
          Message: 'Success',
          LocalizedMessage: 'Success',
        },
      ],
      TransactionDetail: { CustomerTransactionId: 'Delete Shipment' },
    });
  });
});
