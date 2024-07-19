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
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  generateToken(user: User, expiration: string = '1d') {
    const payload = {
      sub: user.id,
      username: user.name,
      useremail: user.email,
    };
    const options = {
      expiresIn: expiration,
      issuer: 'dnc_hotel',
      audience: 'users',
    };
    return {
      access_token: this.jwtService.sign(payload, options),
    };
  }

  validateToken(token: string): ValidateTokenDTO {
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

    const { access_token } = this.generateToken(user, '30m');

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center; border: 2px solid #041d40; border-radius: 10px; margin: auto; width: 60%;">
          <h1 style="color: #041d40;">Password Reset Verification Code</h1>
          <h3 style="color: #041d40;">Dear ${user.name},</h3>
          <p style="font-size: 16px; color: #333;">Please manually select and copy your reset token:</p>
          <textarea id="tokenText" readonly style="width: 500px; height: 80px; font-size: 14px; border: 1px solid #041d40; border-radius: 5px; padding: 10px; color: #041d40; background-color: #f9f9f9; resize: none; display: block; margin: 10px auto;">${access_token}</textarea>
          <p style="margin-top: 20px;">Best regards,<br><span style="font-weight: bold; color: #041d40;">DNC Hotel</span></p>
        </div>
      `,
    });

    return `A verification code has been sent to ${email}`;
  }

  async reset({ token, password }: AuthResetPasswordDTO) {
    const { valid, decoded } = this.validateToken(token);

    if (!valid || !decoded) {
      throw new UnauthorizedException('Token is invalid');
    }

    const id = decoded.sub;

    const user = await this.userService.update(Number(id), { password });
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
