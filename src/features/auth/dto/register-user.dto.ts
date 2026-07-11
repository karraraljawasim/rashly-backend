import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterUserDto {
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
  @IsStrongPassword(undefined, {
    message:
      'Password must be at least 8 characters long, and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
  })
  password: string;
}
