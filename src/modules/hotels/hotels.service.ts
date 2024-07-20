import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../prisma/prisma.service';
import { join, resolve } from 'path';
import { stat, unlink } from 'fs/promises';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, data: CreateHotelDto) {
    const newHotel = { ...data, ownerId: userId };
    const hotel = this.prisma.hotel.create({ data: newHotel });
    return hotel;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const hotels = await this.prisma.hotel.findMany({
      skip: offset,
      take: limit,
      include: { owner: true },
    });

    const total = await this.prisma.hotel.count();

    return {
      data: hotels,
      total,
      page,
      limit,
    };
  }

  findOne(id: number) {
    return this.prisma.hotel.findUnique({
      where: { id },
      include: { owner: true },
    });
  }

  update(id: number, updateHotelDto: UpdateHotelDto) {
    return this.prisma.hotel.update({
      where: { id },
      data: updateHotelDto,
    });
  }

  remove(id: number) {
    return this.prisma.hotel.delete({ where: { id } });
  }

  findByName(name: string) {
    return this.prisma.hotel.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      include: { owner: true },
    });
  }

  findAllByOwner(id: number) {
    return this.prisma.hotel.findMany({ where: { ownerId: id } });
  }

  async updateHotelImage(id: number, imageFileName: string) {
    const hotel = await this.findOne(id);
    const directory = resolve(__dirname, '..', '..', '..', 'uploads');

    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
    }

    if (hotel.image) {
      const userAvatarFilePath = join(directory, hotel.image);
      const userAvatarFileExists = await stat(userAvatarFilePath);

      if (userAvatarFileExists) {
        await unlink(userAvatarFilePath);
      }
    }

    const userUpdated = await this.update(id, { image: imageFileName });

    return userUpdated;
  }

  async findHotelsByOwner(ownerId: number) {
    return this.prisma.hotel.findMany({
      where: { ownerId },
    });
  }
}
