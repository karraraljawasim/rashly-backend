import { HttpStatus, INestApplication } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { resetDatabase } from './helpers/reset-db.helper';
import request from 'supertest';
import { createTestApp } from './helpers/create-test-app.helper';
import { createUserTest } from './helpers/create-user-test.helper';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let db: NodePgDatabase;
  let user: { email: string; password: string; token: string };

  beforeAll(async () => {
    ({ app, db } = await createTestApp());
    await resetDatabase(db);

    user = await createUserTest(db, app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/me', () => {
    it('should return user info', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(HttpStatus.OK);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body?.data?.email).toEqual(user.email);
    });
  });
});
