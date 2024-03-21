import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pair } from './pair';

@Entity('interval')
export class Interval {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  pairId: number;

  @Column({ type: 'int', nullable: true })
  from: number;

  @Column({ type: 'int', nullable: true })
  to: number;

  @Column('int')
  fixedPrice: number;

  @Column('float')
  percent: number;

  @ManyToOne(() => Pair, (pair) => pair.intervals, { onDelete: 'CASCADE' })
  pair: Pair;
}
