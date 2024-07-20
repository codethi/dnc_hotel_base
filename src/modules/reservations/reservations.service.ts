import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { differenceInDays, parseISO } from 'date-fns';
import { HotelsService } from '../hotels/hotels.service';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from '../users/user.service';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hotelService: HotelsService,
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
  ) {}

  async create(userId: number, data: CreateReservationDto) {
    const checkInDate = parseISO(data.checkIn);
    const checkOutDate = parseISO(data.checkOut);
    const daysOfStay = differenceInDays(checkOutDate, checkInDate);

    if (checkInDate >= checkOutDate) {
      throw new BadRequestException(
        'Check-out date must be after check-in date.',
      );
    }

    const hotel = await this.hotelService.findOne(data.hotelId);

    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
    }

    if (typeof hotel.price !== 'number' || hotel.price <= 0) {
      throw new BadRequestException('Invalid hotel price.');
    }

    const total = daysOfStay * hotel.price;

    const newReservation = {
      ...data,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      total,
      userId,
    };

    await this.mailerService.sendMail({
      to: hotel.owner.email,
      subject: 'Pending Reservation Approval',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center; border: 2px solid #041d40; border-radius: 10px; margin: auto; width: 60%;">
            <h1 style="color: #041d40;">Pending Reservation Approval</h1>
            <h3 style="color: #041d40;">Dear Hotel Owner,</h3>
            <p style="font-size: 16px; color: #333;">You have a new reservation pending approval. Please review the reservation details and approve or decline the reservation at your earliest convenience.</p>
            <p style="font-size: 16px; color: #333;">To view the reservation, please access your hotel owner profile
            <p style="margin-top: 20px;">Thank you for your prompt attention to this matter.<br>Best regards,<br><span style="font-weight: bold; color: #041d40;">DNC Hotel Management System</span></p>
        </div>
      `,
    });

    return this.prisma.reservation.create({
      data: newReservation,
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const reservations = await this.prisma.reservation.findMany({
      skip: offset,
      take: limit,
      include: { user: true, hotel: true },
    });

    const total = await this.prisma.reservation.count();

    return {
      data: reservations,
      total,
      page,
      limit,
    };
  }

  async listUserReservations(
    page: number = 1,
    limit: number = 10,
    userId: number,
  ) {
    const offset = (page - 1) * limit;

    const total = await this.prisma.reservation.count({
      where: { userId: userId },
    });

    const reservations = await this.prisma.reservation.findMany({
      skip: offset,
      take: limit,
      where: { userId: userId },
      include: { hotel: true },
    });

    return {
      data: reservations,
      total,
      page,
      limit,
    };
  }

  async listHotelOwnerReservations(
    page: number = 1,
    limit: number = 10,
    userId: number,
  ) {
    const offset = (page - 1) * limit;

    const hotels = await this.hotelService.findHotelsByOwner(userId);
    const hotelIds = hotels.map((hotel) => hotel.id);
    const reservations = await this.prisma.reservation.findMany({
      skip: offset,
      take: limit,
      where: { hotelId: { in: hotelIds } },
      include: { hotel: true, user: true },
    });

    const total = await this.prisma.reservation.count({
      where: { hotelId: { in: hotelIds } },
    });

    return {
      data: reservations,
      total,
      page,
      limit,
    };
  }

  findOne(id: number) {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: { user: true, hotel: true },
    });
  }

  async updateStatus(id: number, status: ReservationStatus) {
    const reservation = await this.prisma.reservation.update({
      where: { id },
      data: { status },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: reservation.userId },
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reservation Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center; border: 2px solid #041d40; border-radius: 10px; margin: auto; width: 60%;">
            <h1 style="color: #041d40;">Reservation Status Update</h1>
            <h3 style="color: #041d40;">Dear ${user.name},</h3>
            <p style="font-size: 16px; color: #333;">We are pleased to inform you that your reservation status has been updated. Your current reservation status is:</p>
            <h2 style="color: #041d40;">${reservation.status}</h2>
            <p style="margin-top: 10px;">For any further assistance, please do not hesitate to contact us.<br>Best regards,<br><span style="font-weight: bold; color: #041d40;">DNC Hotel</span></p>
        </div>
      `,
    });

    return reservation;
  }
}
