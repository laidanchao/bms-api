import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { getRepository, In } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { TaskAdapter } from '../task-adapter';
import { LastmileProvider, Transporter } from '@/domain/utils/Enums';
import { ParcelProof, ProofType, TaskDetailStatus } from '@/domain/ord/parcel-proof/entity/parcel-proof.entity';
import { Response } from 'express';
import _ from 'lodash';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { AccountInfoDto } from '@/domain/ord/parcel-proof/dto/account-info.dto';
import { CrawlProofDto } from '@/domain/ord/parcel-proof/dto/crawl-proof.dto';
import { ClsService } from 'nestjs-cls';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { ReceiverInfoDto } from '@/domain/ord/parcel-proof/dto/receiver-info.dto';
import { RequestLog } from '@/domain/ord/request-log/entity/request-log.entity';
import { RequestStatusEnum } from '@/domain/ord/request-log/enum/requestStatus.enum';

@Injectable()
export class ParcelProofService extends TypeOrmCrudService<ParcelProof> {
  private Bucket: string;
  private CmsBaseUrl: string;
  private Logger = new Logger('ParcelProofService');

  constructor(
    @InjectRepository(ParcelProof) repo,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
    private readonly xPushService: XPushService,
    private readonly cls: ClsService,
  ) {
    super(repo);
    this.Bucket = this.configService.get('Bucket').cms;
    this.CmsBaseUrl = this.configService.get('BaseUrl').CMSNestApi;
  }

  async crawlProofs(body: CrawlProofDto, userName?: string) {
    const { trackingNumbers, lastmileProvider, proofType, lang: language } = body;

    const trackingNumberFormat = _.chain(trackingNumbers)
      .map(t => t.trim())
      .uniq()
      .value();

    await this._checkSameClientIdAndLastmileProvider(trackingNumberFormat, lastmileProvider);
    for (const trackingNumber of trackingNumberFormat) {
      try {
        await this.crawlProof(trackingNumber, proofType, false, language, userName);
      } catch (e) {}
    }
  }

  /**
   * 抓取单个凭证
   * 1. 获取账号信息
   * 2. 创建任务
   * 3. 获取凭证截图并保存S3
   * 4. 创建任务明细和更新任务状态
   * @param trackingNumber
   * @param proofType
   * @param language
   * @param userName
   * @return 返回url
   */
  async crawlProof(
    trackingNumber: string,
    proofType: ProofType,
    isGenerate: boolean,
    language?: string,
    userName?: string,
  ): Promise<string> {
    // 1. 获取账号信息
    const {
      accountInfo,
      parcelPlatform,
      clientId,
      lastmileProvider,
      arrivedAt,
    } = await this._getAccountInfoAndLastmileProvider(trackingNumber, isGenerate);

    // 行权限校验
    const pType = this.cls.get('permissionType');
    if (pType === PermissionTypeEnum.PLATFORM) {
      const platform = this.cls.get('platform');
      if (platform !== parcelPlatform) {
        throw new Error(`Failed, Parcel does not belong to platform:${platform}`);
      }
    }
    if (pType === PermissionTypeEnum.CLIENT) {
      const client = this.cls.get('client');
      if (client !== clientId) {
        throw new Error(`Failed, Parcel does not belong to client:${client}`);
      }
    }

    const existDetail = await getRepository(ParcelProof).findOne({
      trackingNumber,
      proofType: proofType,
    });

    // 如果已经成功生成则直接返回
    if (existDetail && existDetail.status === TaskDetailStatus.SUCCESS) {
      return existDetail.fileUrl;
    }

    const parcelProof = {
      proofType: proofType,
      trackingNumber,
      createdBy: userName,
      language,
    } as ParcelProof;

    // 有记录更新记录
    if (existDetail) {
      parcelProof.id = existDetail.id;
    }

    parcelProof.lastmileProvider = lastmileProvider;
    parcelProof.platform = parcelPlatform;
    parcelProof.clientId = clientId;

    try {
      // 3. 获取包裹截图并保存S3
      const { filePath, fileUrl } = await this._crawlProofAndSaveS3(
        trackingNumber,
        <LastmileProvider>lastmileProvider,
        arrivedAt,
        proofType,
        accountInfo,
        isGenerate,
        language,
      );
      // 4. 创建任务明细和更新任务状态
      parcelProof.filePath = filePath;
      parcelProof.fileUrl = fileUrl;
      parcelProof.status = TaskDetailStatus.SUCCESS;
    } catch (e) {
      // 5. 创建任务明细和更新任务状态
      parcelProof.status = TaskDetailStatus.FAILED;
      parcelProof.failReason = e?.message || JSON.stringify(e);

      throw e;
    } finally {
      await getRepository(ParcelProof).save(parcelProof);
    }

    return parcelProof.fileUrl;
  }

