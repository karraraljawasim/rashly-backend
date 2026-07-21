# Rashly
 
Rashly is a backend ticketing API that manages users, events, and bookings. It uses Redis to prevent double-booking during high-demand sales, guaranteeing only one person can claim a contested ticket. It also uses temporary checkout holds, automatically releasing unsold seats back into the pool if a purchase isn't finalized.

## Tech stack

- NestJS (Node.js / TypeScript)
- PostgreSQL (Drizzle ORM)
- Redis 
- BullMQ for background jobs
- JWT auth with Passport
- Swagger for API docs
## Getting started

### Requirements

- Node.js 24+
- Docker (for Postgres and Redis), or your own local instances
### 1. Clone the repo

```bash
git clone https://github.com/karraraljawasim/rashly-backend.git
cd rashly-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start Postgres and Redis

```bash
docker compose up -d
```

This starts Postgres on port `5433` and Redis on port `6379`.

### 4. Set up environment variables

Copy the sample file and fill in your own values:

```bash
cp .env.example .env
```

For end-to-end tests, create a `.env.test` file with the same keys pointed at a test database.

### 5. Run database migrations

```bash
npm run db:migrate
```


### 6. Start the app

```bash
npm run start:dev
```

The API runs on `http://localhost:8080` by default, and the Swagger docs are at `http://localhost:8080/api-docs`.



## Tests

Unit test

```bash
npm test
```

End-to-end test

```bash
npm run db:push:test
npm run test:e2e
```
