import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminsModule } from 'src/admins/admins.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalAdminStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import {
  JwtAdminRefreshStrategy,
  JwtAdminStrategy,
} from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    AdminsModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalAdminStrategy,
    JwtAdminStrategy,
    JwtAdminRefreshStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
