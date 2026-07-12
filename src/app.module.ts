import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { UserModule } from './features/user/user.module';
import { AuthModule } from './features/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { EventModule } from './features/event/event.module';
import { InventoryModule } from './features/inventory/inventory.module';
import { BookingModule } from './features/booking/booking.module';

@Module({
  imports: [
    CoreModule,
    UserModule,
    AuthModule,
    SharedModule,
    EventModule,
    InventoryModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
