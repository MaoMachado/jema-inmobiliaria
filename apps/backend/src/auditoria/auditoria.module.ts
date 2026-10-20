import { Global, Module } from '@nestjs/common';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { RetencionAuditoriaService } from './retencion-auditoria.service';

@Global()
@Module({
  controllers: [AuditoriaController],
  providers: [AuditoriaService, RetencionAuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
