import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDTO } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDTO) {
    data.password = await this.hashPassword(data.password);
    return await this.prisma.user.create({ data });
  }

  async list() {
    return await this.prisma.user.findMany();
  }

  async show(id: number) {
    await this.isExists(id);
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, body: UpdateUserDTO) {
    await this.isExists(id);
    body.password = await this.hashPassword(body.password);
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

  async hashPassword(password: string) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}
