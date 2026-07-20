import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Role } from '../../src/features/user/enums/user-role.enum';
import { users } from '../../src/features/user/schema/user.schema';

let counter = 0;

export async function createUserTest(
  db: NodePgDatabase,
  app: INestApplication,
  role?: Role,
) {
  counter++;
  const email = `test-user-${Date.now()}-${counter}@example.com`;
  const password = 'Password123!';

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ fullName: 'Test User', email, password });

  if (role === Role.Admin) {
    await db.update(users).set({ role: role });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email,
      password,
    });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  return { email, password, token: loginResponse.body?.data?.accessToken };
}
