import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';

export class XbsOption extends TransporterOption {
  // Accepted values: SaleOfGoods, Documents, Gift, ReturnedGoods and CommercialSample. Default:
  // SaleOfGoods
  declarationType?: string;
}
