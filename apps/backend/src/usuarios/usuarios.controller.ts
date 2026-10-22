import {
  BadRequestException,
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
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestWithUser } from '../common/types/request-with-user';
import { VerificarDto } from './dto/verificar.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { contextoDe } from '../auditoria/contexto-acceso';
import {
  archivosValidos,
  MAX_BYTES,
  TIPOS_DOCUMENTO,
  TIPOS_IMAGEN,
} from '../common/pipes/archivos';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.usuariosService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard, ReauthGuard)
  @Roles('ADMIN')
  @Get(':id/documento')
  async getDocumentoUrl(@Param('id') id: string, @Req() req: RequestWithUser) {
    const url = await this.usuariosService.getUrlDocumentoUsuario(
      id,
      req.user.id,
      contextoDe(req),
    );
    return { url };
  }

  @UseGuards(JwtAuthGuard, RolesGuard, ReauthGuard)
  @Roles('ADMIN')
  @Get(':id/documentos-propiedad')
  async getDocumentosPropiedad(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.usuariosService.getDocumentosPropiedadUsuario(
      id,
      req.user.id,
      contextoDe(req),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('documento')
  @UseInterceptors(
    FileInterceptor('documento', { limits: { fileSize: MAX_BYTES } }),
  )
  subirDocumento(
    @UploadedFile(archivosValidos(TIPOS_DOCUMENTO)) file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo de documento');
    }

    return this.usuariosService.subirDocumento(req.user.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, ReauthGuard)
  @Roles('ADMIN')
  @Patch(':id/verificar-documento')
  verificarDocumento(
    @Param('id') id: string,
    @Body() body: VerificarDto,
    @Req() req: RequestWithUser,
  ) {
    return this.usuariosService.verificarDocumento(
      id,
      body.verificado,
      req.user.id,
      contextoDe(req),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/verificar-telefono')
  verificarTelefono(@Param('id') id: string, @Body() body: VerificarDto) {
    return this.usuariosService.verificarTelefono(id, body.verificado);
  }

  //! Actualizar Datos Usuario
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async cargarPerfil(@Req() req: RequestWithUser) {
    return this.usuariosService.cargarPerfil(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('perfil')
  async actualizarPerfil(
    @Req() req: RequestWithUser,
    @Body() body: ActualizarPerfilDto,
  ) {
    return this.usuariosService.actualizarPerfil(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('foto')
  @UseInterceptors(FileInterceptor('foto', { limits: { fileSize: MAX_BYTES } }))
  async subirFoto(
    @Req() req: RequestWithUser,
    @UploadedFile(archivosValidos(TIPOS_IMAGEN)) file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar una imagen de perfil');
    }

    return this.usuariosService.subirFoto(req.user.id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async cambiarPassword(
    @Req() req: RequestWithUser,
    @Body() body: CambiarPasswordDto,
  ) {
    return this.usuariosService.cambiarPassword(req.user.id, body);
  }
}
