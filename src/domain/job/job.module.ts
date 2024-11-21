import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelPush } from '@/domain/npm/parcel-push/entity/parcel-push.entity';
import { ConfigModule } from '@nestjs/config';
import { TransporterZoneRepository } from '@/domain/sci/transporter-zone/repository/transporter-zone.repository';
import { ExternalModule } from '@/domain/external/external.module';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { ParcelPushLogRepository } from '@/domain/npm/parcel-push/repository/parcel-push-log.repository';
import { ParcelPushRequestRepository } from '@/domain/npm/parcel-push/repository/parcel-push-request.repository';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import { CrawlerPlanManagerJob } from '@/domain/job/sct/crawler-plan-manager-job.service';
import { ParcelAgingJob } from '@/domain/job/srs/parcel-aging.job';
import { ParseFileRecordJob } from '@/domain/job/sct/parse-file-record-job.service';
import { CrawlerPlanExecutorJob } from '@/domain/job/sct/crawler-plan-executor-job.service';
import { ClearCMFileRecordJob } from '@/domain/job/sct/clear-cm-file-record-job.service';
import { ClearCPFileRecordJob } from '@/domain/job/sct/clear-cp-file-record-job.service';
import { ColispriveUpdateZipcodesJob } from '@/domain/job/sci/colisprive-update-zipcodes.job';
import { ColissimoInvoiceUploadS3Job } from '@/domain/job/scb/colissimo-invoice-upload-s3.job';
import { FileDistributeJob } from '@/domain/job/base/file-distribute.job';
import { TrackingFileDistributeJob } from '@/domain/job/base/tracking-file-distribute.job';
import { MetadataExtractService } from '@/domain/job/sct/service/metadata-extract.service';
import { CountDailyParcelQuantityJob } from '@/domain/job/srs/count-daily-parcel-quantity.job';
import { AverageParcelAgingRepository } from '@/domain/srs/average-parcel-aging/repository/average-parcel-aging.repository';
import { QuantityDistributionRepository } from '@/domain/srs/quantity-distribution/repository/quantity-distribution.repository';
import { CMTrackingExtractJob } from '@/domain/job/sct/cm-tracking-extract-job.service';
import { BillDetailRepository } from '@/domain/scb/bill/repository/bill-detail.repository';
import { TrackingSyncWarningJob } from '@/domain/job/npm/tracking-sync-warning.job';
import { CrawlerPlanRepository } from '@/domain/sct/crawler/repository/crawler-plan.repository';
import { Track17RequestService } from '@/domain/sct/webhook/service/track17-request.service';
import { Track17RequestRepository } from '@/domain/sct/webhook/repository/track17-request.repository';
import { TrackingRepository } from '@/domain/sct/core/repository/tracking.repository';
import { SctModule } from '@/domain/sct/sct.module';
import { CrawlerTargetRepository } from '@/domain/sct/crawler/repository/crawler-target.repository';
import { CrawlerPlanService } from '@/domain/sct/crawler/service/crawler-plan.service';
import { CrawlerTargetService } from '@/domain/sct/crawler/service/crawler-target.service';
import { NpmModule } from '../npm/npm.module';
import { ParcelPushJob } from '@/domain/job/npm/parcel-push.job';
import { TrackingPushJob } from '@/domain/job/npm/tracking-push.job';
import { EventPushJob } from '@/domain/job/npm/event-push.job';
import { ClearedTrackingListener } from '@/domain/job/sct/service/cleared-tracking.listener';
import { TrackingListener } from '@/domain/job/sct/service/tracking.listener';
import { TrackingHandleListener } from '@/domain/job/sct/service/tracking-handle.listener';
import { OutsideParcelListener } from '@/domain/job/order/service/outside-parcel.listener';
import { KafkaModule } from '@rob3000/nestjs-kafka';
import { OrdModule } from '@/domain/ord/ord.module';
import { DingtalkJob } from '@/domain/job/base/dingtalk.job';
import { DashboardJob } from '@/domain/job/srs/dashboard.job';
import { DashboardService } from '@/domain/srs/dashboard/service/dashboard.service';
import { CrawlerProcessService } from '@/domain/job/sct/service/crawler-process.service';
import { CrawlerConfig } from '@/domain/sct/crawler/entity/crawler-config.entity';
import { ScbModule } from '@/domain/scb/scb.module';
import { SciModule } from '@/domain/sci/sci.module';
import { SrsModule } from '@/domain/srs/srs.module';
import { CamModule } from '@/domain/cam/cam.module';
import { JobController } from '@/application/job/job.controller';
import { GenerateSurchargePriceJob } from '@/domain/job/scb/generate-surcharge-price.job';
import { SaveServerlessResultListener } from '@/domain/job/scb/save-serverless-result.listener';
import { MyKafkaService } from '@/domain/external/microservices/my-kafka.service';
import { GenerateInvoiceDetailJob } from '@/domain/job/scb/generate-invoice-detail.job';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { InternalMonitorDataJob } from '@/domain/job/sct/internal-monitor-data-job.service';
import { CPTrackingExtractJob } from '@/domain/job/sct/cp-tracking-extract-job.service';
import { TrackingMonitorDataJob } from '@/domain/job/sct/tracking-monitor-job.service';
import { Track17RequestJob } from '@/domain/job/sct/track17-request-job';
import { Track17CollectJob } from '@/domain/job/sct/track17-collect-job';
import { FtpSetting } from '@/domain/sct/file/entity/ftp-setting.entity';
import { CrawlerService } from '@/domain/sct/crawler/service/crawler.service';
import { TrackingInsertService } from '@/domain/sct/core/service/tracking-insert.service';
import { RequestLog } from '@/domain/ord/request-log/entity/request-log.entity';
import { CMESDTrackingExtractJob } from '@/domain/job/sct/cm-esd-tracking-extract-job.service';
import { CrawlerPlanMergeJob } from '@/domain/job/sct/crawler-plan-merge-job.service';
import { InvoicePushListener } from '@/domain/job/order/service/invoice-push.listener';
import { CrawlerPlanDailyReportJob } from '@/domain/job/sct/crawler-plan-daily-report-job';
import { TrackingHandlerNewService } from '@/domain/sct/core/service/tracking-handler-new.service';
import { InternalMonitorDataFixJob } from '@/domain/job/sct/internal-monitor-data-fix-job';
import { ClearCMEsdFileRecordJob } from '@/domain/job/sct/clear-cm-esd-file-record-job.service';
import { MREsdTrackingExtractJob } from '@/domain/job/sct/mr-esd-tracking-extract-job.service';
import { ClearMREsdFileRecordJob } from '@/domain/job/sct/clear-mr-esd-file-record-job.service';
import { ParcelProofModule } from '@/domain/ord/parcel-proof/parcel-proof.module';
import { ModifyParcelLastmilePrividerJob } from '@/domain/job/sci/modify-parcel-lastmile-privider.job';
import { DeleteLastmilePrividerModificationJob } from '@/domain/job/sci/delete-lastmile-privider-modification.job';
import { DISPEOESDTrackingExtractJob } from '@/domain/job/sct/dispeo-esd-tracking-extract-job.service';
import { ClearDISPEOEsdFileRecordJob } from '@/domain/job/sct/clear-dispeo-esd-file-record-job.service';
import { SsmModule } from '@/domain/base/ssm/ssm.module';

