import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDTO } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDTO) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;
    return await this.prisma.user.create({ data });
  }

  async list() {
    return await this.prisma.user.findMany();
  }

  async show(id: number) {
    await this.isExists(id);
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, body: any) {
    await this.isExists(id);
    return await this.prisma.user.update({ where: { id }, data: body });
  }

  async delete(id: number) {
    await this.isExists(id);
    return await this.prisma.user.delete({ where: { id } });
  }

  async isExists(id: number) {
    const user = await this.prisma.user.count({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
