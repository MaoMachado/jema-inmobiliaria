import { Module } from '@nestjs/common';
import { IaController } from './ia.controller';
import { IaServices } from './ia.service';

@Module({
  controllers: [IaController],
  providers: [IaServices],
  exports: [IaServices],
})
export class IaModule {}
