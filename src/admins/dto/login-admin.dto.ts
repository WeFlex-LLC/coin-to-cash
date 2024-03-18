import { IsEmail } from 'class-validator';

export class LoginAdminDto {
  @IsEmail()
  email: string;

  password: string;

  remember: boolean;
}
