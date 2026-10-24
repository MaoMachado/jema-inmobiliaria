import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PropiedadesModule } from './propiedades/propiedades.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ReporteFraude } from './reportes-fraude/reportes-fraude.module';
import { IaModule } from './ia/ia.module';
import { PagosModule } from './pagos/pagos.module';
import { OtpModule } from './otp/otp.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { MetricasModule } from './metricas/metricas.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    PropiedadesModule,
    UsuariosModule,
    ReporteFraude,
    IaModule,
    PagosModule,
    OtpModule,
    AuditoriaModule,
    MetricasModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
