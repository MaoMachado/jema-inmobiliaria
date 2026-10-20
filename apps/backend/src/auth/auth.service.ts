import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import { TotpService } from './totp.service';

@Injectable()
export class AuthService {
  // shortcut: contador en memoria por instancia; mover a un store compartido
  // si el backend corre en varias réplicas.
  private readonly intentos = new Map<
    string,
    { fallos: number; bloqueadoHasta: number }
  >();

  private static readonly MAX_INTENTOS = 5;
  private static readonly BLOQUEO_MS = 15 * 60 * 1000;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly totp: TotpService,
  ) {}

  private firmarAccess(usuario: {
    id: string;
    email: string;
    role: Role;
    tokenVersion: number;
  }) {
    return this.jwtService.sign({
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
      tokenVersion: usuario.tokenVersion,
    });
  }

  private async emitirSession(usuario: {
    id: string;
    email: string;
    role: Role;
    tokenVersion: number;
    password: string;
  }) {
    const accessToken = this.firmarAccess(usuario);
    const refreshToken = await this.tokens.emitir(usuario.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userPublic } = usuario;
    return { accessToken, refreshToken, user: userPublic };
  }

  async register(
    nombres: string,
    apellidos: string,
    celular: string,
    email: string,
    password: string,
    foto?: string,
  ) {
    if (!email || !password || !nombres || !apellidos || !celular) {
      throw new BadRequestException('Faltan campos obligatorios');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNombre = nombres.trim();
    const cleanApellido = apellidos.trim();
    const cleanCelular = celular.trim();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.usuario.create({
        data: {
          nombres: cleanNombre,
          apellidos: cleanApellido,
          celular: cleanCelular,
          email: cleanEmail,
          password: hashedPassword,
          foto,
        },
      });

      return this.emitirSession(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ese email ya está registrado');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email y contraseña son obligatorios');
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await this.prisma.usuario.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.emitirSession(user);
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Sesión Expirada');
    }

    const { usuarioId, refreshToken: nuevoRefresh } =
      await this.tokens.rotar(refreshToken);

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new UnauthorizedException('Sesión Expirada');
    }

    const accessToken = this.firmarAccess(usuario);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userPublic } = usuario;
    return { accessToken, refreshToken: nuevoRefresh, user: userPublic };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.tokens.revocar(refreshToken);
    }
  }

  async reautenticar(usuarioId: string, password: string, codigo?: string) {
    const registro = this.intentos.get(usuarioId);

    if (registro && registro.bloqueadoHasta > Date.now()) {
      throw new HttpException(
        'Demasiados intentos fallidos. Espera 15 minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario || usuario.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Solo un administrador puede reautenticarse',
      );
    }

    if (!(await bcrypt.compare(password, usuario.password))) {
      this.registrarFallo(usuarioId);
    }

    if (usuario.totpActivado) {
      if (!codigo) {
        throw new UnauthorizedException(
          'TOTP_REQUIRED: ingresa el código de tu app autenticadora',
        );
      }

      const valido =
        usuario.totpSecret !== null &&
        this.totp.valido(usuario.totpSecret, codigo);

      if (!valido) {
        this.registrarFallo(usuarioId);
      }
    }

    this.intentos.delete(usuarioId);

    return this.jwtService.sign(
      { sub: usuario.id, scope: 'documentos' },
      { expiresIn: '5m' },
    );
  }

  // --- Segundo factor (TOTP) ---

  private registrarFallo(usuarioId: string): never {
    const fallos = (this.intentos.get(usuarioId)?.fallos ?? 0) + 1;

    this.intentos.set(usuarioId, {
      fallos,
      bloqueadoHasta:
        fallos >= AuthService.MAX_INTENTOS
          ? Date.now() + AuthService.BLOQUEO_MS
          : 0,
    });

    throw new UnauthorizedException('Contraseña o código incorrectos');
  }

  private async adminPorId(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario || usuario.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede usar TOTP');
    }

    return usuario;
  }

  async estadoTotp(usuarioId: string) {
    const usuario = await this.adminPorId(usuarioId);

    return { activado: usuario.totpActivado };
  }

  async iniciarTotp(usuarioId: string) {
    const usuario = await this.adminPorId(usuarioId);

    if (usuario.totpActivado) {
      throw new ConflictException(
        'TOTP ya está activo. Desactívalo antes de regenerarlo.',
      );
    }

    const { secreto, qr } = await this.totp.crear(usuario.email);

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { totpSecret: this.totp.cifrar(secreto) },
    });

    return { qr };
  }

  async confirmarTotp(usuarioId: string, codigo: string) {
    const usuario = await this.adminPorId(usuarioId);

    if (!usuario.totpSecret) {
      throw new BadRequestException('Inicia la activación primero');
    }

    if (!this.totp.valido(usuario.totpSecret, codigo)) {
      throw new UnauthorizedException('Código incorrecto');
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { totpActivado: true },
    });

    return { activado: true };
  }

  async desactivarTotp(usuarioId: string, password: string) {
    const usuario = await this.adminPorId(usuarioId);

    if (!usuario.totpActivado) {
      throw new BadRequestException('TOTP no está activo');
    }

    if (!(await bcrypt.compare(password, usuario.password))) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { totpSecret: null, totpActivado: false },
    });

    return { activado: false };
  }
}
