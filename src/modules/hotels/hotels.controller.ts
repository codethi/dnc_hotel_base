import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Role, User as TypeUser } from '@prisma/client';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserMatchGuard } from 'src/shared/guards/userMatch.guard';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { User } from 'src/shared/decorators/user.decorator';

@UseGuards(AuthGuard, RoleGuard)
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Roles(Role.ADMIN)
  @Post()
  async create(@User() user: TypeUser, @Body() createHotelDto: CreateHotelDto) {
    return await this.hotelsService.create(user.id, createHotelDto);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get()
  async findAll() {
    return await this.hotelsService.findAll();
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get(':id')
  async findOne(@ParamId() id: number) {
    return await this.hotelsService.findOne(id);
  }

  @UseGuards(UserMatchGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@ParamId() id: number, @Body() updateHotelDto: UpdateHotelDto) {
    return await this.hotelsService.update(id, updateHotelDto);
  }

  @UseGuards(UserMatchGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@ParamId() id: number) {
    return await this.hotelsService.remove(+id);
  }
}
