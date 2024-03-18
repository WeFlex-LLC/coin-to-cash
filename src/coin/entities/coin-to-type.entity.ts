import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoinType } from '../enums/coin-type.enum';
import { Coin } from './coin.entity';
import { Pair } from './pair';

@Entity('coin_type')
export class CoinToType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  coinId: number;

  @Column({
    type: 'enum',
    enum: CoinType,
  })
  type: string;

  @ManyToOne(() => Coin, (coin) => coin.coinToTypes, { onDelete: 'CASCADE' })
  coin: Coin;

  @OneToMany(() => CoinToType, (coinToType) => coinToType.coinId)
  placeToCoinTypes: CoinToType[];

  @OneToMany(() => Pair, (pair) => pair.fromId)
  pairsFrom: Pair[];

  @OneToMany(() => Pair, (pair) => pair.toId)
  pairsTo: Pair[];
}
