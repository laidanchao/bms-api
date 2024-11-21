import { Column, Entity, Unique } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

// 轨迹推送配置表
@Entity('npm_tracking_push')
@Unique(['platform', 'clientId'])
export class TrackingPush extends BasicEntity {
  @IsArray()
  @Column({ type: 'simple-array' })
  transporterIds: string[];

  @IsString()
  @Column({ type: 'varchar' })
  platform: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', nullable: true })
  clientId: string;

  @IsBoolean()
  @Column({ type: 'bool' })
  enabled: boolean;

  @IsString()
  @Column({ type: 'varchar' })
  operator: string;

  @IsString()
  @Column({ type: 'varchar' })
  kafkaTopic: string;

  @IsOptional()
  @IsInt()
  @Column({ type: 'int', nullable: true })
  warningLimit: number;

  @IsBoolean()
  @Column({ type: 'bool' })
  includeExternalAccount: boolean;
}
