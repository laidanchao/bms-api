import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BusinessException } from '@/app/exception/business-exception';

// !!!xiewenzhen
@Injectable()
export class OrderValidateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    context.getArgs();
    const req: any = context.switchToHttp().getRequest();
    const user = req.user;
    const dto = req.body;
    // todo delete applicationToPlatform
    const platform = dto?.platform || dto?.application;
    const type = user.type;
    if (type === 'ROOT') {
      user.platform.id = platform;
    }
    if (user.platform.id !== platform) {
      throw new BusinessException(`no right access to ${platform} resource!`);
    }
    return next.handle().pipe(
      map(data => {
        return data;
      }),
    );
  }
}