  /**
   * 获取包裹截图文件
   * @param trackingNumber
   * @param proofType
   * @param res
   */
  async getParcelPictureFile(trackingNumber: string, proofType: ProofType, res: Response) {
    try {
      const detail = await getRepository(ParcelProof).findOne({
        trackingNumber,
        proofType: proofType,
        status: TaskDetailStatus.SUCCESS,
      });
      if (!detail) {
        throw new Error('文件不存在');
      }

      const readStream = await this.awsService.downloadStream(detail.filePath, this.Bucket);
      readStream.on('error', error => {
        res.status(HttpStatus.FORBIDDEN).json({ message: error.message, code: HttpStatus.FORBIDDEN });
      });
      const fileName = detail.filePath.split('/').pop();
      res.set({
        'Content-type': 'application/octet-stream',
        'Content-Disposition': 'inline;filename=' + encodeURI(fileName),
      });
      readStream.pipe(res);
    } catch (e) {
      this.Logger.error(e);
      throw new Error('获取重量截图错误：' + e.message);
    }
  }

  /**
   * 判断包裹是否属于同一个客户 和 同一个尾程供应商
   * @param trackingNumbers
   * @param lastmileProvider
   */
  private async _checkSameClientIdAndLastmileProvider(trackingNumbers: string[], lastmileProvider = null) {
    const parcels = await getRepository(Parcel).find({
      where: {
        trackingNumber: In(trackingNumbers),
      },
    });

    if (_.isEmpty(parcels)) {
      throw new Error('Failed, Parcel does not exist');
    }
    const clientIds = _.chain(parcels)
      .map('clientId')
      .uniq()
      .value();
    if (clientIds.length > 1) {
      throw new Error('Failed, all parcels should belong to the same client');
    }

    const lastmileProviders = _.chain(parcels)
      .map('lastmileProvider')
      .uniq()
      .value();
    if (lastmileProviders.length > 1) {
      throw new Error('Failed, all parcels should belong to the same lastmile provider');
    }

    if (lastmileProvider && lastmileProviders[0] !== lastmileProvider) {
      throw new Error('Failed, Parcel does not belong to this lastmile provider');
    }

    // 行权限校验
    const pType = this.cls.get('permissionType');
    if (pType === PermissionTypeEnum.PLATFORM) {
      const platform = this.cls.get('platform');
      const parcel = parcels.find(s => s.platform !== platform);
      if (parcel) {
        throw new Error(`Failed, Parcel(${parcel.trackingNumber}) does not belong to platform:${platform}`);
      }
    }
    if (pType === PermissionTypeEnum.CLIENT) {
      const client = this.cls.get('client');
      const parcel = parcels.find(s => s.clientId !== client);
      if (parcel) {
        throw new Error(`Failed, Parcel(${parcel.trackingNumber}) does not belong to client:${client}`);
      }
    }

    return parcels[0];
  }

