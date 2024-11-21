import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@Entity('scb_surcharge_price_log')
export class SurchargePriceLog extends BasicEntity {
  @IsString()
  @Column('varchar', { comment: '账单月' })
  month: string;

  @IsString()
  @Column('varchar')
  transporter: string;

  @IsString()
  @Column('varchar', { comment: '额外费类型' })
  type: string;

  @IsString()
  @Column({ type: 'varchar', comment: '额外费' })
  value: string;

  @IsString()
  @IsOptional()
  @Column('varchar', { comment: '国家二字码' })
  countryCode: string;

  @IsString()
  @IsOptional()
  @Column('varchar', { comment: '备注' })
  comment: string;

  @IsString()
  @IsOptional()
  @Column('varchar', { comment: '额外费说明' })
  description: string;

  @IsString()
  @IsOptional()
  @Column('varchar', { comment: '操作人' })
  operator: string;

  @IsString()
  @Column('varchar', { comment: '操作类型' })
  status: string;

  @IsNumber()
  @Column('int')
  priceId: number;
}
