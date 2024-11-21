import { ApiProperty } from '@nestjs/swagger';

export class ParcelOption {
  @ApiProperty({
    description: '清关货种类别',
  })
  customsCategory?: number;

  @ApiProperty({
    description: '派送原因code（ESENDEO）',
  })
  sendingReasonCode?: number;

  @ApiProperty({
    description: '派送原因（ESENDEO）',
  })
  sendingReason?: string;

  @ApiProperty({
    description: '包裹描述（CORREOS）',
  })
  description?: string;
}
