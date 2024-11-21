import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { ApiProperty } from '@nestjs/swagger';

export class CorreosOption extends TransporterOption {
  @ApiProperty({
    description: '货物类型',
  })
  tipoEnvio: string;

  @ApiProperty({
    description: '是否需要CN23',
  })
  needCN23?: boolean = false;

  @ApiProperty({
    description: '寄件人税号',
  })
  nif?: string;
}
