import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinService } from './coin.service';
import { CoinController } from './coin.controller';
import { Coin } from './entities/coin.entity';
import { Place } from './entities/place.entity';
import { CoinToType } from './entities/coin-to-type.entity';
import { PlaceToCoinType } from './entities/place-to-coin-type.entity';
import { Pair } from './entities/pair';
import { Interval } from './entities/interval.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Coin,
      Place,
      CoinToType,
      PlaceToCoinType,
      Pair,
      Interval,
    ]),
  ],
  controllers: [CoinController],
  providers: [CoinService],
})
export class CoinModule {}