  /**
   * 获取账号信息和派送商
   * @param trackingNumber
   * @private
   */
  private async _getAccountInfoAndLastmileProvider(trackingNumber: string, isGenerate: boolean) {
    const parcel = await getRepository(Parcel).findOne({
      trackingNumber,
    });
    if (!parcel) {
      throw new Error(`Failed, Parcel does not exist :${trackingNumber}`);
    }

    // 只能生成已妥投的法邮包裹
    if (isGenerate) {
      if (!parcel.arrivedAt) {
        throw new Error(`Parcel not arrived`);
      }
      if (parcel.transporter !== Transporter.COLISSIMO.toString()) {
        throw new Error(`Can't get POD, please contact IT`);
      }
    }

    const { accountInfo } = await getRepository(Account).findOne({
      account: parcel.transporterAccountId,
    });

    if (!accountInfo) {
      throw new Error(`未找到账密配置:${parcel.transporterAccountId}`);
    }

    const accountData: AccountInfoDto = {};
    switch (<Transporter>parcel.transporter) {
      case Transporter.COLISSIMO:
        accountData.username = accountInfo.contractNumber;
        accountData.password = accountInfo.password;
        accountData.account = parcel.transporterAccountId;
        break;
      case Transporter.COLISPRIVE:
        accountData.username = accountInfo.AgenceUsername || '';
        accountData.password = accountInfo.AgencePassword || '';
        break;
      case Transporter.COLICOLI:
        accountData.jwtToken = accountInfo.apiToken;
        break;
      case Transporter.DPD:
      case Transporter.DPD_CN:
        accountData.account = `${accountInfo.center}-${accountInfo.number}`;
        break;
      default:
        break;
    }

    return {
      accountInfo: accountData,
      lastmileProvider: parcel.lastmileProvider,
      parcelPlatform: parcel.platform,
      clientId: parcel.clientId,
      arrivedAt: parcel.arrivedAt,
    };
  }

  /**
   * 抓取包裹截图并保存到S3
   * @param trackingNumber
   * @param lastmileProvider
   * @param proofType
   * @param accountInfo
   * @param language
   * @private
   */
  private async _crawlProofAndSaveS3(
    trackingNumber: string,
    lastmileProvider: LastmileProvider,
    arrivedAt: Date,
    proofType: string,
    accountInfo: AccountInfoDto,
    isGenerate: boolean,
    language?: string,
  ) {
    const executor = new TaskAdapter().getExecutor(lastmileProvider);

    let taskResult;
    switch (proofType) {
      case ProofType.POW:
        taskResult = await executor.crawlWeightPicture(trackingNumber, accountInfo);
        break;
      case ProofType.POD:
        if (isGenerate) {
          const receiverInfo = await this.getReceiverInfo(trackingNumber, arrivedAt);
          taskResult = await executor.generatePod(trackingNumber, receiverInfo, language);
        } else {
          taskResult = await executor.crawlPod(trackingNumber, accountInfo, language);
        }
        break;
      default:
        throw new Error('任务类型有误');
        break;
    }

    const { path: filePath, fileUrl, fileName } = this._getPathAndUrl(
      taskResult.extension,
      proofType,
      lastmileProvider,
      trackingNumber,
    );
    await this.awsService.uploadFile(taskResult.buffer, filePath, this.Bucket);
    return {
      fileName,
      filePath,
      fileUrl,
      buffer: taskResult.buffer,
    };
  }

  private _getPathAndUrl(
    extension: string,
    proofType: ProofType,
    lastmileProvider: LastmileProvider,
    code: string,
  ): { path: string; fileUrl: string; fileName: string } {
    let partPath;
    switch (proofType) {
      case ProofType.POD:
        partPath = 'pod';
        break;
      case ProofType.POW:
        partPath = 'pow';
        break;
      default:
        break;
    }

    const fileName = `${partPath}_${code}.${extension}`;
    const fileUrl = `${this.CmsBaseUrl}/task/file/${partPath}/${code}`;

    return {
      path: `task/${lastmileProvider}/${fileName}`,
      fileUrl,
      fileName,
    };
  }

  private async getReceiverInfo(trackingNumber: string, arrivedAt: Date) {
    const requestLog = await getRepository(RequestLog).findOne({
      trackingNumber,
      status: RequestStatusEnum.SUCCESS,
    });
    if (!requestLog) {
      throw new Error('获取不到地址详情');
    }
    const { receiverAddress } = JSON.parse(requestLog.requestBody);
    const receiverInfo: ReceiverInfoDto = {
      lastName: receiverAddress.lastName,
      city: receiverAddress.city,
      postCode: receiverAddress.postalCode,
      arrivedAt: arrivedAt,
      street1: receiverAddress.street1,
      street2: receiverAddress.street2,
      street3: receiverAddress.street3,
    };

    return receiverInfo;
  }
}
