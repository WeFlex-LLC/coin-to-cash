import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Roles } from './decorators/roles.decorator';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminRole } from './enums/admin-role.enum';

@UseGuards(JwtAdminAuthGuard)
@Controller('api/admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @Roles(AdminRole.Admin, AdminRole.Editor)
  @UseGuards(RoleGuard)
  getAll(@Query('role') role: string, @Request() req) {
    return this.adminsService.findAll(req.user.id, { role });
  }

  @Get('current')
  getOne(@Request() req) {
    const { user } = req;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  @Post()
  @Roles(AdminRole.Admin)
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe())
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Put('new-password')
  @UsePipes(new ValidationPipe())
  changePassword(@Body() updateAdminDto: UpdateAdminDto, @Request() req) {
    return this.adminsService.update(req.user.id, updateAdminDto);
  }

  @Delete(':id')
  @Roles(AdminRole.Admin)
  @UseGuards(RoleGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.delete(id);
  }
}
