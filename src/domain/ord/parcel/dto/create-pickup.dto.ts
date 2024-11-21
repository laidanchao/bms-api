import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from '@/domain/ord/parcel/dto/address.dto';

class ReceiverAddressDto {
  @IsOptional()
  @IsString()
  countryCode: string;
}

class PickupOption {
  // 截至取件时间
  closingDateTime?: string;
}

export class CreatePickupDto {
  @ApiProperty()
  @IsString()
  channel: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsString()
  pickupAt: string;

  @ApiProperty({
    description: '寄件人信息',
  })
  @IsObject()
  senderAddress: AddressDto;

  @ApiProperty({
    description: '收件人信息',
  })
  @IsObject()
  @IsOptional()
  receiverAddress: ReceiverAddressDto;

  @IsOptional()
  @IsNumber()
  totalWeight: number;

  @IsOptional()
  @IsNumber()
  trayQuantity: number;

  @IsOptional()
  @IsObject()
  accountInfo?: any;

  @IsOptional()
  options?: PickupOption = {};
}
