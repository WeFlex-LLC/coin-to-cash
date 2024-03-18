import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAdminAuthGuard } from './guards/local-auth.guard';
import { JwtAdminRefreshAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('admin/token')
  @UseGuards(JwtAdminRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  updateAdminAccessToken(@Request() req) {
    return this.authService.updateAdminAccessToken(req.user);
  }

  @Post('admin')
  @UseGuards(LocalAdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  loginAdmin(@Request() req, @Body('remember') remember: boolean) {
    return this.authService.loginAdmin(req.user, remember);
  }
}
