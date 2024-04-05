import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pair } from 'src/coin/entities/pair';
import { Place } from 'src/coin/entities/place.entity';
import { ExchangeOption } from '../enums/exchange-option.enum';
import { User } from './user.entity';
import { OrderStatus } from '../enums/order-status';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  amount: number;

  @Column({ type: 'bigint', unique: true })
  orderNumber: number;

  @Column({
    type: 'enum',
    enum: ExchangeOption,
  })
  option: ExchangeOption;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.Waiting,
  })
  orderStatus: OrderStatus;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Place, (place) => place.orders)
  place: Place;

  @ManyToOne(() => Pair, (pair) => pair.orders)
  pair: Pair;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
