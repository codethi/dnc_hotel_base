import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class UserMatchGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.params.id;

    const { authorization } = context.switchToHttp().getRequest().headers;

    if (!authorization || !authorization.startsWith('Bearer ')) return false;

    const { valid, decoded } = this.authService.validateToken(
      authorization.split(' ')[1],
    );

    if (!valid) return false;

    if (Number(decoded.sub) !== Number(userId)) {
      throw new UnauthorizedException(
        'You are not allowed to perform this operation',
      );
    }

    return true;
  }
}
