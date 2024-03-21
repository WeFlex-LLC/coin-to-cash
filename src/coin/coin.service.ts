import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coin } from './entities/coin.entity';
import { Repository } from 'typeorm';
import { CoinToType } from './entities/coin-to-type.entity';
import { Place } from './entities/place.entity';
import { PlaceToCoinType } from './entities/place-to-coin-type.entity';
import { Pair } from './entities/pair';
import { Interval } from './entities/interval.entity';

@Injectable()
export class CoinService {
  constructor(
    @InjectRepository(Coin)
    private coinRepository: Repository<Coin>,

    @InjectRepository(CoinToType)
    private coinToTypeRepository: Repository<CoinToType>,

    @InjectRepository(Place)
    private placeRepository: Repository<Place>,

    @InjectRepository(PlaceToCoinType)
    private placeToCoinTypeRepository: Repository<PlaceToCoinType>,

    @InjectRepository(Pair)
    private pairRepository: Repository<Pair>,

    @InjectRepository(Interval)
    private intervalRepository: Repository<Interval>,
  ) {}

  async getCoinToTypes() {
    const coinToTypes = await this.coinToTypeRepository.find();

    return coinToTypes;
  }

  async getCoinPairs(coinToTypeId: number): Promise<any[]> {
    return await this.pairRepository
      .createQueryBuilder('pair')
      .leftJoin('pair.from', 'coinToType')
      .select([
        'coinToType.id as id',
        'pair.id as pairId',
        'coinToType.coinId as coinId',
        'coinToType.name_en as name_en',
        'coinToType.name_am as name_am',
        'coinToType.name_ru as name_ru',
        'coinToType.type as type',
      ])
      .where('pair.toId = :coinToTypeId and pair.isActive = 1', {
        coinToTypeId,
      })
      .getRawMany();
  }

  async getPairInfo(pairId: number) {
    return await this.pairRepository
      .createQueryBuilder('pair')
      .leftJoinAndSelect('pair.from', 'coinToType1')
      .leftJoinAndSelect('pair.to', 'coinToType2')
      .where('pair.id = :pairId', { pairId })
      .getOne();
  }

  async getCoinToTypeInfo(coinToTypeId: number) {
    return await this.coinToTypeRepository
      .createQueryBuilder('coinToType')
      .where('coinToType.id = :coinToTypeId', { coinToTypeId })
      .getOne();
  }

  async getInterval(pairId: number, amount: number) {
    return await this.intervalRepository
      .createQueryBuilder('interval')
      .where(
        'interval.pairId = :pairId and ( :amount >= interval.from and :amount <= interval.to ) or ( :amount >= interval.from and interval.to is null ) or ( interval.to is null and interval.from is null )',
      )
      .setParameters({
        pairId,
        amount,
      })
      .getOne();
  }

  async getPlaces(coinToTypeId: number) {
    return (await this.placeToCoinTypeRepository
      .createQueryBuilder('placeToCoinType')
      .leftJoin('placeToCoinType.place', 'place')
      .select([
        'place.id as id',
        'place.name_en as name_en',
        'place.name_am as name_am',
        'place.name_ru as name_ru',
      ])
      .where('placeToCoinType.coinToTypeId = :coinToTypeId', { coinToTypeId })
      .getRawMany()) as Place[];
  }
}
