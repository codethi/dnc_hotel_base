import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsEnum(Role)
  @Transform(({ value }) => value ?? Role.USER)
  role: Role;
}
