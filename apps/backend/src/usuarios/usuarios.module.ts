import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  providers: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
