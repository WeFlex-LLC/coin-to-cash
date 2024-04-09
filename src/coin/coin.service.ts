import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coin } from './entities/coin.entity';
import { Repository } from 'typeorm';
import { CoinToType } from './entities/coin-to-type.entity';
import { Place } from './entities/place.entity';
import { PlaceToCoinType } from './entities/place-to-coin-type.entity';
import { Pair } from './entities/pair';
import { Interval } from './entities/interval.entity';
import { CreateCoinDto } from './dto/create-coin.dto';
import { UpdateCoinDto } from './dto/update-coin.dto';
import { CreateCoinToTypeDto } from './dto/create-coin-to-type.dto';
import { UpdateCoinToTypeDto } from './dto/update-coin-to-type.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreatePairDto } from './dto/create-pair.dto';
import { UpdatePairDto } from './dto/update-pair.dto';
import { CreateIntervalDto } from './dto/create-interval.dto';
import { UpdateIntervalDto } from './dto/update-interval.dto';
import { ExchangeOption } from 'src/users/enums/exchange-option.enum';

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

  async findCoins(filter?: { name?: string }) {
    let where = '';

    if (filter?.name) where = 'coin.name like :name';

    return await this.coinRepository
      .createQueryBuilder('coin')
      .where(where)
      .setParameters({
        name: `%${filter?.name || ''}%`,
      })
      .getMany();
  }

  async findCoinById(id: number) {
    const coin = await this.coinRepository.findOne({
      where: { id },
      relations: { coinToTypes: true },
    });

    return coin;
  }

  async findCoinToTypes(filter?: { exclude?: string[]; placeId?: number }) {
    let where = '';
    let repository;

    if (filter?.exclude) where += 'coinToType.id NOT IN (:...exclude)';

    if (filter?.placeId)
      where += where.length ? ' AND ' : '' + 'placeToCoin.placeId = :placeId';

    if (filter?.placeId)
      repository = this.placeToCoinTypeRepository
        .createQueryBuilder('placeToCoin')
        .leftJoin('placeToCoin.coinToType', 'coinToType');
    else
      repository = this.coinToTypeRepository.createQueryBuilder('coinToType');

    return await repository
      .select([
        'DISTINCT coinToType.id as "id"',
        'coinToType.coinId as "coinId"',
        'coinToType.type as "type"',
        'coinToType.name_en as "name_en"',
        'coinToType.name_am as "name_am"',
        'coinToType.name_ru as "name_ru"',
        'coinToType.count as "count"',
      ])
      .where(where, {
        exclude: filter?.exclude || [],
        placeId: filter?.placeId,
      })
      .getRawMany();
  }

  async findCoinToTypeById(coinToTypeId: number) {
    return await this.coinToTypeRepository.findOneBy({ id: coinToTypeId });
  }

  async findPlaces(filter?: { query?: string; coinToTypeId?: number }) {
    let where = '';
    let repository;

    if (filter?.coinToTypeId)
      where = 'placeToCoin.coinToTypeId = :coinToTypeId';

    if (filter?.query)
      where += where.length
        ? ' AND '
        : '' +
          '(LOWER(place.name_en) like LOWER(:query) OR LOWER(place.name_am) like LOWER(:query) OR LOWER(place.name_ru) like LOWER(:query))';

    if (filter?.coinToTypeId)
      repository = this.placeToCoinTypeRepository
        .createQueryBuilder('placeToCoin')
        .innerJoin('placeToCoin.place', 'place');
    else repository = this.placeRepository.createQueryBuilder('place');

    return (await repository
      .select([
        'DISTINCT place.id as "id"',
        'place.name_en as "name_en"',
        'place.name_am as "name_am"',
        'place.name_ru as "name_ru"',
        'place.createdAt as "createdAt"',
      ])
      .where(where, {
        coinToTypeId: filter?.coinToTypeId,
        query: `%${filter?.query || ''}%`,
      })
      .orderBy('place.id', 'DESC')
      .getRawMany()) as Place[];
  }

  async findPlaceById(placeId: number) {
    return await this.placeRepository.findOneBy({ id: placeId });
  }

  async findPairById(pairId: number) {
    return await this.pairRepository
      .createQueryBuilder('pair')
      .leftJoinAndSelect('pair.from', 'coinToType1')
      .leftJoinAndSelect('pair.to', 'coinToType2')
      .where('pair.id = :pairId', { pairId })
      .getOne();
  }

  async findPairs(
    filter?: { toId?: number; fromId?: number },
    join?: { to?: boolean; from?: boolean },
  ): Promise<Pair[]> {
    let where = '';

    if (filter?.toId) where += 'pair.toId = :toId';

    if (filter?.fromId) where += where ? ' AND ' : '' + 'pair.fromId = :fromId';

    const pairs = await this.pairRepository
      .createQueryBuilder('pair')
      .where(where, {
        toId: filter.toId,
        fromId: filter.fromId,
      })
      .orderBy('pair.id', 'DESC');

    if (join?.to) pairs.leftJoinAndSelect('pair.to', 'to');

    if (join?.from) pairs.leftJoinAndSelect('pair.from', 'from');

    return pairs.getMany();
  }

  async findCoinToTypesByToId(toId: number): Promise<any[]> {
    const where = 'pair.isActive = :isActive AND pair.toId = :toId';

    const pairs = await this.pairRepository
      .createQueryBuilder('pair')
      .leftJoin('pair.from', 'fromCoinToType')
      .select([
        'fromCoinToType.id as "id"',
        'pair.id as "pairId"',
        'pair.fromId as "fromId"',
        'pair.toId as "toId"',
        'fromCoinToType.coinId as "coinId"',
        'fromCoinToType.name_en as "name_en"',
        'fromCoinToType.name_am as "name_am"',
        'fromCoinToType.name_ru as "name_ru"',
        'fromCoinToType.type as "type"',
      ])
      .where(where, {
        toId,
        isActive: true,
      })
      .getRawMany();

    return pairs;
  }

  async findOneInterval(pairId: number, amount: number) {
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

  async findIntervals(pairId: number) {
    return await this.intervalRepository.findBy({ pairId });
  }

  async findPlacesByCoinToTypeId(coinToTypeId: number) {
    return (await this.placeToCoinTypeRepository
      .createQueryBuilder('placeToCoinType')
      .leftJoin('placeToCoinType.place', 'place')
      .select([
        'place.id as "id"',
        'place.name_en as "name_en"',
        'place.name_am as "name_am"',
        'place.name_ru as "name_ru"',
      ])
      .where('placeToCoinType.coinToTypeId = :coinToTypeId', { coinToTypeId })
      .orderBy('place.id', 'DESC')
      .getRawMany()) as Place[];
  }

  async createCoin(createCoinDto: CreateCoinDto) {
    return await this.coinRepository.save(createCoinDto);
  }

  async createCoinToType(createCoinToTypeDto: CreateCoinToTypeDto) {
    const { coinId, ...payload } = createCoinToTypeDto;

    return await this.coinToTypeRepository.save({
      ...payload,
      coin: {
        id: coinId,
      },
    });
  }

  async createPlace(createPlaceDto: CreatePlaceDto) {
    return await this.placeRepository.save(createPlaceDto);
  }

  async createPlaceToCoinType(createPlaceToCoinTypeDto: {
    placeId: number;
    coinToTypeId: number;
  }) {
    return await this.placeToCoinTypeRepository.save(createPlaceToCoinTypeDto);
  }

  async createPair(createPairDto: CreatePairDto) {
    return await this.pairRepository.save(createPairDto);
  }

  async createInterval(pairId: number, createIntervalDto: CreateIntervalDto) {
    return await this.intervalRepository.save({
      pair: {
        id: pairId,
      },
      ...createIntervalDto,
    });
  }

  async updateCoin(id: number, updateCoinDto: UpdateCoinDto) {
    const coin = await this.findCoinById(id);

    if (!coin) throw new NotFoundException('Coin Not Found');

    await this.coinRepository.update({ id }, updateCoinDto);

    return {
      success: true,
    };
  }

  async updateCoinToType(
    coinToTypeId: number,
    updateCoinToTypeDto: UpdateCoinToTypeDto,
  ) {
    const coinToType = await this.findCoinToTypeById(coinToTypeId);

    if (!coinToType) throw new NotFoundException('Coin with Type Not Found');

    await this.coinToTypeRepository.update(
      { id: coinToTypeId },
      updateCoinToTypeDto,
    );

    return {
      success: true,
    };
  }

  async updatePlace(placeId: number, updatePlaceDto: UpdatePlaceDto) {
    const place = await this.findPlaceById(placeId);

    if (!place) throw new NotFoundException('Place Not Found');

    await this.placeRepository.update({ id: placeId }, updatePlaceDto);

    return {
      success: true,
    };
  }

  async updatePair(pairId: number, updatePairDto: UpdatePairDto) {
    const pair = await this.findPairById(pairId);

    if (!pair) throw new NotFoundException('Pair Not Found');

    await this.pairRepository.update({ id: pairId }, updatePairDto);

    return {
      success: true,
    };
  }

  async updateInterval(
    intervalId: number,
    updateIntervalDto: UpdateIntervalDto,
  ) {
    const interval = await this.intervalRepository.findOneBy({
      id: intervalId,
    });

    if (!interval) throw new NotFoundException('Interval Not Found');

    await this.intervalRepository.update({ id: intervalId }, updateIntervalDto);

    return {
      success: true,
    };
  }

  async deleteCoin(id: number) {
    const coin = await this.findCoinById(id);

    if (!coin) throw new NotFoundException('Coin Not Found');

    await this.coinRepository.delete({ id });

    return {
      success: true,
    };
  }

  async deleteCoinToType(coinToTypeId: number) {
    const coinToType = await this.findCoinToTypeById(coinToTypeId);

    if (!coinToType) throw new NotFoundException('Coin with Type Not Found');

    await this.coinToTypeRepository.delete({ id: coinToTypeId });

    return {
      success: true,
    };
  }

  async deletePlace(placeId: number) {
    const place = await this.findPlaceById(placeId);

    if (!place) throw new NotFoundException('Place Not Found');

    await this.placeRepository.delete({ id: placeId });

    return {
      success: true,
    };
  }

  async deletePlaceToCoinType(placeId: number, coinToTypeId: number) {
    const placeToCoinType = await this.placeToCoinTypeRepository.findBy({
      placeId,
      coinToTypeId,
    });

    if (!placeToCoinType) throw new NotFoundException('Pair Not Found');

    await this.placeToCoinTypeRepository.delete({ placeId, coinToTypeId });

    return {
      success: true,
    };
  }

  async deletePair(pairId: number) {
    const pair = await this.findPairById(pairId);

    if (!pair) throw new NotFoundException('Pair Not Found');

    await this.pairRepository.delete({ id: pairId });

    return {
      success: true,
    };
  }

  async deleteInterval(intervalId: number) {
    const interval = await this.intervalRepository.findOneBy({
      id: intervalId,
    });

    if (!interval) throw new NotFoundException('Interval Not Found');

    await this.intervalRepository.delete({ id: intervalId });

    return {
      success: true,
    };
  }

  async calculatePrices(
    pairId: number,
    amount: number,
    option: ExchangeOption,
  ): Promise<number> {
    const pair = await this.findPairById(pairId);
    const interval = await this.findOneInterval(pairId, amount);

    let price: number;

    if (option == ExchangeOption.Take) {
      price =
        ((amount / pair.rate + interval.fixedPrice) * 100) /
        (100 - interval.percent);
      price = Math.ceil(price);
    } else {
      const commission = (amount * interval.percent) / 100;

      price = (amount - commission - interval.fixedPrice) * pair.rate;
      price = Math.ceil(price);
    }

    return price;
  }

  async updateCounts(pairId: number, amount: number, option: ExchangeOption) {
    const price = await this.calculatePrices(pairId, amount, option);
    const pair = await this.findPairById(pairId);

    await this.coinToTypeRepository.update(
      { id: pair.fromId },
      {
        count:
          pair.from.count - (option == ExchangeOption.Take ? price : amount),
      },
    );
    await this.coinToTypeRepository.update(
      { id: pair.toId },
      {
        count: pair.to.count + (option == ExchangeOption.Give ? price : amount),
      },
    );

    return {
      success: true,
    };
  }
}
