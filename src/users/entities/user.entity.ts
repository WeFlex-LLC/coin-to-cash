import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Lang } from '../enums/lang.enum';
import { Order } from './order.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  telegramId: number;

  @Column({ type: 'enum', enum: Lang })
  lang: Lang;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}