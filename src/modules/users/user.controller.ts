import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body) {
    const user = await this.userService.create(body);
    return user;
  }

  @Get()
  async list() {
    const users = await this.userService.list();
    return users;
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    const user = await this.userService.show(Number(id));
    return user;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body) {
    const user = await this.userService.update(Number(id), body);
    return user;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.userService.delete(Number(id));
    return { deleted: true };
  }
}
