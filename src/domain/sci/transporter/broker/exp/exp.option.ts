import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { IsString } from 'class-validator';

export class ExpOption extends TransporterOption {
  @IsString()
  receiverId: string;
}
