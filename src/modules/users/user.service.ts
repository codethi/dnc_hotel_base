import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return await this.prisma.user.create({ data });
  }

  async list() {
    return await this.prisma.user.findMany();
  }

  async show(id: number) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, body: any) {
    return await this.prisma.user.update({ where: { id }, data: body });
  }

  async delete(id: number) {
    return await this.prisma.user.delete({ where: { id } });
  }
}
