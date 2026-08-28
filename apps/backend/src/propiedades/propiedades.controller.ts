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
import { CreatePropiedadDto } from './dto/propiedades.dto';

interface RequestWithUser {
  user: { id: string; email: string };
}

@Controller('propiedades')
export class PropiedadesController {
  constructor(private readonly propiedadesService: PropiedadesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('fotografias', 10))
  create(
    @Body() body: CreatePropiedadDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    return this.propiedadesService.create(body, files ?? [], req.user.id);
  }

  @Get()
  findAll(
    @Query('ciudad') ciudad?: string,
    @Query('tipo') tipo?: string,
    @Query('precioMin') precioMin?: string,
    @Query('precioMax') precioMax?: string,
    @Query('habitaciones') habitaciones?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderBy') orderBy?: 'precio' | 'createdAt' | 'puntaje',
    @Query('order') order?: 'asc' | 'desc',
  ) {
    const toNumber = (v?: string) => {
      if (v === undefined || v === '') return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const min = toNumber(precioMin);
    const max = toNumber(precioMax);
    const habs = toNumber(habitaciones);

    if (
      (min !== undefined && min < 0) ||
      (max !== undefined && max < 0) ||
      (habs !== undefined && habs < 1)
    ) {
      throw new BadRequestException('Filtros numéricos inválidos');
    }

    if (min !== undefined && max !== undefined && min > max) {
      throw new BadRequestException(
        'El precio mínimo no puede ser mayor al precio máximo',
      );
    }

    const allowedOrderBy = ['precio', 'createdAt', 'puntaje'];
    const allowedOrder = ['asc', 'desc'];

    const safeOrderBy =
      orderBy && allowedOrderBy.includes(orderBy) ? orderBy : 'createdAt';

    const safeOrder = order && allowedOrder.includes(order) ? order : 'desc';

    return this.propiedadesService.findAll({
      ciudad,
      tipo,
      precioMin: min,
      precioMax: max,
      habitaciones: habs,
      page: toNumber(page),
      limit: toNumber(limit),
      orderBy: safeOrderBy,
      order: safeOrder,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propiedadesService.findOne(id);
  }

  @Get(':id/probabilidades')
  calcularProbabilidad(@Param('id') id: string) {
    return this.propiedadesService.calcularProbabilidad(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/contacto')
  obtenerContacto(@Param('id') id: string) {
    return this.propiedadesService.obtenerContacto(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CreatePropiedadDto>,
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
    @Body('tipo') tipo: string,
    @Req() req: RequestWithUser,
  ) {
    return this.propiedadesService.subirDocumentos(
      id,
      req.user.id,
      files,
      tipo,
    );
  }

  @Get(':id/documentos')
  getDocumentos(@Param('id') id: string) {
    return this.propiedadesService.getDocumentos(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/documentos/:docId')
  eliminarDocumento(@Param('id') docId: string, @Req() req: RequestWithUser) {
    return this.propiedadesService.eliminarDocumento(docId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('documentos/:docId/verificar')
  verificarDocumento(
    @Param('docId') docId: string,
    @Body() body: { verificado: boolean },
  ) {
    return this.propiedadesService.verificarDocumentoPropiedad(
      docId,
      body.verificado,
    );
  }
}
