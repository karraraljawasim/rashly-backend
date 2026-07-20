import { HttpStatus, INestApplication } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createTestApp } from './helpers/create-test-app.helper';
import { resetDatabase } from './helpers/reset-db.helper';
import { createUserTest } from './helpers/create-user-test.helper';
import { Role } from '../src/features/user/enums/user-role.enum';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createEventTest } from './helpers/create-event-test.helper';
import { createInventoryItem } from './helpers/create-inventory-item-test.helper';

describe('EventController (e2e)', () => {
  let app: INestApplication;
  let db: NodePgDatabase;
  let adminUser: { email: string; password: string; token: string };
  let user: { email: string; password: string; token: string };
  let eventId: string;
  let inventoryItemId: string;

  beforeAll(async () => {
    ({ app, db } = await createTestApp());

    await resetDatabase(db);

    adminUser = await createUserTest(db, app, Role.Admin);
    user = await createUserTest(db, app);
    eventId = await createEventTest(app, adminUser.token);
    inventoryItemId = await createInventoryItem(
      app,
      adminUser.token,
      eventId,
      5,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CREATE /booking', () => {
    let idempotencyKey = randomUUID();
    it('should create booking and return it', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/booking')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ quantity: 2, inventoryItemId, idempotencyKey })
        .expect(HttpStatus.CREATED);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body?.data?.idempotencyKey).toEqual(idempotencyKey);
    });

    it('should not oversell (create bookings more than total quantity in inventory)', async () => {
      idempotencyKey = randomUUID();
      // inventoryItems.totalQuantity = 5
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/booking')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ quantity: 6, inventoryItemId, idempotencyKey })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('Booking - single resource operations', () => {
    const idempotencyKey = randomUUID();
    let bookingId: string;
    it('should create booking', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/booking')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ quantity: 2, inventoryItemId, idempotencyKey });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      bookingId = response.body?.data.id as string;

      expect(bookingId).toBeDefined();
    });

    describe('GET /booking/:bookingId', () => {
      it('should return booking details', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const response = await request(app.getHttpServer())
          .get(`/booking/${bookingId}`)
          .set('Authorization', `Bearer ${user.token}`)
          .expect(HttpStatus.OK);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body?.data?.id).toEqual(bookingId);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body?.data?.quantity).toEqual(2);
      });
      it('should throw ForbidException if you not owner to the booking or not admin', async () => {
        const otherUser = await createUserTest(db, app, Role.User);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .get(`/booking/${bookingId}`)
          .set('Authorization', `Bearer ${otherUser.token}`)
          .expect(HttpStatus.FORBIDDEN);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .get(`/booking/${bookingId}`)
          .set('Authorization', `Bearer ${adminUser.token}`)
          .expect(HttpStatus.OK);
      });
    });
  });
});
