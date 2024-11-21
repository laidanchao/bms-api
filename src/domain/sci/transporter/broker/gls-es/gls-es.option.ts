import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class GlsEsOption extends TransporterOption {
  @ApiProperty({})
  @IsNumber()
  @IsOptional()
  timeFrame?: number;
}
