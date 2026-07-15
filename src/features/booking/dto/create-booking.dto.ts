import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity: number = 1;

  @IsNotEmpty()
  @IsUUID()
  inventoryItemId: string;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;
}
