import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Email is Required' })
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is Required' })
  password: string;
}
