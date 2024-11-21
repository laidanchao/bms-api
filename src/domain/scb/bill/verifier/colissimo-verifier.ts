import { Bill } from '@/domain/scb/bill/entity/bill.entity';
import _ from 'lodash';
import { BillVerifierUtils } from '@/domain/scb/bill/verifier/bill-verifier.utils';
import { ScbInvoice } from '@/domain/scb/invoice/entities/invoice.entity';

export class ColissimoVerifier {
  private readonly billVerifierUtils: BillVerifierUtils = new BillVerifierUtils();

  public verify(
    data: any[][],
    purchaseBills: Bill[],
    invoice: ScbInvoice,
    billVerifyLimitValue: number,
    purchaseDetailSummary?,
  ): boolean {
    const {
      ht,
      vat,
      parcelQuantity,
      totalWeight,
      shippingFee,
      discount,
      fuelFee,
      shippingFeeAfterRemise,
    } = this._getPurchaseDetailSummary(data, purchaseDetailSummary);

    const billHt: number = this.billVerifierUtils.getBillValue(purchaseBills, 'ht');
    const billVat: number = this.billVerifierUtils.getBillValue(purchaseBills, 'vat');
    const billParcelQuantity: number = this.billVerifierUtils.getBillValue(purchaseBills, 'parcelQuantity');
    const billTotalWeight: number = this.billVerifierUtils.getBillValue(purchaseBills, 'totalWeight');
    const billShipmentFee: number = this.billVerifierUtils.getBillValue(purchaseBills, 'shippingFee');
    const billExtraFee: number = _.chain(purchaseBills)
      .map(item =>
        _.chain(item['purchaseBillExtras'])
          .filter(i => i.name !== 'I')
          .map(v => v.amount)
          .sum()
          .round(2)
          .value(),
      )
      .sum()
      .round(2)
      .value();
    const billDiscount: number = this.billVerifierUtils.getBillValue(purchaseBills, 'discount');
    const billFuelFee: number = this.billVerifierUtils.getBillValue(purchaseBills, 'fuelFee');
    const billShippingFeeAfterRemise: number = this.billVerifierUtils.getBillValue(
      purchaseBills,
      'shippingFeeAfterRemise',
    );
    invoice.result = {};
    invoice.result['shippingFee'] = this.billVerifierUtils.convertDataToTaskResult(
      shippingFee,
      billShipmentFee,
      '派送费总额校验',
      billVerifyLimitValue,
    );
    invoice.result['extraFee'] = this.billVerifierUtils.convertDataToTaskResult(
      billExtraFee,
      billExtraFee,
      '派送额外费总额校验',
      billVerifyLimitValue,
    );
    invoice.result['shippingFeeAfterRemise'] = this.billVerifierUtils.convertDataToTaskResult(
      shippingFeeAfterRemise,
      billShippingFeeAfterRemise,
      '折扣后派送费总额校验',
      billVerifyLimitValue,
    );
    invoice.result['discount'] = this.billVerifierUtils.convertDataToTaskResult(
      discount,
      billDiscount,
      '折扣费总额校验',
      billVerifyLimitValue,
    );
    invoice.result['fuelFee'] = this.billVerifierUtils.convertDataToTaskResult(
      fuelFee,
      billFuelFee,
      '燃油费总额校验',
      billVerifyLimitValue,
    );
    invoice.result['parcelQuantity'] = this.billVerifierUtils.convertDataToTaskResult(
      parcelQuantity,
      billParcelQuantity,
      '包裹总数校验',
      billVerifyLimitValue,
    );
    invoice.result['totalWeight'] = this.billVerifierUtils.convertDataToTaskResult(
      totalWeight,
      billTotalWeight,
      '包裹总重量',
      billVerifyLimitValue,
    );
    invoice.result['ht'] = this.billVerifierUtils.convertDataToTaskResult(
      ht,
      billHt,
      '总额HT校验',
      billVerifyLimitValue,
    );
    invoice.result['vat'] = this.billVerifierUtils.convertDataToTaskResult(
      vat,
      billVat,
      '总额VAT校验',
      billVerifyLimitValue,
    );

    const result: boolean[] = _.chain(Object.values(invoice.result))
      .map(item => item.result)
      .uniq()
      .value();
    return result.length === 1 && result[0] === true;
  }

  private _getPurchaseDetailSummary(data: any[][], purchaseDetailSummary?) {
    if (purchaseDetailSummary) {
      return purchaseDetailSummary;
    } else {
      return {
        ht: this.billVerifierUtils.getValue(data, 'TOT200', 11),
        vat: this.billVerifierUtils.getValue(data, 'TOT200', 9),
        parcelQuantity: this.billVerifierUtils.getValue(data, 'TOT001', 2),
        totalWeight: this.billVerifierUtils.getValue(data, 'TOT001', 3),
        shippingFee: this.billVerifierUtils.getValue(data, 'TOT001', 4),
        extraFee: this.billVerifierUtils.getValue(data, 'TOT200', 8),
        discount: this.billVerifierUtils.getValue(data, 'TOT001', 9),
        htShipmentFee: this.billVerifierUtils.getValue(data, 'TOT001', 10),
        fuelFee: this.billVerifierUtils.getValue(data, 'TOT200', 5),
        fuelRates: this.billVerifierUtils.getFuelRates(data, 'LIN008', 3),
        shippingFeeAfterRemise: this.billVerifierUtils.getValue(data, 'LIN008', 6),
      };
    }
  }
}
