import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, CreateDateColumn, Entity, Index, Unique } from 'typeorm';

@Unique('colissimo_tracking_file_name_size_UK', ['name', 'size'])
@Index('colissimo_tracking_file_transporterAccountId_sourceDate_IDX', ['transporterAccountId', 'sourceDate'])
@Index('colissimo_tracking_file_name_IDX', ['name'])
@Entity({
  name: 'sct_file_record',
})
export class FileRecord extends BasicEntity {
  @Column('varchar', { comment: '法邮上传文件时间' })
  uploadDate: string;
  @Column('varchar', { comment: '文件名' })
  name: string;
  @Column('varchar', { comment: '文件源日期' })
  sourceDate: string;
  @Column('bigint', { comment: '文件大小' })
  size: number;
  @Column('timestamptz', { comment: '最后处理时间' })
  lastModifyAt: Date;
  @Column('varchar', { comment: 'sftp账号' })
  sftpAccount: string;
  @Column('varchar', { comment: '派送商账号' })
  transporterAccountId: string;
  @Column('varchar', { comment: '文件URL' })
  fileUrl: string;
  @Column('varchar', { comment: '事件' })
  event: string;
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', precision: 6 })
  parsedAt: Date;
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', precision: 6 })
  deletedAt: Date;
  @Column('varchar', { comment: '派送商' })
  transporter: string;
}

export class TrackingConstants {
  static RESOURCE_CM = 'cmTrackingFile';
  // 表示文件解析完成
  static PARSED_EVENT = 'PARSED';
  // 把 FTP 中的轨迹文件信息提取
  static EXTRACTED_EVENT = 'EXTRACTED';
  // 把 FTP 中的轨迹文件删除
  static ARCHIVED_EVENT = 'ARCHIVED';
  // 文件推送完成
  static PUSHED_EVENT = 'PUSHED';
  // 不需要解析的
  static IGNORED_EVENT ='IGNORED';
}
