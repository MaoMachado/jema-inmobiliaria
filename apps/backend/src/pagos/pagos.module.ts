import { Module } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { PlanExpiraService } from './plan-expira.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageModule } from '../storage/storage.module';
import { WompiClient } from './wompi.client';
import { WompiController } from './wompi.controller';
import { WompiService } from './wompi.service';

@Module({
  imports: [StorageModule],
  controllers: [PagosController, WompiController],
  providers: [
    PagosService,
    PlanExpiraService,
    PrismaService,
    WompiClient,
    WompiService,
  ],
  exports: [PagosService],
})
export class PagosModule {}
