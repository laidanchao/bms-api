import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({
    example: 'first',
  })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({
    example: 'last',
  })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({
    example: 'company',
  })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({
    example: 'paris',
  })
  @IsString()
  city: string;

  @ApiProperty({
    example: 'FR',
  })
  @IsString()
  countryCode: string;

  @ApiProperty({
    example: '75013',
  })
  @IsString()
  postalCode: string;

  @ApiProperty({
    example: 'test street1',
  })
  @IsString()
  @IsOptional()
  street1?: string;

  @ApiProperty({
    example: 'test street2',
  })
  @IsString()
  @IsOptional()
  street2?: string;

  @ApiProperty({
    example: 'test street3',
  })
  @IsString()
  @IsOptional()
  street3?: string;

  @ApiProperty({
    example: '0650122677',
  })
  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsOptional()
  taxInfo?: Record<string, any>;

  @IsOptional()
  eori?: string;

  @IsOptional()
  siret?: string;
}
