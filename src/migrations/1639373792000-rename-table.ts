import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameTable1639373792000 implements MigrationInterface{
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
        ALTER TABLE "public"."channel_channel" RENAME TO "channel";

        ALTER TABLE "public"."bill_bill_task" RENAME TO "bill_task";
        ALTER TABLE "public"."bill_bill_task_template" RENAME TO "bill_task_template";
        ALTER TABLE "public"."colissimo_invoice_metadata" RENAME TO "bill_colissimo_invoice_metadata";

        ALTER TABLE "public"."bill_region_distribution" RENAME TO "statistic_bill_region_distribution";
        ALTER TABLE "public"."bill_weight_distribution" RENAME TO "statistic_bill_weight_distribution";
        ALTER TABLE "public"."declare_quantity_distribution" RENAME TO "statistic_declare_quantity_distribution";
        ALTER TABLE "public"."parcel_aging" RENAME TO "statistic_parcel_aging";
        ALTER TABLE "public"."average_parcel_aging" RENAME TO "statistic_average_parcel_aging";
        ALTER TABLE "public"."pfc" RENAME TO "statistic_pfc";
        ALTER TABLE "public"."pfc_trip_time" RENAME TO "statistic_pfc_trip_time";
        ALTER TABLE "public"."transfer_quantity_distribution" RENAME TO "statistic_transfer_quantity_distribution";

        ALTER TABLE "public"."task_index" RENAME TO "job_task_index";

        ALTER TABLE "public"."colissimo_tracking_file" RENAME TO "tracking_file";
        ALTER TABLE "public"."craw_parcel_task_scheduler" RENAME TO "tracking_craw_parcel_task_scheduler";
        ALTER TABLE "public"."event" RENAME TO "tracking_file_event";
        ALTER TABLE "public"."parcelSyncLog" RENAME TO "tracking_parcel_sync_log";
        ALTER TABLE "public"."parcelTrashCan" RENAME TO "tracking_parcel_trash_can";
        ALTER TABLE "public"."parcel_relation" RENAME TO "tracking_parcel_relation";
        ALTER TABLE "public"."webhook" RENAME TO "tracking_webhook";

        ALTER TABLE "public"."city_postal_code" RENAME TO "api_city_postal_code";
        ALTER TABLE "public"."city_rule_config" RENAME TO "api_city_rule_config";
        ALTER TABLE "public"."order" RENAME TO "api_order";
        ALTER TABLE "public"."orderParcel" RENAME TO "api_order_parcel";
        ALTER TABLE "public"."request-param" RENAME TO "api_request_param";
        ALTER TABLE "public"."transporter_methods" RENAME TO "api_transporter_method";
        ALTER TABLE "public"."transporter_rule" RENAME TO "api_transporter_rule";
        ALTER TABLE "public"."zipcodes" RENAME TO "api_zipcode";
        ALTER TABLE "public"."inconsistent_postal_code" RENAME TO "api_inconsistent_postal_code";
    `)
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
        ALTER TABLE "public"."channel" RENAME TO "channel_channel";

        ALTER TABLE "public"."bill_task" RENAME TO "bill_bill_task";
        ALTER TABLE "public"."bill_task_template" RENAME TO "bill_bill_task_template";

        ALTER TABLE "public"."statistic_bill_region_distribution" RENAME TO "bill_region_distribution";
        ALTER TABLE "public"."statistic_bill_weight_distribution" RENAME TO "bill_weight_distribution";
        ALTER TABLE "public"."statistic_declare_quantity_distribution" RENAME TO "declare_quantity_distribution";
        ALTER TABLE "public"."statistic_parcel_aging" RENAME TO "parcel_aging";
        ALTER TABLE "public"."statistic_average_parcel_aging" RENAME TO "average_parcel_aging";
        ALTER TABLE "public"."statistic_pfc" RENAME TO "pfc";
        ALTER TABLE "public"."statistic_pfc_trip_time" RENAME TO "pfc_trip_time";
        ALTER TABLE "public"."statistic_transfer_quantity_distribution" RENAME TO "transfer_quantity_distribution";

        ALTER TABLE "public"."job_task_index" RENAME TO "task_index";

        ALTER TABLE "public"."tracking_file" RENAME TO "colissimo_tracking_file";
        ALTER TABLE "public"."tracking_craw_parcel_task_scheduler" RENAME TO "craw_parcel_task_scheduler";
        ALTER TABLE "public"."tracking_file_event" RENAME TO "event";
        ALTER TABLE "public"."tracking_parcel_sync_log" RENAME TO "parcelSyncLog";
        ALTER TABLE "public"."tracking_parcel_trash_can" RENAME TO "parcelTrashCan";
        ALTER TABLE "public"."tracking_parcel_relation" RENAME TO "parcel_relation";
        ALTER TABLE "public"."tracking_webhook" RENAME TO "webhook";

        ALTER TABLE "public"."api_city_postal_code" RENAME TO "city_postal_code";
        ALTER TABLE "public"."api_city_rule_config" RENAME TO "city_rule_config";
        ALTER TABLE "public"."api_order" RENAME TO "order";
        ALTER TABLE "public"."api_order_parcel" RENAME TO "orderParcel";
        ALTER TABLE "public"."api_request_param" RENAME TO "request-param";
        ALTER TABLE "public"."api_transporter_method" RENAME TO "transporter_methods";
        ALTER TABLE "public"."api_transporter_rule" RENAME TO "transporter_rule";
        ALTER TABLE "public"."api_zipcode" RENAME TO "zipcodes";
        ALTER TABLE "public"."api_inconsistent_postal_code" RENAME TO "inconsistent_postal_code";
    `)
  }

}
