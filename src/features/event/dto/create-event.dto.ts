import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  IsBefore,
  IsFutureDate,
} from '../../../shared/validators/date.validator';

export class CreateEventDto {
  @IsNotEmpty({ message: 'Event is required' })
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
  })
  name: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
  })
  description?: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  @IsFutureDate()
  @IsBefore('saleEndsAt')
  saleStartsAt: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  saleEndsAt?: Date;
}
