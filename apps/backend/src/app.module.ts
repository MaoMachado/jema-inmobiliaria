import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PropiedadesModule } from './propiedades/propiedades.module';

@Module({
  imports: [AuthModule, PrismaModule, PropiedadesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
