import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsInt()
  quantity: number = 1;

  @IsNotEmpty()
  @IsUUID()
  inventoryItemId: string;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;
}
