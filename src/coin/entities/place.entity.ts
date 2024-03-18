import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoinToType } from './coin-to-type.entity';

@Entity('place')
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  nameEn: string;

  @Column('varchar')
  nameAm: string;

  @Column('varchar')
  nameRu: string;

  @OneToMany(() => CoinToType, (coinToType) => coinToType.coinId)
  placeToCoinTypes: CoinToType[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
