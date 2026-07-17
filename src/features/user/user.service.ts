import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (user) {
      throw new ConflictException('User already exists');
    }

    return await this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash: dto.passwordHash,
    });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async findById(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async getMyProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }
}
