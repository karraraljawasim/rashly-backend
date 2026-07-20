import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { resetDatabase } from './helpers/reset-db.helper';
import { HttpStatus } from '@nestjs/common';
import { createTestApp } from './helpers/create-test-app.helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let db: NodePgDatabase;
  const userTest = {
    fullName: 'test user',
    email: 'test@gmail.com',
    password: 'Password123!',
  };

  beforeAll(async () => {
    ({ app, db } = await createTestApp());
    await resetDatabase(db);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user and return tokens', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userTest)
        .expect(HttpStatus.CREATED);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data).toHaveProperty('accessToken');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject registering with a email that already exists', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userTest)
        .expect(HttpStatus.CONFLICT);
    });

    it('should reject registration with invalid input', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email' })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userTest.email, password: userTest.password })
        .expect(HttpStatus.CREATED);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data).toHaveProperty('accessToken');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject with incorrect email or  password', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userTest.email, password: 'Incorrect-Password' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
