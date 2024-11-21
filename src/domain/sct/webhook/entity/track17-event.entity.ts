import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';
import { IsString } from 'class-validator';

// 17TrackEvent配置
@Entity({
  name: 'sct_17track_event',
})
export class Track17Event extends BasicEntity {

  @IsString()
  @Column({ type: 'varchar' })
  transporter: string;

  @IsString()
  @Column({ type: 'varchar' })
  description: string;

  @IsString()
  @Column({ type: 'varchar' })
  type: string;

}
