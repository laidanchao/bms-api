import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '@/modules/crm/client/client.entity';
import { ClientService } from '@/modules/crm/client/client.service';
import { ClientController } from '@/modules/crm/client/client.controller';

@Module({
  providers: [ClientService],
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [ClientController],
  exports: [ClientService],
})
export class ClientModule {
}
