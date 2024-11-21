import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

@Entity('sci_transporter_method')
export class TransporterMethods extends BasicEntity {
  @IsString()
  @Column({ comment: '派送商', type: 'varchar' })
  transporter: string;

  @IsString()
  @IsOptional()
  @Column({ comment: '接口文档地址', type: 'varchar' })
  interfaceDoc: string;

  @IsBoolean()
  @Column({ comment: '是否已对接下单', type: 'boolean' })
  canOrder: boolean;

  @IsBoolean()
  @Column({ comment: '是否已对接取消下单', type: 'boolean' })
  canCancelOrder: boolean;

  @IsBoolean()
  @Column({ comment: '是否已对接，获取官方轨迹的方法', type: 'boolean' })
  canGetOfficialTracking: boolean;

  @IsBoolean()
  @Column({ comment: '是否已对接，获取非官方轨迹的方法', type: 'boolean' })
  canGetUnofficialTracking: boolean;

  @IsBoolean()
  @Column({ comment: '能否下取件单', type: 'boolean' })
  canOrderPickup: boolean;

  @IsBoolean()
  @Column({ comment: '能否取消取件', type: 'boolean' })
  canCancelOrderPickup: boolean;

  @IsBoolean()
  @Column({ comment: '能否上传etd文件', type: 'boolean' })
  canUploadEtd: boolean;

  @IsArray()
  @IsOptional()
  @Column({ comment: '其他服务', type: 'simple-array' })
  otherService: string[];
}
