import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Role } from '../generated/prisma';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { clearSession, leerCookie, setSession } from './cookies';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sesion = await this.authService.register(
      body.nombres,
      body.apellidos,
      body.celular,
      body.email,
      body.password,
      body.foto,
    );

    setSession(res, sesion.accessToken, sesion.refreshToken);
    return { user: sesion.user };
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sesion = await this.authService.login(body.email, body.password);
    setSession(res, sesion.accessToken, sesion.refreshToken);
    return { user: sesion.user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sesion = await this.authService.refresh(
      leerCookie(req, 'refresh_token'),
    );
    setSession(res, sesion.accessToken, sesion.refreshToken);
    return { user: sesion.user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(leerCookie(req, 'refresh_token'));
    clearSession(res);
    return { message: 'Sesión cerrada' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: RequestWithUser) {
    return req.user;
  }
}
