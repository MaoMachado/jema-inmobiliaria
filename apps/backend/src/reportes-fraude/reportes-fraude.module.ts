import { Module } from '@nestjs/common';
import { ReportesFraudeServices } from './reportes-fraude.service';
import { ReportesFraudeController } from './reportes-fraude.controller';

@Module({
  providers: [ReportesFraudeServices],
  controllers: [ReportesFraudeController],
})
export class ReporteFraude {}
