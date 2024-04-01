import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCoinToTypeDto } from './create-coin-to-type.dto';

export class UpdateCoinToTypeDto extends PartialType(
  OmitType(CreateCoinToTypeDto, ['coinId', 'type'] as const),
) {}
