import { AddressDto } from '@/domain/ord/parcel/dto/address.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ParcelDto } from '@/domain/ord/parcel/dto/parcel.dto';
import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';

export class CreateClientDto {
  @ApiProperty({
    description: '收件人信息',
    type: () => AddressDto,
  })
  @Type(() => AddressDto)
  @IsObject()
  receiverAddress: AddressDto;

  @ApiProperty({
    description: '寄件人信息',
    type: () => AddressDto,
  })
  @Type(() => AddressDto)
  @IsObject()
  @IsOptional()
  senderAddress: AddressDto;

  @ApiProperty({
    description: '单包裹.下单时,单包裹和多包裹只能选择一种模式',
    type: () => ParcelDto,
  })
  @Type(() => ParcelDto)
  @IsOptional()
  @IsObject()
  parcel?: ParcelDto;

  @ApiProperty({
    description: '多包裹.下单时,单包裹和多包裹只能选择一种模式',
    type: [() => ParcelDto],
  })
  @Type(() => ParcelDto)
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  parcels?: ParcelDto[];

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  shippingDate? = new Date();

  @ApiProperty()
  @IsOptional()
  options?: TransporterOption = {};

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'clientId',
  })
  @IsString()
  @IsOptional()
  clientId?: string;
}
