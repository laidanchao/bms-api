import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { IsNumber, IsString } from 'class-validator';

@Entity('sct_cms_event')
export class CmsEvent extends BasicEntity {
  @IsString()
  @Column('varchar')
  transporter: string;

  @IsString()
  @Column('varchar')
  code: string;

  @IsString()
  @Column('varchar')
  description: string;

  @IsNumber()
  @Column('numeric', { comment: '优先级', default: 0 })
  priority: number;
}
