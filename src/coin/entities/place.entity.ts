import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoinToType } from './coin-to-type.entity';
import { Order } from 'src/users/entities/order.entity';

@Entity('place')
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name_en: string;

  @Column('varchar')
  name_am: string;

  @Column('varchar')
  name_ru: string;

  @OneToMany(() => CoinToType, (coinToType) => coinToType.coin)
  placeToCoinTypes: CoinToType[];

  @OneToMany(() => Order, (order) => order.place)
  orders: Order[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
