import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.modules';

@Module({
  imports: [UserModule],
})
export class AppModule {}
