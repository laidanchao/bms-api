import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';

export class AsendiaOption extends TransporterOption {
  path?: string;
  postagePrice?: string;
  postageCurrency?: string;
  switch?: Record<string, any>;
}
