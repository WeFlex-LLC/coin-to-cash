import { IsEmail, MinLength } from 'class-validator';
import { AdminRole } from '../enums/admin-role.enum';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 symbols' })
  password: string;

  role: AdminRole;
}
