import { IsDate, IsString } from 'class-validator';

export class ReceiverInfoDto {
  @IsString()
  lastName: string;
  @IsString()
  city: string;
  @IsString()
  postCode: string;
  @IsDate()
  arrivedAt: Date;
  @IsString()
  street1: string;
  @IsString()
  street2: string;
  @IsString()
  street3: string;
}
