import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';

//系统字典
@Entity('ssm_system_variable')
export class SsmSystemVariable extends BasicEntity {
  @Column('varchar')
  key: string;

  @Column('varchar')
  value: string;
}
