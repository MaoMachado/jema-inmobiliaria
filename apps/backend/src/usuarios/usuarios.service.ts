import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getAll() {
    return this.prisma.usuario.findMany({
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
        updatedAt: true,
      },
    });
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
}
