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
import { type CreatePropiedad } from './propiedades.types';

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
    @Body() body: CreatePropiedad,
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

  @UseGuards(JwtAuthGuard)
  @Get(':id/contacto')
  obtenerContacto(@Param('id') id: string) {
    return this.propiedadesService.obtenerContacto(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CreatePropiedad>,
    @Req() req: RequestWithUser,
  ) {
    return this.propiedadesService.update(id, body, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.propiedadesService.remove(id, req.user.id);
  }
}
