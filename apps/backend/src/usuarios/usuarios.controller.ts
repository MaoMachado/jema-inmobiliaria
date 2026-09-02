import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestWithUser } from '../common/types/request-with-user';
import { VerificarDto } from './dto/verificar.dto';

type MulterFile = Express.Multer.File;

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.usuariosService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id/documento')
  async getDocumentoUrl(@Param('id') id: string) {
    const url = await this.usuariosService.getUrlDocumentoUsuario(id);
    return { url };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id/documentos-propiedad')
  async getDocumentosPropiedad(@Param('id') id: string) {
    return this.usuariosService.getDocumentosPropiedadUsuario(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('documento')
  @UseInterceptors(FileInterceptor('documento'))
  subirDocumento(
    @UploadedFile() file: MulterFile,
    @Req() req: RequestWithUser,
  ) {
    return this.usuariosService.subirDocumento(req.user.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/verificar-documento')
  verificarDocumento(@Param('id') id: string, @Body() body: VerificarDto) {
    return this.usuariosService.verificarDocumento(id, body.verificado);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/verificar-telefono')
  verificarTelefono(@Param('id') id: string, @Body() body: VerificarDto) {
    return this.usuariosService.verificarTelefono(id, body.verificado);
  }
}
