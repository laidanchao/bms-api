import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ShipperAddress {
  @ApiProperty()
  @IsOptional()
  @IsString()
  countryPrefix?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class DpdOption extends TransporterOption {
  @ApiProperty()
  @IsOptional()
  @IsString()
  pickupAt?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contactType?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contactSms?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contactEMail?: string;

  @IsObject()
  @Type(() => ShipperAddress)
  @IsOptional()
  shipperAddress?: ShipperAddress;
}
