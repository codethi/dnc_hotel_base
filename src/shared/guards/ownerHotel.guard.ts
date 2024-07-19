import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Hotel } from '@prisma/client';
import { AuthService } from 'src/modules/auth/auth.service';
import { HotelsService } from 'src/modules/hotels/hotels.service';

@Injectable()
export class OwnerHotelGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly hotelService: HotelsService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const hotelId = request.params.id;

    const { authorization } = context.switchToHttp().getRequest().headers;

    if (!authorization || !authorization.startsWith('Bearer ')) return false;

    const { valid, decoded } = this.authService.validateToken(
      authorization.split(' ')[1],
    );

    if (!valid) return false;

    const hotel: Hotel = await this.hotelService.findOne(Number(hotelId));

    if (Number(decoded.sub) !== Number(hotel.ownerId)) {
      throw new UnauthorizedException(
        'You are not allowed to perform this operation',
      );
    }

    return true;
  }
}
