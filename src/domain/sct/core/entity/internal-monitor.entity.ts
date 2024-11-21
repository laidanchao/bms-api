import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

@Entity('sct_internal_monitor')
export class InternalMonitor extends BasicEntity {
  @Column({ type: 'date', comment: '' })
  @IsString()
  date: Date;

  @Column({ type: 'varchar', comment: '派送商' })
  @IsString()
  transporter: string;

  @Column({ type: 'boolean', comment: '当天数据是否异常' })
  @IsBoolean()
  isAbnormal: boolean;

  @Column({ type: 'int', comment: '应收集包裹数' })
  @IsNumber()
  expectedCollectQuantity: number;

  @Column({ type: 'int', comment: '实际收集包裹数' })
  @IsNumber()
  actualCollectQuantity: number;

  @Column({ type: 'int', comment: '应推送给外部的轨迹数量' })
  @IsNumber()
  expectedPushQuantity: number;

  @Column({ type: 'int', comment: '实际推送给外部的轨迹数量' })
  @IsNumber()
  actualPushQuantity: number;

  @Column({ type: 'int', comment: '当天状态为【archived】的ftp文件数' })
  @IsNumber()
  archivedFtp: number;

  @Column({ type: 'int', comment: '当天接收到的ftp文件数' })
  @IsNumber()
  receivedFtp: number;

  @Column({ type: 'int', comment: '预期收集并注册到17track的包裹数', name: 'expected_collect_quantity_17track' })
  @IsNumber()
  expectedCollectQuantity17track: number;

  @Column({ type: 'int', comment: '实际收集到的17track包裹数', name: 'collected_quantity_17track' })
  @IsNumber()
  collectedQuantity17track: number;

  @Column({ type: 'int', comment: '注册到17track的包裹数', name: 'registered_quantity_17track' })
  @IsNumber()
  registeredQuantity17track: number;

  @Column({ type: 'int', comment: '增加的轨迹条数' })
  @IsNumber()
  gotTrackingQuantity: number;

  @Column({ type: 'varchar', comment: '下载轨迹异常数据url' })
  @IsString()
  abnormalFileUrl: string;

  @Column({ type: 'varchar', comment: '备注' })
  @IsString()
  note: string;
}
