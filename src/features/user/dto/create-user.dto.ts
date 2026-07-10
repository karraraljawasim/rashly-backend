import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is Required.' })
  fullName: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email is Required.' })
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is Required.' })
  passwordHash: string;
}
