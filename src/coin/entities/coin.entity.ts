import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoinToType } from './coin-to-type.entity';

@Entity('coin')
export class Coin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @OneToMany(() => CoinToType, (coinToType) => coinToType.coinId)
  coinToTypes: CoinToType[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
