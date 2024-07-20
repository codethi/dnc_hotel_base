import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Role, User as TypeUser } from '@prisma/client';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { OwnerHotelGuard } from 'src/shared/guards/ownerHotel.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from 'src/shared/interceptors/fileValidation.interceptor';
import { PaginationDto } from './dto/pagination.dto';

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
  async findAll(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    return await this.hotelsService.findAll(page, limit);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('filter')
  async findByName(@Query('name') name: string) {
    return await this.hotelsService.findByName(name);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get(':id')
  async findOne(@ParamId() id: number) {
    return await this.hotelsService.findOne(id);
  }

  @UseGuards(OwnerHotelGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@ParamId() id: number, @Body() body: UpdateHotelDto) {
    return await this.hotelsService.update(id, body);
  }

  @UseGuards(OwnerHotelGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@ParamId() id: number) {
    return await this.hotelsService.remove(id);
  }

  @UseInterceptors(FileInterceptor('image'), FileValidationInterceptor)
  @Patch('image/:hotelId')
  async uploadAvatar(
    @Param('hotelId') hotelId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'image/*',
          }),
          new MaxFileSizeValidator({ maxSize: 900 * 1024 }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    console.log(image);
    const userUpdated = await this.hotelsService.updateHotelImage(
      +hotelId,
      image.filename,
    );
    return userUpdated;
  }
}
