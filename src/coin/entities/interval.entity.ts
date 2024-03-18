import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Pair } from './pair';

@Entity('interval')
export class Interval {
  @PrimaryColumn()
  pairId: number;

  @Column('int')
  from: number;

  @Column('int')
  to: number;

  @Column('int')
  fixedPrice: number;

  @Column('float')
  rate: number;

  @ManyToOne(() => Pair, (pair) => pair.intervals, { onDelete: 'CASCADE' })
  pair: Pair;
}
