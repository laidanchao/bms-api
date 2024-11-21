import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemVariableService } from './system-variable.service';
import { SsmSystemVariable } from './system-variable.entity';

@Module({
  providers: [SystemVariableService],
  imports: [TypeOrmModule.forFeature([SsmSystemVariable])],
  exports: [SystemVariableService],
})
export class SystemVariableModule {}
