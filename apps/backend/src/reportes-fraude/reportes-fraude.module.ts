import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ReportesFraudeServices } from './reportes-fraude.service';
import { ReportesFraudeController } from './reportes-fraude.controller';

@Module({
  imports: [StorageModule],
  providers: [ReportesFraudeServices],
  controllers: [ReportesFraudeController],
})
export class ReporteFraude {}
