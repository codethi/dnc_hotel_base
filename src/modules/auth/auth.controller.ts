import { Body, Controller, Post } from '@nestjs/common';
import { AuthLoginDTO } from './dto/authLogin.dto';
import { AuthRegisterDTO } from './dto/authRegister.dto';
import { AuthForgotPasswordDTO } from './dto/authForgotPassword.dto';
import { AuthResetPasswordDTO } from './dto/authResetPassword.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(@Body() body: AuthLoginDTO) {
    return await this.authService.login(body);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDTO) {
    return await this.authService.register(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: AuthForgotPasswordDTO) {
    return this.authService.forgot(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() { token, password }: AuthResetPasswordDTO) {
    return this.authService.reset({ token, password });
  }
}
