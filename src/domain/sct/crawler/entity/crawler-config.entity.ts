import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { TRACK_AIM_STATUS } from '@/domain/sct/crawler/entity/crawler-target.entity';
import { ParcelTypeEnum } from '@/domain/sct/crawler/enum/parcelType.enum';

@Entity('sct_crawler_config')
export class CrawlerConfig extends BasicEntity {
  @Column({ type: 'varchar', nullable: false, unique: true, comment: '线路' })
  @IsString()
  transporter: string;

  @IsString()
  @Column({ type: 'varchar', comment: '配置属于内部还是外部账号' })
  parcelType: ParcelTypeEnum;

  @Column({ type: 'json', default: [], nullable: false, comment: '账号' })
  @IsArray()
  accounts: string[];

  @Column({ type: 'varchar', nullable: false, comment: '平台' })
  @IsString()
  platform: string;

  @Column({
    type: 'json',
    default: [],
    name: 'multiple_points',
    nullable: false,
    comment: '每日爬取时间点',
  })
  @IsArray()
  multiplePoints: string[];

  @Column({ type: 'boolean', default: false, comment: '是否启用' })
  @IsBoolean()
  enabled: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否官方提供' })
  @IsBoolean()
  official: boolean;

  @Column({ type: 'int4', name: 'max_times', default: 120, comment: '最大爬取次数' })
  @IsNumber()
  maxTimes: number;

  @Column('varchar', { comment: '记录不同爬虫配置的目标轨迹终点' })
  @IsString()
  trackAimStatus: TRACK_AIM_STATUS;

  @Column({ type: 'varchar' })
  @IsOptional()
  operator: string;
}
