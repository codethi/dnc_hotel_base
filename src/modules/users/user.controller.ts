import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/createUser.dto';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role, User as TypeUser } from '@prisma/client';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { UserMatchGuard } from 'src/shared/guards/userMatch.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/shared/decorators/user.decorator';

@UseInterceptors(LoggingInterceptor)
@UseGuards(AuthGuard, RoleGuard)
@Roles(Role.ADMIN, Role.USER)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body: CreateUserDTO) {
    const user = await this.userService.create(body);
    return user;
  }

  @Get()
  async list() {
    const users = await this.userService.list();
    return users;
  }

  @UseInterceptors(FileInterceptor('avatar'))
  @Post('avatar')
  async uploadAvatar(
    @User() user: TypeUser,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const userUpdated = await this.userService.updateUserAvatar(
      user.id,
      avatar.filename,
    );
    return userUpdated;
  }

  @UseGuards(UserMatchGuard)
  @Get(':id')
  async show(@ParamId() id: number) {
    const user = await this.userService.show(Number(id));
    return user;
  }

  @UseGuards(UserMatchGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDTO,
  ) {
    const user = await this.userService.update(Number(id), body);
    return user;
  }

  @UseGuards(UserMatchGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.userService.delete(Number(id));
    return { deleted: true };
  }
}
