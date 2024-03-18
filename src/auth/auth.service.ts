import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminsService } from 'src/admins/admins.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string) {
    const admin = await this.adminsService.findOne(email);
    const samePassword = admin
      ? await bcrypt.compare(password, admin?.password)
      : false;

    if (!samePassword) {
      throw new UnauthorizedException('Incorrect Email or Password');
    }

    return { sub: admin.id, email: admin.email, role: admin.role };
  }

  async loginAdmin(admin, remember) {
    const { ADMIN_SECRET, ADMIN_REFRESH_SECRET } = process.env;

    return {
      user: admin,
      access_token: await this.jwtService.signAsync(
        { ...admin, exp: Math.floor(Date.now() / 1000) + 60 * 15 },
        { secret: ADMIN_SECRET },
      ),
      refresh_token: await this.jwtService.signAsync(
        {
          ...admin,
          exp:
            Math.floor(Date.now() / 1000) + 60 * 60 * 24 * (remember ? 7 : 1),
        },
        { secret: ADMIN_REFRESH_SECRET },
      ),
    };
  }

  async updateAdminAccessToken(user) {
    const { ADMIN_SECRET } = process.env;

    return {
      access_token: await this.jwtService.signAsync(
        { ...user, exp: Math.floor(Date.now() / 1000) + 60 * 15 },
        { secret: ADMIN_SECRET },
      ),
    };
  }
}
