import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import awsConfig from './aws.config';

@Injectable()
export class AwsService {
  private s3 = new AWS.S3();

  constructor(
    @Inject(awsConfig.KEY)
    private awsConfiguration: ConfigType<typeof awsConfig>,
  ) {
    this.s3.config.update({
      accessKeyId: this.awsConfiguration.accessKeyId,
      secretAccessKey: this.awsConfiguration.secretAccessKey,
    });
  }

  async uploadFile(file: any, path: string, bucket: string): Promise<void> {
    const params = {
      Body: file,
      Bucket: bucket,
      Key: path,
    };
    await this.s3.putObject(params).promise();
  }

  async download(path: string, bucket: string, options?: any) {
    const params = {
      Bucket: bucket,
      Key: path,
    };
    if (options) {
      Object.assign(params, options);
    }
    const result = await this.s3.getObject(params).promise();
    return result.Body;
  }

  async downloadStream(path: string, bucket: string, options?: any) {
    const params = {
      Bucket: bucket,
      Key: path,
    };
    if (options) {
      Object.assign(params, options);
    }
    return await this.s3.getObject(params).createReadStream();
  }

  async deleteFile(path: string, bucket: string): Promise<void> {
    const params = {
      Bucket: bucket,
      Key: path,
    };
    await this.s3.deleteObject(params).promise();
  }

  async listObjectsPageable(request: S3Request): Promise<any> {
    const params = {
      Bucket: request.bucket /* required */,
      Prefix: request.prefix /* required */,
      // pageable params
      MaxKeys: request.maxKeys,
      ContinuationToken: request.nextContinuationToken,
      StartAfter: request.startAfter,
    };
    return new Promise(resolve => {
      this.s3.listObjectsV2(params, function(err, data) {
        const response = err || data;
        resolve(response);
      });
    });
  }

  async setObjectPublicRead(path: string, bucket: string): Promise<void> {
    const params = {
      Bucket: bucket,
      Key: path,
      ACL: 'public-read',
    };
    await this.s3.putObjectAcl(params).promise();
  }

  async setObjectPrivate(path: string, bucket: string): Promise<void> {
    const params = {
      Bucket: bucket,
      Key: path,
      ACL: 'private',
    };
    await this.s3.putObjectAcl(params).promise();
  }

  getSignedUrl(
    path: string,
    bucket: string,
    expire: number,
    type: 'getObject' | 'putObject' = 'getObject',
    contentType = 'application/octet-stream',
    ACL?: string,
  ) {
    const params = {
      Bucket: bucket,
      Key: path,
      Expires: expire,
    } as any;
    if (type === 'putObject') {
      params.ContentType = contentType;
    }
    if (ACL) {
      params.ACL = ACL;
    }
    return this.s3.getSignedUrl(type, params);
  }

  async exists(key, bucket): Promise<boolean> {
    const result = await this.head(key, bucket);
    return !!result.ETag;
  }

  /**
   * result:
        {
         AcceptRanges: "bytes",
         ContentLength: 3191,
         ContentType: "image/jpeg",
         ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"",
         LastModified: <Date Representation>,
         Metadata: {},
         VersionId: "null"
        }
   *
   * @param key
   * @param bucket
   */
  async head(key, bucket): Promise<any> {
    const params = {
      Bucket: bucket,
      Key: key,
    };
    return this.s3
      .headObject(params)
      .promise()
      .catch(err => err);
  }

  /**
   * 复制单个对象到指定位置
   */
  async copyObject(copyObjectDto: CopyObjectDto) {
    let sourceObject;
    if (copyObjectDto.sourceBucket) {
      sourceObject = `${copyObjectDto.sourceBucket}/${copyObjectDto.sourcePath}`;
    } else {
      sourceObject = `${copyObjectDto.targetBucket}/${copyObjectDto.sourcePath}`;
    }
    const params = {
      Bucket: copyObjectDto.targetBucket,
      CopySource: sourceObject,
      Key: copyObjectDto.targetPath,
    };
    return await this.s3
      .copyObject(params)
      .promise()
      .catch(err => err);
  }

  async deleteObjects(deleteObjectsDto: DeleteObjectsDto) {
    const params = {
      Bucket: deleteObjectsDto.bucket,
      Delete: {
        Objects: deleteObjectsDto.keyArray.map(key => {
          return { Key: key };
        }),
      },
    };
    return await this.s3
      .deleteObjects(params)
      .promise()
      .catch(err => err);
  }

  async selectObjectContent(params) {
    this.s3.selectObjectContent(params, (err, data) => {
      const payload: any = data.Payload;
      payload.on('data', event => {
        if (event.Records) {
          console.log(JSON.stringify(event.Records));
        }
      });
    });
  }

  /**
   * 移动文件
   * @param sourceKey 源路径
   * @param targetKey 目标路径
   */
  async moveObjects(moveObjectDto: MoveObjectDto) {
    await this.copyObject(moveObjectDto);
    await this.deleteObjects({
      bucket: moveObjectDto.sourceBucket || moveObjectDto.targetBucket,
      keyArray: [moveObjectDto.sourcePath],
    });
  }
}

export class S3Request {
  bucket: string;
  prefix: string;
  maxKeys?: number;
  nextContinuationToken?: string;
  startAfter?: string;
}

export class CopyObjectDto {
  targetBucket: string;
  targetPath: string;
  sourcePath: string;
  sourceBucket?: string;
}

export class DeleteObjectsDto {
  bucket: string;
  keyArray: string[];
}

export class MoveObjectDto {
  targetBucket: string;
  targetPath: string;
  sourcePath: string;
  sourceBucket?: string;
}
