import { ExchangeOption } from '../enums/exchange-option.enum';

export class CreateOrderDto {
  amount: number;

  option: ExchangeOption;

  user: {
    id: number;
  };

  place?: {
    id: number;
  };

  pair: {
    id: number;
  };
}
