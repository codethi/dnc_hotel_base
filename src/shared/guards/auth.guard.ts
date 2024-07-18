import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserService } from 'src/modules/users/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const { authorization } = context.switchToHttp().getRequest().headers;
    if (!authorization || !authorization.startsWith('Bearer ')) return false;

    const { valid, decoded } = this.authService.validateToken(
      authorization.split(' ')[1],
    );

    if (!valid) return false;

    const user = await this.userService.show(Number(decoded.sub));

    if (!user) return false;

    context.switchToHttp().getRequest().user = user;

    return true;
  }
}
