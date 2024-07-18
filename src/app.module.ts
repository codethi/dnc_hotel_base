import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.modules';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
})
export class AppModule {}
