import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ClsModule.register({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          cls.set('platform', 1);
        },
      },
    }),
  ],
})
export class ClsGlobalModule {}
