import { Column, Entity, Unique } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';

@Entity('sci_transporter_api')
@Unique(['transporter'])
export class TransporterApi extends BasicEntity {
  @Column('varchar', { comment: '派送商', nullable: false })
  transporter: string;

  @Column({ comment: '下单地址', type: 'varchar', nullable: false })
  apiUrl: string;

  @Column({ comment: '是否生效', type: 'boolean', nullable: false })
  enabled: boolean;

  @Column({ comment: '操作人', type: 'varchar', nullable: false })
  operator: string;
}
