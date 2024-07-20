import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../users/user.modules';
import { HotelsModule } from '../hotels/hotels.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, UserModule, HotelsModule, AuthModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
