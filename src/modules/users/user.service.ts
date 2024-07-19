import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDTO } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { User } from '@prisma/client';
import { resolve, join } from 'path';
import { stat, unlink } from 'fs/promises';
import { userSelectFields } from '../prisma/utils/userSelectFields';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDTO) {
    data.password = await this.hashPassword(data.password);
    return await this.prisma.user.create({ data });
  }

  async list() {
    return await this.prisma.user.findMany({ select: userSelectFields });
  }

  async show(id: number): Promise<User> {
    await this.isExists(id);
    return await this.prisma.user.findUnique({
      where: { id },
      select: userSelectFields,
    });
  }

  async update(id: number, body: UpdateUserDTO) {
    await this.isExists(id);
    if (body.password) {
      body.password = await this.hashPassword(body.password);
    }
    return await this.prisma.user.update({
      where: { id },
      data: body,
      select: userSelectFields,
    });
  }

  async delete(id: number) {
    await this.isExists(id);
    return await this.prisma.user.delete({ where: { id } });
  }

  async updateUserAvatar(id: number, avatarFileName: string) {
    const user = await this.show(id);
    const directory = resolve(__dirname, '..', '..', '..', 'uploads');

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.avatar) {
      const userAvatarFilePath = join(directory, user.avatar);
      const userAvatarFileExists = await stat(userAvatarFilePath);

      if (userAvatarFileExists) {
        await unlink(userAvatarFilePath);
      }
    }

    const userUpdated = await this.update(id, { avatar: avatarFileName });

    return userUpdated;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: userSelectFields,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async isExists(id: number) {
    const user = await this.prisma.user.count({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
