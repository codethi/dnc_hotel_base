import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.modules';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
