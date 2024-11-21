import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MrOption extends TransporterOption {
  @ApiProperty({
    description: '驿站6位唯一number',
    required: true,
    maxLength: 6,
    minLength: 6,
  })
  @Length(6, 6)
  relayPointId: string;
  @ApiProperty({
    description: '驿站6位唯一number',
    required: true,
    maxLength: 2,
    minLength: 2,
  })
  @Length(2, 2)
  relayCountry: string;
  @ApiProperty({
    description: '返回的label编码格式',
    required: false,
    enum: ['BASE64', 'LINK'],
  })
  labelEncoding?: string;
}
