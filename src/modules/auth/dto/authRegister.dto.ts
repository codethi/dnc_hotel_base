import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from 'src/modules/users/dto/createUser.dto';

export class AuthRegisterDTO extends PartialType(CreateUserDTO) {}
