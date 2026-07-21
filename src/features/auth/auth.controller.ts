import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@ApiResponse({ status: 500, description: 'Internal Server Error.' })
@ApiResponse({
  status: 400,
  description: 'Bad Request: Invalid input data.',
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user record' })
  @ApiResponse({
    status: 201,
    description: 'Register new user successfully',
    schema: {
      example: {
        success: true,
        data: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: User with this email already exists',
  })
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @ApiResponse({
    status: 201,
    description: 'Login user successfully',
    schema: {
      example: {
        success: true,
        data: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid email or password',
  })
  @ApiOperation({ summary: 'Login to user account.' })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }
}
