import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { ApiProperty } from '@nestjs/swagger';

export class SfOption extends TransporterOption {
  @ApiProperty({
    description: '寄件网点',
  })
  shipperCode?: string;

  @ApiProperty({
    description: '操作员工号',
  })
  operatorNo?: string;

  @ApiProperty({
    description: '报关批次',
  })
  customsBatch?: string;

  @ApiProperty({
    description: '1为下单，2为改单',
  })
  isChangeOrder?: string;

  @ApiProperty({
    description: '证件类型 ID PASSPORT',
  })
  orderCertType?: string;

  @ApiProperty({
    description: '证件号',
  })
  orderCertNo?: string;

  @ApiProperty({
    description: '实际重量',
  })
  realWeight?: number;

  @ApiProperty({
    description: '体积重量',
  })
  volumeWeight?: number;

  @ApiProperty({
    description: '计费重量',
  })
  meterageWeight?: number;

  @ApiProperty({
    description: '税金支付方式',
  })
  taxPayType: number;
}
