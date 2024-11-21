import { BasicEntity } from '@/domain/base/basic.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, getRepository, In, Not } from 'typeorm';
import { IsArray, IsBoolean, IsString } from 'class-validator';
import { BusinessException } from '@/app/exception/business-exception';
import _ from 'lodash';

@Entity('sct_webhook_setting')
export class WebhookSetting extends BasicEntity {
  @Column({ type: 'varchar', nullable: false, unique: true, comment: '派送商' })
  @IsString()
  transporter: string;

  @IsString()
  @Column({ type: 'varchar', comment: '平台' })
  platform: string;

  @Column({ type: 'json', comment: '账号' })
  @IsArray()
  account: string[];

  @Column({ type: 'boolean', default: false, comment: '是否启用' })
  @IsBoolean()
  enabled: boolean;

  @Column({ type: 'varchar', comment: '操作人' })
  @IsString()
  operator: string;

  @BeforeInsert()
  async beforeInsertConfig() {
    if (!this.id && !this.enabled) {
      throw new BusinessException('新增的配置必须是生效状态');
    }
    return this.isSameOrAll(this);
  }

  @BeforeUpdate()
  async beforeUpdateConfig() {
    return this.isSameOrAll(this);
  }

  async isSameOrAll(setting) {
    const where = {
      transporter: setting.transporter,
      platform: In([setting.platform, '*']),
      enabled: true,
      id: Not(setting.id),
    };
    if (setting.platform === '*') {
      delete where.platform;
    }
    if (!setting.id) {
      delete where.id;
    }
    const ukSetting = await getRepository(WebhookSetting).count(where);
    if (ukSetting) {
      throw new BusinessException('平台和派送商组合必须唯一');
    }
    return true;
  }
}
