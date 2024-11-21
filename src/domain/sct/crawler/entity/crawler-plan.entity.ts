import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';

@Entity('sct_crawler_plan')
export class CrawlerPlan extends BasicEntity {
  @Column({ type: 'varchar' })
  @IsString()
  transporter: string;
  @Column({ type: 'varchar' })
  @IsString()
  filePath: string;
  @Column({ type: 'timestamptz' })
  @IsDate()
  schedule: Date;
  @Column({ type: 'timestamptz' })
  @IsDate()
  endAt: Date;
  @Column({ type: 'varchar', default: 'READY' })
  @IsString()
  status: string; // 状态枚举：DONE,READY
  @Column({
    type: 'varchar',
    comment: '本次任务有新增轨迹的包裹数量/本次任务中处于活跃状态的包裹数量/本次任务文件中总包裹数量',
  })
  @IsString()
  result: string;
  @Column('bigint', { comment: '花费的时间', nullable: true })
  @IsNumber()
  elapsedTime: number;

  @Column({ type: 'boolean', comment: '是否自动创建', default: true })
  @IsBoolean()
  automatic: boolean;

  @Column({ type: 'varchar', name: 'comment', comment: '备注' })
  @IsString()
  comment: string;

  @Column({ type: 'varchar', comment: '爬虫配置对应的平台' })
  @IsString()
  platform: string;

  @Column({ type: 'boolean', comment: '是否官方的' })
  @IsBoolean()
  official: boolean;
}
