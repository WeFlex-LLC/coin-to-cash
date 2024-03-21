import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { CoinToType } from './coin-to-type.entity';
import { Place } from './place.entity';

@Entity('place_coin_type')
export class PlaceToCoinType {
  @PrimaryColumn()
  coinToTypeId: number;

  @PrimaryColumn()
  placeId: number;

  @ManyToOne(() => CoinToType, (coinToType) => coinToType.placeToCoinTypes, {
    onDelete: 'CASCADE',
  })
  coinToType: CoinToType;

  @ManyToOne(() => Place, (place) => place.placeToCoinTypes, {
    onDelete: 'CASCADE',
  })
  place: Place;
}
