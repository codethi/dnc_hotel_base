import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, data: CreateHotelDto) {
    const newHotel = { ...data, ownerId: userId };
    const hotel = this.prisma.hotel.create({ data: newHotel });
    return hotel;
  }

  findAll() {
    return this.prisma.hotel.findMany();
  }

  findOne(id: number) {
    return this.prisma.hotel.findUnique({ where: { id } });
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
}
