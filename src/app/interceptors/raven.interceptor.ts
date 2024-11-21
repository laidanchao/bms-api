import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import * as Sentry from '@sentry/node';
import { RavenInterceptor } from 'nest-raven';
import { switchMapTo, tap } from 'rxjs/operators';

@Injectable()
export class IRavenInterceptor extends RavenInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return of(null).pipe(
      tap(() => {
        const request = context.switchToHttp().getRequest();
        const scope = Sentry.getCurrentHub().pushScope();

        scope.setTag('controller', context.getClass().name);
        scope.setTag('handler', context.getHandler().name);
        scope.setExtra('request.env', process.env.NODE_ENV);
        scope.setExtra('request.url', request.url);
        scope.setExtra('request.method', request.method);
        scope.setExtra('req', request);
        scope.setExtra('request.userId', request.user ? request.user.id : null);
      }),

      switchMapTo(next.handle()),

      tap(
        () => {
          Sentry.getCurrentHub().popScope();
        },
        error => {
          Sentry.configureScope(scope => {
            scope.setTag('status_code', error.stauts);
          });
          Sentry.getCurrentHub().captureException(error);
          Sentry.getCurrentHub().popScope();
        },
      ),
    );
  }
}
