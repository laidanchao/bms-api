import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'npm_event_push_log',
})
export class EventPushLog extends BasicEntity {
  @Column({ type: 'varchar', name: 'file_path', comment: '推送轨迹文件保存路径' })
  filePath: string;
  @Column({ type: 'simple-array', name: 'tracking_push_ids', comment: '待推送轨迹的id集合' })
  trackingPushIds: number[];
}