export const normalJobs = [
  ParcelPushJob,
  CountDailyParcelQuantityJob,
  CrawlerPlanManagerJob,
  CrawlerPlanMergeJob,
  ParcelAgingJob,
  ParseFileRecordJob,
  CrawlerPlanExecutorJob,
  TrackingPushJob,
  TrackingSyncWarningJob,
  Track17RequestJob,
  Track17CollectJob,
  DingtalkJob,
  DashboardJob,
  GenerateSurchargePriceJob,
  GenerateInvoiceDetailJob,
  InternalMonitorDataJob,
  InternalMonitorDataFixJob,
  TrackingMonitorDataJob,
  CrawlerPlanDailyReportJob,
  ModifyParcelLastmilePrividerJob,
  DeleteLastmilePrividerModificationJob,
];
export const ftpJobs = [
  ClearCMFileRecordJob,
  ClearCMEsdFileRecordJob,
  ClearDISPEOEsdFileRecordJob,
  ClearCPFileRecordJob,
  ClearMREsdFileRecordJob,
  CMTrackingExtractJob,
  CMESDTrackingExtractJob,
  DISPEOESDTrackingExtractJob,
  MREsdTrackingExtractJob,
  CPTrackingExtractJob,
  ColispriveUpdateZipcodesJob,
  ColissimoInvoiceUploadS3Job,
  FileDistributeJob,
  TrackingFileDistributeJob,
  EventPushJob,
];
export const restJobs = [];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrackingRepository,
      TransporterZoneRepository,
      ParcelPush,
      ParcelPushLogRepository,
      ParcelPushRequestRepository,
      CamChannel,
      CrawlerTargetRepository,
      CrawlerPlanRepository,
      CrawlerConfig,
      AverageParcelAgingRepository,
      QuantityDistributionRepository,
      BillDetailRepository,
      Track17RequestRepository,
      FtpSetting,
      RequestLog,
    ]),
    ConfigModule,
    ExternalModule,
    OrdModule,
    AwsModule,
    ScbModule,
    SctModule,
    SciModule,
    SrsModule,
    KafkaModule,
    CamModule,
    SsmModule,
    NpmModule,
    ParcelProofModule,
  ],
  providers: [
    ...normalJobs,
    ...ftpJobs,
    ...restJobs,
    MetadataExtractService,
    CrawlerPlanService,
    CrawlerTargetService,
    // jobs
    Track17RequestService,
    ClearedTrackingListener,
    TrackingListener,
    TrackingHandleListener,
    OutsideParcelListener,
    InvoicePushListener,
    SaveServerlessResultListener,
    DashboardService,
    CrawlerProcessService,
    MyKafkaService,
    TrackingService,
    TrackingInsertService,
    CrawlerService,
    TrackingHandlerNewService,
  ],
  controllers: [JobController],
  exports: [
    ...normalJobs,
    ...ftpJobs,
    ...restJobs,
    MetadataExtractService,
    CrawlerPlanService,
    CrawlerTargetService,
    // jobs
    Track17RequestService,
    ClearedTrackingListener,
    SaveServerlessResultListener,
    TrackingListener,
    TrackingHandleListener,
    OutsideParcelListener,
    DashboardService,
    CrawlerProcessService,
  ],
})
export class JobModule {}
