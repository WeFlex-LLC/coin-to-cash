import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lang } from '../enums/lang.enum';
import { Order } from './order.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', unique: true })
  telegramId: number;

  @Column({ type: 'enum', enum: Lang })
  lang: Lang;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
