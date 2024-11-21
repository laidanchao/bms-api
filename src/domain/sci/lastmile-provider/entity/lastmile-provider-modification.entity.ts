import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { IsNumber, IsString } from 'class-validator';
import { ModificationStatusEnum } from '@/domain/sci/lastmile-provider/enum/modification-status.enum';

@Entity('sci_lastmile_provider_modification')
export class LastmileProviderModification extends BasicEntity {
  @IsString()
  @Column({ comment: '派送商', type: 'varchar' })
  transporter: string;

  @IsString()
  @Column({ comment: '单号', type: 'varchar' })
  trackingNumber: string;

  @IsNumber()
  @Column({ comment: '同批次时间戳', type: 'int' })
  batchTimestamp: number;

  @IsString()
  @Column({ comment: '修正状态', type: 'varchar' })
  status: ModificationStatusEnum;

  @IsString()
  @Column({ comment: '修正前尾程派送商', type: 'varchar' })
  originalLastmileProvider: string;

  @IsString()
  @Column({ comment: '待修正尾程派送商', type: 'varchar' })
  lastmileProvider: string;

  @IsString()
  @Column({ comment: '此操作人', type: 'varchar' })
  operator: string;
}
