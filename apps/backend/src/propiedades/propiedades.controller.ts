import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PropiedadesService } from './propiedades.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreatePropiedadDto,
  FiltroPropiedadesDto,
  RechazarPropiedadDto,
  SubirDocumentoDto,
  ToggleDestacadaDto,
  UpdatePropiedadDto,
} from './dto/propiedades.dto';
import type { RequestWithUser } from '../common/types/request-with-user';
import { VerificarDto } from '../usuarios/dto/verificar.dto';

@Controller('propiedades')
export class PropiedadesController {
  constructor(private readonly propiedadesService: PropiedadesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('fotografias', 20))
  create(
    @Body() body: CreatePropiedadDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    return this.propiedadesService.create(body, files ?? [], req.user.id);
  }

  @Get()
  findAll(@Query() query: FiltroPropiedadesDto) {
    if (
      query.precioMin !== undefined &&
      query.precioMax !== undefined &&
      query.precioMin > query.precioMax
    ) {
      throw new BadRequestException(
        'El precio mínimo no puede ser mayor al precio máximo',
      );
    }

    return this.propiedadesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-propiedades')
  findMisPropiedades(@Req() req: RequestWithUser) {
    return this.propiedadesService.findMisPropiedades(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('pendientes')
  findPendientes() {
    return this.propiedadesService.findPendientes();
  }

  @Get('destacadas')
  async findDestacadas() {
    return this.propiedadesService.findDestacadas();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/destacada')
  toggleDestacada(
    @Param('id') id: string,
    @Body() body: ToggleDestacadaDto,
    @Req() req: RequestWithUser,
  ) {
    return this.propiedadesService.toggleDestacada(
      id,
      body.destacada,
      req.user.id,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propiedadesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/contacto')
  obtenerContacto(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.propiedadesService.obtenerContacto(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/aprobar')
  aprobar(@Param('id') id: string) {
    return this.propiedadesService.aprobar(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/rechazar')
  rechazar(@Param('id') id: string, @Body() body: RechazarPropiedadDto) {
    return this.propiedadesService.rechazar(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdatePropiedadDto,
    @Req() req: RequestWithUser,
  ) {
    return this.propiedadesService.update(id, body, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.propiedadesService.remove(id, req.user.id);
  }

  // Documentos
  @UseGuards(JwtAuthGuard)
  @Post(':id/documentos')
  @UseInterceptors(FilesInterceptor('documentos', 10))
  subirDocumentos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: SubirDocumentoDto,
    @Req() req: RequestWithUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debes adjuntar al menos un documento');
    }

    return this.propiedadesService.subirDocumentos(
      id,
      req.user.id,
      files,
      body.tipo,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/documentos')
  getDocumentos(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.propiedadesService.getDocumentos(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/documentos/:docId')
  eliminarDocumento(
    @Param('docId') docId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.propiedadesService.eliminarDocumento(docId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('documentos/:docId/verificar')
  verificarDocumento(
    @Param('docId') docId: string,
    @Body() body: VerificarDto,
  ) {
    return this.propiedadesService.verificarDocumentoPropiedad(
      docId,
      body.verificado,
    );
  }
}
