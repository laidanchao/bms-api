import { Column, Entity } from 'typeorm';
import { IsArray, IsBoolean, IsString } from 'class-validator';
import { BasicEntity } from '@/domain/base/basic.entity';

// 尾程派送上匹配规则
@Entity('sci_lastmile_provider_identification')
export class LastmileProviderIdentification extends BasicEntity {
  @Column({ type: 'varchar', nullable: false, comment: '尾程供应商' })
  @IsString()
  lastmileProvider: string;

  @Column('varchar')
  @IsString()
  updatedBy: string;

  @Column({ type: 'json', default: [], nullable: false, comment: '单号长度' })
  @IsArray()
  lengthLimit: string[];

  @Column({ type: 'json', default: [], nullable: false, comment: '单号开头' })
  @IsArray()
  startWith: string[];

  @Column({ type: 'json', default: [], nullable: false, comment: '单号末尾' })
  @IsArray()
  endWith: string[];

  @Column({ type: 'boolean', default: false, comment: '是否包含字母，是代表必须有，否代表有没有都行' })
  @IsBoolean()
  isLetterRequired: boolean;
}
