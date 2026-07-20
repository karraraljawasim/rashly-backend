import { INestApplication } from '@nestjs/common';
import request from 'supertest';

let counter = 0;

export async function createEventTest(
  app: INestApplication,
  adminToken: string,
) {
  counter++;
  const name = `Test Event ${counter}`;
  const saleStartsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const response = await request(app.getHttpServer())
    .post('/events')
    .send({ name, saleStartsAt })
    .set('Authorization', `Bearer ${adminToken}`);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return response.body?.data?.id as string;
}
