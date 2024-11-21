import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransporterMethods } from '@/domain/sci/transporter-method/transporter-methods.entity';
import { TransporterMethodsService } from '@/domain/sci/transporter-method/transporter-methods.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransporterMethods])],
  providers: [TransporterMethodsService],
  exports: [TransporterMethodsService],
})
export class TransporterMethodsModule {}
