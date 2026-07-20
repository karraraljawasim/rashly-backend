import { HttpStatus, INestApplication } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createTestApp } from './helpers/create-test-app.helper';
import { resetDatabase } from './helpers/reset-db.helper';
import { createUserTest } from './helpers/create-user-test.helper';
import { Role } from '../src/features/user/enums/user-role.enum';
import request from 'supertest';
import { createEventTest } from './helpers/create-event-test.helper';
import { randomUUID } from 'node:crypto';

describe('InventoryController (e2e)', () => {
  let app: INestApplication;
  let db: NodePgDatabase;
  let adminUser: { email: string; password: string; token: string };
  let user: { email: string; password: string; token: string };
  let eventId: string;

  beforeAll(async () => {
    ({ app, db } = await createTestApp());
    await resetDatabase(db);

    user = await createUserTest(db, app);
    adminUser = await createUserTest(db, app, Role.Admin);
    eventId = await createEventTest(app, adminUser.token);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /events/:eventId/inventory', () => {
    it('should create inventory items and return it', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post(`/events/${eventId}/inventory`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          name: 'Test inventory Item',
          price: 100,
          totalQuantity: 10,
        })
        .expect(HttpStatus.CREATED);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body?.data?.name).toEqual('Test inventory Item');
    });

    it('should throw ForbiddenException if the role not "admin"', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post(`/events/${eventId}/inventory`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          name: 'Test inventory Item',
          price: 100,
          totalQuantity: 10,
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should throw NotFoundException if event not found', async () => {
      const notFoundEventId = randomUUID();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post(`/events/${notFoundEventId}/inventory`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          name: 'Test inventory Item',
          price: 100,
          totalQuantity: 10,
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /events/:eventId/inventory', () => {
    it('should return inventory items belong to the event with meta', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post(`/events/${eventId}/inventory`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          name: 'Test inventory Item',
          price: 100,
          totalQuantity: 10,
        });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .get(`/events/${eventId}/inventory`)
        .expect(HttpStatus.OK);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body?.data?.length).toEqual(2);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body?.meta).toBeDefined();
    });
  });

  describe('inventory - single resource operations', () => {
    let inventoryItemId: string;

    it('create inventory item', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post(`/events/${eventId}/inventory`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          name: 'Test inventory Item',
          price: 100,
          totalQuantity: 10,
        });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      inventoryItemId = response.body?.data?.id;
      expect(inventoryItemId).toBeDefined();
    });

    describe('GET /inventory/:inventoryId', () => {
      it('should return inventory details', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const response = await request(app.getHttpServer())
          .get(`/inventory/${inventoryItemId}`)
          .expect(HttpStatus.OK);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body?.data?.id).toEqual(inventoryItemId);
      });
    });

    describe('PATCH /inventory/:inventoryId', () => {
      it('should update  inventory and return it', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const response = await request(app.getHttpServer())
          .patch(`/inventory/${inventoryItemId}`)
          .set('Authorization', `Bearer ${adminUser.token}`)
          .send({
            name: 'Updated Name',
          })
          .expect(HttpStatus.OK);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body?.data?.id).toEqual(inventoryItemId);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body?.data?.name).toEqual('Updated Name');
      });

      it('should throw ForbiddenException in the user role not admin', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .patch(`/inventory/${inventoryItemId}`)
          .set('Authorization', `Bearer ${user.token}`)
          .send({
            name: 'Updated Name',
          })
          .expect(HttpStatus.FORBIDDEN);
      });
    });

    describe('DELETE /inventory/:inventoryId', () => {
      it('should delete inventory and return it', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .delete(`/inventory/${inventoryItemId}`)
          .set('Authorization', `Bearer ${adminUser.token}`)
          .expect(HttpStatus.OK);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .get(`/inventory/${inventoryItemId}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should throw ForbiddenException in the user role not admin', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .delete(`/inventory/${inventoryItemId}`)
          .set('Authorization', `Bearer ${user.token}`)
          .expect(HttpStatus.FORBIDDEN);
      });
    });
  });
});
