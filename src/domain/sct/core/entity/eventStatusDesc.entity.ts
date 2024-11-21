import { BeforeInsert, BeforeUpdate, Column, Entity, getRepository } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { IsString } from 'class-validator';
import { BusinessException } from '@/app/exception/business-exception';

@Entity('sct_event_status_description')
export class EventStatusDesc extends BasicEntity {
  @IsString()
  @Column('varchar')
  status: string;

  @IsString()
  @Column('varchar')
  description: string;

  @BeforeInsert()
  async beforeInsertConfig() {
    return this.isSameStatus(this);
  }

  @BeforeUpdate()
  async beforeUpdateConfig() {
    return this.isSameStatus(this);
  }

  async isSameStatus(data) {
    const ukData = await getRepository(EventStatusDesc).findOne({
      status: data.status,
    });
    const isSameStatus = ukData ? data.id !== ukData.id : false;
    if (isSameStatus) {
      throw new BusinessException('Fail to add, the status already exists.');
    }
    return true;
  }
}
