import { IsArray, IsJSON, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountAttribute, ShipmentUrl } from '@/domain/sci/transporter/entities/transporter.entity';
import { Type } from 'class-transformer';
import { LabelFormat } from '@/domain/sci/transporter/entities/label-format.entity';

class TransporterProductDto {
  @IsString()
  productCode: string;

  @IsString()
  ftlRoute: string;
}

class TransporterAccountDto {
  @IsString()
  account: string;

  @IsString()
  @IsOptional()
  subAccount?: string;

  @IsJSON()
  accountInfo: Record<string, string>;
}

export class CreateTransporterDto {
  constructor(partial: Partial<CreateTransporterDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    name: 'name',
    example: 'COLISSIMO',
  })
  id: string;

  @ApiProperty({
    name: 'name',
    example: '法邮',
  })
  @IsString()
  name: string;

  @ApiProperty({
    name: 'maxInsuranceValue',
    description: '保险最大金额',
    example: 5000,
  })
  @IsNumber()
  @IsOptional()
  maxInsuranceValue?: number;

  @IsString()
  @IsOptional()
  carrierCode17track?: string;

  @ApiProperty({
    name: 'labelFormats',
    description: '服务商面单可选值',
    example: ['PDF_10x15_300dpi', 'PDF_A4_300dpi'],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  labelFormatsEnum?: string[];

  @ApiProperty({
    name: 'accountAttribute',
    example: [
      { attribute: 'contractNumber', required: true },
      { attribute: 'password', required: true },
    ],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccountAttribute)
  accountAttribute: AccountAttribute[];

  @ApiProperty({
    name: 'shipmentUrl',
    example: [
      {
        environment: 'production',
        url: 'https://ws.colissimo.fr/f5af0e9ebdb392e029156b046f5a4de0/sls-ws/SlsServiceWS',
      },
    ],
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => ShipmentUrl)
  shipmentUrl: ShipmentUrl[];

  @ApiProperty({
    name: 'transporterProducts',
    isArray: true,
    example: [
      {
        productCode: 'DOM',
        ftlRoute: 'COLISSIMO_EU',
      },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TransporterProductDto)
  transporterProducts?: TransporterProductDto[];

  @ApiProperty({
    name: 'transporterAccounts',
    isArray: true,
    example: [
      {
        contractNumber: 'xxxxx',
        password: 'xxxx',
      },
    ],
  })
  @IsOptional()
  @Type(() => TransporterAccountDto)
  transporterAccounts?: TransporterAccountDto[];

  @ApiProperty({
    name: 'label',
    example: [
      {
        label: 'A4',
        value: 'PDF_10x15_300dpi',
      },
    ],
  })
  labelFormats?: LabelFormat[];
}
