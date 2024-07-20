import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { ReservationStatus, Role, User as UserType } from '@prisma/client';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { PaginationDto } from '../hotels/dto/pagination.dto';

@UseGuards(AuthGuard, RoleGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Roles(Role.USER)
  @Post()
  async create(@User() user: UserType, @Body() body: CreateReservationDto) {
    return await this.reservationsService.create(user.id, body);
  }

  @Roles(Role.USER, Role.ADMIN)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    return await this.reservationsService.findAll(page, limit);
  }

  @Roles(Role.USER)
  @Get('renter')
  async listAllByUser(
    @User() user: UserType,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;
    return await this.reservationsService.listUserReservations(
      page,
      limit,
      user.id,
    );
  }

  @Roles(Role.ADMIN)
  @Get('locator')
  async listHotelOwner(
    @User() user: UserType,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;
    return await this.reservationsService.listHotelOwnerReservations(
      page,
      limit,
      user.id,
    );
  }

  @Roles(Role.USER, Role.ADMIN)
  @Get(':id')
  async findOne(@ParamId() id: number) {
    return await this.reservationsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  async updateStatus(
    @ParamId() id: number,
    @Body('status') status: ReservationStatus,
  ) {
    return this.reservationsService.updateStatus(id, status);
  }
}
