import { IsDate, IsOptional, IsString } from 'class-validator';

export class OutsideParcelDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  shippingNumber: string;

  @IsString()
  channel: string;

  @IsDate()
  @IsOptional()
  declaredAt?: Date;

  @IsString()
  @IsOptional()
  receiverCountryCode?: string;

  @IsString()
  @IsOptional()
  receiverPostalCode?: string;

  @IsString()
  @IsOptional()
  receiverCity?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  barcode?: string;
}
