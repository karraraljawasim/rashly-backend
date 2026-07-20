import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function createInventoryItem(
  app: INestApplication,
  adminToken: string,
  eventId: string,
  totalQuantity = 5,
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const response = await request(app.getHttpServer())
    .post(`/events/${eventId}/inventory`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Test Item', price: '10.00', totalQuantity });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return response.body?.data?.id as string;
}
