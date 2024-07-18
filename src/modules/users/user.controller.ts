import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/createUser.dto';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor';
import { ParamId } from 'src/shared/decorators/paramId.decorator';

@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //@UseInterceptors(LoggingInterceptor)
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

  @Get(':id')
  async show(@ParamId() id: number) {
    const user = await this.userService.show(Number(id));
    return user;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDTO,
  ) {
    const user = await this.userService.update(Number(id), body);
    return user;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.userService.delete(Number(id));
    return { deleted: true };
  }
}
