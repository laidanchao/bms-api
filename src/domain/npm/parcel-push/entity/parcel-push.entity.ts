import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, Unique } from 'typeorm';
import { IsArray, IsBoolean, IsString } from 'class-validator';

export enum ProcessType {
  INCREMENT = 'INCREMENT',
  NOT_INCREMENT = 'NOT_INCREMENT',
  PERSONALISE = 'PERSONALISE',
}
// 推送方式
export enum PushType {
  'KAFKA' = 'KAFKA',
  'XPUSH' = 'XPUSH',
  'REST' = 'REST',
}

@Entity('npm_parcel_push')
export class ParcelPush extends BasicEntity {
  @IsString()
  @Column()
  platform: string;

  @IsArray()
  @Column({ type: 'jsonb' })
  transporters: string[];

  @IsBoolean()
  @Column('boolean', { default: false, comment: '是否启用' })
  enabled: boolean;

  @IsString()
  @Column({ type: 'varchar', nullable: true })
  topic: string;

  @IsString()
  @Column({ type: 'varchar' })
  operator: string;
}
// 不可变类型, 通常和函数式编程使用
