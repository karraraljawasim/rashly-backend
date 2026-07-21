import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from './enums/user-role.enum';

@ApiTags('user')
@ApiResponse({
  status: 500,
  description: 'Internal Server Error',
})
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get user login user info (profile).' })
  @ApiResponse({
    status: 200,
    description: 'Create event successfully.',
    schema: {
      example: {
        success: true,
        data: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fullName: 'Test User',
          email: 'user@example.com',
          role: Role.User,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid token.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@GetUser('id') userId: string) {
    return await this.userService.getMyProfile(userId);
  }
}
