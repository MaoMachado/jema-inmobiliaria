import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PropiedadesModule } from './propiedades/propiedades.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ReporteFraude } from './reportes-fraude/reportes-fraude.module';
import { IaModule } from './ia/ia.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    PropiedadesModule,
    UsuariosModule,
    ReporteFraude,
    IaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
