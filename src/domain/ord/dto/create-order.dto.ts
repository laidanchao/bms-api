import { CreateParcelDto } from '@/domain/ord/parcel/dto';
import { IsString } from 'class-validator';

export class CreateOrderDto extends CreateParcelDto {
  @IsString()
  reference: string;
  @IsString()
  labelPath: string;
  @IsString()
  bucket: string;
  @IsString()
  callBackUrl: string;
  @IsString()
  token: string;
}
