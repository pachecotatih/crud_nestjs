import { Global, Module } from '@nestjs/common';
import { HashingServiceProtocol } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
@Global()
@Module({
  providers: [
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService,
    },
    AuthService,
  ],
  controllers: [AuthController],
  exports: [HashingServiceProtocol],
})
export class AuthModule {}
