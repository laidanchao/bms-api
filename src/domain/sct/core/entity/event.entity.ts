import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { IsOptional, IsString } from 'class-validator';

@Entity('sct_event')
export class Event extends BasicEntity {
  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true })
  transporter?: string;

  @IsString()
  @Column('varchar')
  event: string;

  @IsString()
  @Column('varchar')
  parcelStatus: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true })
  zh?: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true })
  en?: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true })
  fr?: string;
}
