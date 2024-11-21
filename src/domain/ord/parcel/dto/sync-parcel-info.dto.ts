import { CreateParcelDto } from './create-parcel.dto';
import { IsString } from 'class-validator';

export class SyncParcelInfoDto extends CreateParcelDto {
  @IsString()
  trackingNumber: string;
}
