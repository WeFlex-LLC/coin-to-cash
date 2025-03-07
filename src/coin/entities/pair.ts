import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoinToType } from './coin-to-type.entity';
import { Interval } from './interval.entity';
import { Order } from 'src/users/entities/order.entity';

@Entity('pair')
export class Pair {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  fromId: number;

  @Column('int')
  toId: number;

  @Column({ type: 'bool', default: false })
  isActive: boolean;

  @Column('float')
  rate: number;

  @ManyToOne(() => CoinToType, (coinToType) => coinToType.pairsFrom, {
    onDelete: 'CASCADE',
  })
  from: CoinToType;

  @ManyToOne(() => CoinToType, (coinToType) => coinToType.pairsTo, {
    onDelete: 'CASCADE',
  })
  to: CoinToType;

  @OneToMany(() => Interval, (interval) => interval.pair, {
    onDelete: 'CASCADE',
  })
  intervals: Interval[];

  @OneToMany(() => Order, (order) => order.pair, {
    onDelete: 'CASCADE',
  })
  orders: Order[];
}
