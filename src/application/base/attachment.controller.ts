import { AwsService } from '@/domain/external/aws/aws.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('/api/cms/attachment')
export class AttachmentController {
  constructor(private s3Service: AwsService, private configService: ConfigService) {}

  @Post('/sign')
  getSignUrl(@Body() keys: Array<string>) {
    return keys.map(key => {
      return {
        key,
        filePath: this.s3Service.getSignedUrl(key, this.configService.get('Bucket').cms, 900),
      };
    });
  }

  @Post('/putSign')
  putSignUrl(@Body() body) {
    return {
      body: body.key,
      filePath: this.s3Service.getSignedUrl(
        body.key,
        this.configService.get('Bucket').cms,
        900,
        'putObject',
        body.contentType,
        body.ACL,
      ),
    };
  }
}
