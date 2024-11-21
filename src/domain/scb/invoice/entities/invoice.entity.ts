import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';
import { IsDate, IsNumber, IsString } from 'class-validator';

@Entity('scb_invoice')
export class ScbInvoice extends BasicEntity {
  @Column('varchar', { comment: '账单月' })
  month: string;

  @Column('varchar')
  billType: string;

  @Column('varchar', { comment: '主账单账号' })
  account: string;

  @Column('varchar', { comment: '渠道下单账号' })
  channelAccount: string;

  @IsString()
  @Column('varchar', { nullable: true })
  originalFileUrl: string;

  @IsDate()
  @Column('timestamp with time zone', { nullable: true })
  uploadOriginalFileAt: Date;

  @Column('varchar')
  transporter: string;

  @Column('varchar', { comment: '平台' })
  platform: string;

  @Column('varchar', { default: 'CREATED' })
  status: AnalysisStatusEnum;

  @Column('json', { default: '{}' })
  result: Record<string, Record<string, any>> = {};

  @IsString()
  @Column('varchar')
  name: string;

  @IsString()
  @Column('varchar')
  operator: string;

  @Column('boolean')
  isPushed: boolean; //是否推送到oms

  @IsNumber()
  @Column('bigint', { comment: '文件大小' })
  size: number;

  @Column('varchar', { comment: 'sftp账号' })
  sftpAccount: string;

  constructor(
    month: string,
    billType: string,
    account: string,
    transporter: string,
    platform: string,
    name: string,
    size: number,
    sftpAccount: string,
  ) {
    super();
    this.month = month;
    this.billType = billType;
    this.account = account;
    this.transporter = transporter;
    this.platform = platform;
    this.name = name;
    this.size = size;
    this.sftpAccount = sftpAccount;
  }
}

export enum InvoiceTypeEnum {
  cpIndemnity = 'CP_INDEMNITY',
  cnIndemnity = 'CN_INDEMNITY',
  ccIndemnity = 'COLICOLI_INDEMNITY',
  colisprive = 'COLISPRIVE',
  colicoli = 'COLICOLI',
  colissimo = 'COLISSIMO',
  cainiao = 'CAINIAO',
  express37 = 'EXPRESS37',
}

export enum AnalysisStatusEnum {
  surchargeConfirming = 'surcharge_confirming', //待确认额外费	收到账单
  fuelRateConfirming = 'fuel_rate_confirming', // CP 燃油费待确认
  parsing = 'parsing', // 解析中	确认额外费
  failed = 'failed', // 失败 解析失败
  manualConfirming = 'manual_confirming', // 待人工确认	解析成功
  success = 'success', // 解析成功后人工确认
}
