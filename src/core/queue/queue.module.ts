import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullConfigService } from './bull-config.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
  ],
})
export class QueueModule {}
