import { IsEnum } from 'class-validator';
import { CoinType } from '../enums/coin-type.enum';

export class CreateCoinToTypeDto {
  coinId: number;

  @IsEnum(CoinType)
  type: CoinType;

  name_en: string;

  name_am: string;

  name_ru: string;

  count: number;
}
