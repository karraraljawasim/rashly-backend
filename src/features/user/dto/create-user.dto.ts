import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Full name is Required.' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @IsNotEmpty({ message: 'Email is Required.' })
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
  })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password is Required.' })
  @IsString()
  passwordHash: string;
}
