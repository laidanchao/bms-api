import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ChronopostOption extends TransporterOption {
  @ApiProperty({
    example: true,
    description: '是否周六派送',
  })
  @IsBoolean()
  @IsOptional()
  isDeliverSat?: boolean; // CHRONOPOST 使用.

  @IsBoolean()
  @IsOptional()
  originCountryIsUE?: boolean; // 原产国是否属于UE
}
