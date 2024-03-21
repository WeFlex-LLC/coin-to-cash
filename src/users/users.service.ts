import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Lang } from './enums/lang.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async addUser(createUserDto: CreateUserDto) {
    const user = await this.userRepository.save(createUserDto);

    return user;
  }

  async getUserByTelegramId(telegramId: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { telegramId } });
  }

  async changeLang(telegramId: number, lang: Lang) {
    await this.userRepository.update({ telegramId }, { lang });

    return { success: true };
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.orderRepository.save({
      ...createOrderDto,
      orderNumber: this.generateOrderNumber(),
    });
  }

  private generateOrderNumber(): number {
    const timestamp = Date.now().toString();
    const randomDigits = Math.floor(Math.random() * 1000000000);
    const orderNumber = timestamp + randomDigits.toString().padStart(9, '0');

    return +orderNumber.substring(0, 11);
  }
}
