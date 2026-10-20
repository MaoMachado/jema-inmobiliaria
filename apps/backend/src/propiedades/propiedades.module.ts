import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module.js';
import { PropiedadesController } from './propiedades.controller';
import { PropiedadesService } from './propiedades.service';
import { RetencionDocumentosService } from './retencion-documentos.service';

@Module({
  imports: [StorageModule],
  providers: [PropiedadesService, RetencionDocumentosService],
  controllers: [PropiedadesController],
})
export class PropiedadesModule {}
