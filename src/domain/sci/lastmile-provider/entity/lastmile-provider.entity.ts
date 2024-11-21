import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { IsBoolean, IsString } from 'class-validator';

@Entity('sci_lastmile_provider')
export class LastmileProvider extends BasicEntity {
  @IsString()
  @Column({ comment: '尾程供应商', type: 'varchar' })
  lastmileProvider: string;

  @IsString()
  @Column({ comment: '更新人', type: 'varchar' })
  updatedBy: string;

  @IsBoolean()
  @Column({ comment: '是否支持申请POD', type: 'bool' })
  podEnabled: boolean;

  @IsBoolean()
  @Column({ comment: '是否支持申请POD', type: 'bool' })
  powEnabled: boolean;
}
