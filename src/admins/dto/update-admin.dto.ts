import { MinLength } from 'class-validator';

export class UpdateAdminDto {
  old_password: string;

  @MinLength(8, { message: 'Password must be at least 8 symbols' })
  new_password: string;
}
