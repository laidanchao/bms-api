import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class GlsOption extends TransporterOption {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  flexDeliveryService?: boolean; // gls

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  shopReturnService?: boolean; // gls

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  returnService?: boolean; //gls
}
