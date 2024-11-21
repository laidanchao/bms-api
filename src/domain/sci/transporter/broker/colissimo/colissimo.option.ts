import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { ApiProperty } from '@nestjs/swagger';

export class ColissimoOption extends TransporterOption {
  @ApiProperty({
    description: '清关货种类别',
  })
  customsCategory?: number;

  @ApiProperty({
    description: '是否需要校验城市邮编',
  })
  validatePostalCode?: boolean;

  @ApiProperty({
    description: '发票号（速运）',
  })
  invoiceNumber?: string;

  @ApiProperty({
    description: '运费（速运）',
  })
  totalAmount?: number;

  @ApiProperty({
    description: '托运人商业名称',
  })
  commercialName?: string;

  @ApiProperty({
    description: '提货点id',
  })
  relayPointId?: string;
}
