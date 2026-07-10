import { Global, Module } from '@nestjs/common';
import { DATABASE_CONNECTION, databaseProviders } from './database.providers';

@Global()
@Module({
  providers: [...databaseProviders],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
