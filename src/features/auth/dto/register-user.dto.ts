import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is Required.' })
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email is Required.' })
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is Required.' })
  @IsStrongPassword(undefined, {
    message:
      'Password must be at least 8 characters long, and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
  })
  password: string;
}
