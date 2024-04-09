import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Lang } from './enums/lang.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status';
import { CoinService } from 'src/coin/coin.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    private readonly coinService: CoinService,
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

  async findUsers() {
    return await this.userRepository.find({ order: { id: 'DESC' } });
  }

  async findOrders(filter?: { status?: OrderStatus }) {
    let where = '';

    if (filter?.status) where = 'order.orderStatus = :status';

    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.place', 'place')
      .where(where)
      .setParameters({
        status: filter?.status,
      })
      .orderBy('order.id', 'DESC')
      .getMany();

    return orders;
  }

  async findOneOrder(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { user: true, place: true, pair: { from: true, to: true } },
    });

    const calcAmount = await this.coinService.calculatePrice(
      order.pair.id,
      order.amount,
      order.option,
    );

    return {
      ...order,
      calcAmount,
    };
  }

  async updateStatus(id: number, orderStatus: OrderStatus) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { pair: true },
    });

    if (!order) throw new NotFoundException('Order Not Found');

    if (orderStatus == OrderStatus.Completed) {
      const { success } = await this.coinService.updateCounts(
        order.pair.id,
        order.amount,
        order.option,
      );

      if (!success) throw new InternalServerErrorException();
    }

    await this.orderRepository.update({ id }, { orderStatus });

    return {
      success: true,
    };
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User Not Found');

    await this.userRepository.delete({ id });

    return {
      success: true,
    };
  }

  private generateOrderNumber(): number {
    const timestamp = Date.now().toString();
    const randomDigits = Math.floor(Math.random() * 1000000000);
    const orderNumber = timestamp + randomDigits.toString().padStart(9, '0');

    return +orderNumber.substring(0, 11);
  }
}
