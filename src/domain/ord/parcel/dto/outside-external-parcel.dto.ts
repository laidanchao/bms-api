import { IsDate, IsOptional, IsString } from 'class-validator';

export class OutsideExternalParcelDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  shippingNumber: string;

  @IsString()
  lastmileProvider: string;

  @IsString()
  @IsOptional()
  receiverPostalCode?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsDate()
  @IsOptional()
  declaredAt?: Date;
}
