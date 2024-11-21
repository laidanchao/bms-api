import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, Unique } from 'typeorm';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { ParcelTypeEnum } from '@/domain/sct/crawler/enum/parcelType.enum';

// 17track配置
@Entity({
  name: 'sct_17track',
})
@Unique(['transporterId', 'platform'])
export class Track17 extends BasicEntity {
  @IsString()
  @Column({ type: 'varchar' })
  transporterId: string;

  @IsString()
  @Column({ type: 'varchar' })
  platform: string;

  @IsString()
  @Column({ type: 'varchar', comment: '配置属于内部还是外部账号' })
  parcelType: ParcelTypeEnum;

  @IsArray()
  @IsOptional()
  @Column({ type: 'simple-array', comment: '派送商账号集合' })
  transporterAccounts?: string[];

  @IsString()
  @Column({ type: 'varchar' })
  operator: string;

  @IsBoolean()
  @Column({ type: 'bool', comment: '是否生效' })
  enabled: boolean;
}
