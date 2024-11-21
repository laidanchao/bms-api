import { Bill } from '@/domain/scb/bill/entity/bill.entity';
import { ScbInvoice } from '@/domain/scb/invoice/entities/invoice.entity';
import { BillVerifierUtils } from '@/domain/scb/bill/verifier/bill-verifier.utils';

export class InvoiceVerifier {
  private readonly billVerifierUtils: BillVerifierUtils = new BillVerifierUtils();

  public verify(data: any[][], purchaseBills: Bill[], invoice: ScbInvoice, billVerifyLimitValue: number): boolean {
    const billAmount: number = this.billVerifierUtils.getBillValue(purchaseBills, 'amount');
    invoice.result = {};
    invoice.result['amount'] = this.billVerifierUtils.convertDataToTaskResult(
      billAmount,
      billAmount,
      '账单总额校验',
      billVerifyLimitValue,
    );

    return true;
  }
}
