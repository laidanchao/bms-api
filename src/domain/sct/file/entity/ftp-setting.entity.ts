import { BusinessException } from '@/app/exception/business-exception';
import { BasicEntity } from '@/domain/base/basic.entity';
import { In, Not } from 'typeorm';
import { BeforeUpdate, getRepository } from 'typeorm';
import { BeforeInsert } from 'typeorm';
import { Column, Entity } from 'typeorm';
import { IsArray, IsBoolean, IsString } from 'class-validator';

@Entity({
  name: 'sct_ftp_setting',
})
export class FtpSetting extends BasicEntity {
  @IsString()
  @Column('varchar', { comment: '派送商' })
  transporter: string;

  @IsString()
  @Column('varchar', { comment: '平台' })
  platform: string;

  @IsArray()
  @Column('simple-array', { comment: '账号集合' })
  account: string[];

  @IsBoolean()
  @Column('bool', { comment: '是否启用' })
  enabled: boolean;

  @IsString()
  @Column('varchar', { comment: '操作人' })
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
    const ukSetting = await getRepository(FtpSetting).count(where);
    if (ukSetting) {
      throw new BusinessException('平台和派送商组合必须唯一');
    }
    return true;
  }
}
