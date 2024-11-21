import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { ApiProperty } from '@nestjs/swagger';

export class UpsOption extends TransporterOption {
  @ApiProperty({
    description: '海关单类型',
  })
  customsCategory: string;

  // 当customsCategory为invoice时，必填
  @ApiProperty({
    description: '发票号', // 01：invoice
  })
  invoiceNumber?: string;

  // 当customsCategory为invoice时，必填
  @ApiProperty({
    description: '发票日期',
  })
  invoiceDate?: string;

  @ApiProperty({
    description: '贸易条约',
  })
  incoterm?: string; // DDP/DDU等等

  @ApiProperty({
    description: '货币类型',
  })
  currencyCode?: string;

  @ApiProperty({
    description: '',
  })
  invoiceWay?: string;
}
