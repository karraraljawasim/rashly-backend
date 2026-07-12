import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInventoryDto {
  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty({ message: 'price is required' })
  @Transform(({ value }): unknown => {
    return typeof value === 'number' ? value.toFixed(2) : value;
  })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message:
      'price must be a positive number or string with up to 2 decimal places',
  })
  price: string;

  @IsNotEmpty({ message: 'totalQuantity is required' })
  @IsInt()
  @Min(1)
  totalQuantity: number;
}
