import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module.js';
import { PropiedadesController } from './propiedades.controller';
import { PropiedadesService } from './propiedades.service';

@Module({
  imports: [StorageModule],
  providers: [PropiedadesService],
  controllers: [PropiedadesController],
})
export class PropiedadesModule {}
