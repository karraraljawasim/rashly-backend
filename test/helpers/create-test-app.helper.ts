import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/core/database/database.providers';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export async function createTestApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const db: NodePgDatabase = moduleFixture.get(DATABASE_CONNECTION);

  await app.init();

  return { app, db };
}
