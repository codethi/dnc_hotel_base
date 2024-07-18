import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthLoginDTO } from './dto/authLogin.dto';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from '../users/dto/createUser.dto';
import { Role, User } from '@prisma/client';
import { AuthRegisterDTO } from './dto/authRegister.dto';
import { ValidateTokenDTO } from './dto/validateToken.dto';
import { AuthResetPasswordDTO } from './dto/authResetPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async generateToken(user: User, expiration: string = '1d') {
    const payload = { username: user.name, useremail: user.email };
    const options = {
      expiresIn: expiration,
      issuer: 'dnc_hotel',
      sub: user.id,
      audience: 'users',
    };
    return {
      access_token: this.jwtService.sign(payload, options),
    };
  }

  async validateToken(token: string): Promise<ValidateTokenDTO> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
        issuer: 'dnc_hotel',
        audience: 'users',
      });
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  async validateUser(username: string, pass: string): Promise<any> {
    // Lógica para validar usuário
    return { username, pass };
  }

  async login({ email, password }: AuthLoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    return this.generateToken(user);
  }

  async forgot(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email is incorrect');
    }

    const token = this.generateToken(user, '30m');

    // Enviar o email com o token jwt para resetar a senha
    return token;
  }

  async reset({ token, password }: AuthResetPasswordDTO) {
    const { valid, decoded } = await this.validateToken(token);

    if (!valid || !decoded) {
      throw new UnauthorizedException('Token is invalid');
    }

    const id = decoded.sub;

    const user = await this.userService.update(Number(id), password);
    return this.generateToken(user);
  }

  async register(data: AuthRegisterDTO) {
    const userData: CreateUserDTO = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? Role.USER,
    };
    const user = await this.userService.create(userData);
    return this.generateToken(user);
  }
}
