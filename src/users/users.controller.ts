import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrderStatus } from './enums/order-status';

@Controller('api/users')
@UseGuards(JwtAdminAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findUsers() {
    return this.usersService.findUsers();
  }

  @Get('orders')
  findOrders(@Query('status') status: OrderStatus) {
    return this.usersService.findOrders({ status });
  }

  @Get('orders/:id')
  findOneOrder(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneOrder(id);
  }

  @Put('orders/:id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ) {
    return this.usersService.updateStatus(id, status);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
