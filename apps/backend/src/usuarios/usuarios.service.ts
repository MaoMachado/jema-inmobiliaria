import bcrypt from 'bcryptjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getAll() {
    const usuarios = await this.prisma.usuario.findMany({
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        celular: true,
        celularVerificado: true,
        email: true,
        foto: true,
        documentoUrl: true,
        documentoVerificado: true,
        role: true,
        createdAt: true,

        propiedades: {
          select: {
            id: true,
            titulo: true,
            documentos: {
              select: { id: true, tipo: true, verificado: true, url: true },
            },
          },
        },
      },
    });

    for (const user of usuarios) {
      for (const prop of user.propiedades) {
        prop.documentos = await Promise.all(
          prop.documentos.map(async (doc) => ({
            ...doc,
            url: await this.storage.getUrlDocumentoPropiedad(doc.url),
          })),
        );
      }
    }

    return usuarios;
  }

  async subirDocumento(userId: string, file: Express.Multer.File) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const documentoPath = await this.storage.subirDocumento(file);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        documentoUrl: documentoPath,
        documentoVerificado: false,
      },
    });

    return { documentoUrl: documentoPath };
  }

  async verificarDocumento(userId: string, verificado: boolean) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        documentoVerificado: verificado,
      },
    });

    return { documentoVerificado: verificado };
  }

  async getDocumentosPropiedadUsuario(userId: string) {
    const propiedades = await this.prisma.propiedad.findMany({
      where: { publicadoPorId: userId },
      include: {
        documentos: true,
      },
    });

    const todosLosDocumentos = propiedades.flatMap((p) =>
      p.documentos.map((d) => ({ ...d, propiedadTitulo: p.titulo })),
    );

    const documentosConUrl = await Promise.all(
      todosLosDocumentos.map(async (doc) => ({
        ...doc,
        url: await this.storage.getUrlDocumentoPropiedad(doc.url),
      })),
    );

    return documentosConUrl;
  }

  async verificarTelefono(userId: string, verificado: boolean) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        celularVerificado: verificado,
      },
    });

    return { celularVerificado: verificado };
  }

  async getUrlDocumentoUsuario(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario?.documentoUrl) return null;

    return this.storage.getUrlDocumentoUsuario(usuario.documentoUrl);
  }

  async cargarPerfil(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        celular: true,
        celularVerificado: true,
        email: true,
        foto: true,
        documentoVerificado: true,
        role: true,
      },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return usuario;
  }

  async actualizarPerfil(
    userId: string,
    data: { nombres?: string; apellidos?: string; celular?: string },
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.usuario.update({
      where: { id: userId },
      data: {
        ...(data.nombres !== undefined && { nombres: data.nombres }),
        ...(data.apellidos !== undefined && { apellidos: data.apellidos }),
        ...(data.celular !== undefined && { celular: data.celular }),
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        celular: true,
        email: true,
        foto: true,
        celularVerificado: true,
        documentoVerificado: true,
      },
    });
  }

  async subirFoto(userId: string, file: Express.Multer.File) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const fotoPath = await this.storage.subirFotoPerfil(file);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        foto: fotoPath,
      },
    });

    return { fotoUrl: fotoPath };
  }

  async cambiarPassword(
    userId: string,
    data: { actual: string; nueva: string },
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (!data.actual || !data.nueva)
      throw new BadRequestException('Campos obligatorios');

    if (data.nueva.length < 6)
      throw new BadRequestException(
        'La contraseña debe tener al menos 6 caracteres',
      );

    const isValid = await bcrypt.compare(data.actual, usuario.password);
    if (!isValid)
      throw new BadRequestException('La contraseña actual es incorrecta');

    const hashed = await bcrypt.hash(data.nueva, 10);
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Contraseña actualizada' };
  }
}
