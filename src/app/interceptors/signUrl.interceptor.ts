import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';

/**
 * 修改结果字段
 * 请求头添加
 * sign boolean 是否获取加密下载url
 * field string s3 key 数据字段
 * fileurl string 下载url
 */
@Injectable()
export class SignUrlInterceptor implements NestInterceptor {
  constructor(private s3: AwsService, private configService: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { sign, field, fileurl: newField } = req.headers;
    if ((sign || sign === 'true') && field) {
      return next.handle().pipe(
        map(res => {
          res.data.forEach(item => {
            const signUrl = item[field]
              ? this.s3.getSignedUrl(item[field], this.configService.get('Bucket').cms, 60 * 60 * 24)
              : item[field];
            if (newField) {
              item[newField] = signUrl;
            } else {
              item[field] = signUrl;
            }
            return item;
          });
          return res;
        }),
      );
    }
    return next.handle();
  }
}
