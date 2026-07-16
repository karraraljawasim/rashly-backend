import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SharedBullConfigurationFactory,
  BullRootModuleOptions,
} from '@nestjs/bullmq';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private readonly configService: ConfigService) {}

  createSharedConfiguration(): BullRootModuleOptions {
    return {
      connection: {
        host: this.configService.get<string>('REDIS_HOST'),
        port: this.configService.get<number>('REDIS_PORT'),
      },
    };
  }
}
