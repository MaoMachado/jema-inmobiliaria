import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PropiedadesService } from './propiedades.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { type CreatePropiedad } from './propiedades.types';

interface RequestWithUser {
  user: { id: string; email: string };
}

@Controller('propiedades')
export class PropiedadesController {
  constructor(private readonly propiedadesService: PropiedadesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: CreatePropiedad, @Req() req: RequestWithUser) {
    return this.propiedadesService.create(body, req.user.id);
  }

  @Get()
  findAll() {
    return this.propiedadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propiedadesService.findOne(id);
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
