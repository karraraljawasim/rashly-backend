import { HttpStatus, INestApplication } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createTestApp } from './helpers/create-test-app.helper';
import { resetDatabase } from './helpers/reset-db.helper';
import { createUserTest } from './helpers/create-user-test.helper';
import { Role } from '../src/features/user/enums/user-role.enum';
import request from 'supertest';
import { randomUUID } from 'node:crypto';

describe('EventController (e2e)', () => {
  let app: INestApplication;
  let db: NodePgDatabase;
  let adminUser: { email: string; password: string; token: string };
  let user: { email: string; password: string; token: string };

  beforeAll(async () => {
    ({ app, db } = await createTestApp());
    await resetDatabase(db);

    adminUser = await createUserTest(db, app, Role.Admin);
    user = await createUserTest(db, app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /events', () => {
    it('should create events and return it', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          name: 'Test Event',
          description: 'This is a test event',
          saleStartsAt: '2026-08-08',
        })
        .expect(HttpStatus.CREATED);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body?.data?.name).toEqual('Test Event');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body?.data?.description).toEqual('This is a test event');
    });

    it('should throw ForbiddenException if the role not "admin"', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          name: 'Test Event',
          description: 'This is a test event',
          saleStartsAt: '2026-08-08',
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('GET /events', () => {
    it('should return all events with meta', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(HttpStatus.OK);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body?.data).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body?.meta).toBeDefined();
    });
  });

  describe('Events - single resource operations', () => {
    let createdEventId: string;
    it('should create an event', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ name: 'Test Event', saleStartsAt: '2026-08-01' })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      createdEventId = response.body?.data?.id;

      expect(createdEventId).toBeDefined();
    });

    describe('GET /events/:id', () => {
      it('should return event deletes', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const response = await request(app.getHttpServer())
          .get(`/events/${createdEventId}`)
          .expect(HttpStatus.OK);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body?.data?.id).toEqual(createdEventId);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body?.data?.name).toEqual('Test Event');
      });

      it('should throw NotFoundException if event not found', async () => {
        const notFoundId = randomUUID();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .get(`/events/${notFoundId}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });

    describe('PATCH /events/:id', () => {
      it('should update event and return it', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const response = await request(app.getHttpServer())
          .patch(`/events/${createdEventId}`)
          .set('Authorization', `Bearer ${adminUser.token}`)
          .send({ name: 'Updated Test Event' })
          .expect(HttpStatus.OK);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body?.data?.name).toEqual('Updated Test Event');
      });
    });

    describe('DELETE /events/:id', () => {
      it('should throw ForbiddenException if the role not "admin"', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .delete(`/events/${createdEventId}`)
          .set('Authorization', `Bearer ${user.token}`)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should delete event', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .delete(`/events/${createdEventId}`)
          .set('Authorization', `Bearer ${adminUser.token}`)
          .expect(HttpStatus.OK);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .get(`/events/${createdEventId}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });
});
