# Chattova Backend

Node.js + Express + Socket.IO API for Chattova.

## Setup (first time)

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create your `.env` file:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Fill in the same DB_* values you used in `database/.env` (same database,
   same credentials), plus generate two long random strings for
   `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (they must be different from
   each other). You can generate one quickly with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Run that command twice — once for each secret.

3. Make sure your database migrations have already been run (see
   `../database/README.md`) — the backend expects the tables to exist.

## Running the server

```bash
npm run dev
```
This uses `nodemon`, which automatically restarts the server whenever you
save a file — useful while developing.

Or, without auto-restart:
```bash
npm start
```

You should see:
```
✅ Connected to PostgreSQL database: chattova
🚀 Chattova backend running on http://localhost:4000
   Try it: http://localhost:4000/api/v1/health
```

## Testing it works

Open a **second** terminal (leave the server running in the first one) and run:

```bash
curl http://localhost:4000/api/v1/health
```

You should get back:
```json
{"success":true,"data":{"status":"ok","timestamp":"..."}}
```

### Try registering a user

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"shalx","email":"shalx@example.com","password":"testpass123"}'
```

You should get back a `user` object plus an `accessToken` and `refreshToken`.

### Try logging in

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shalx@example.com","password":"testpass123"}'
```

## Project layout

```
backend/
├── app.js               → builds the Express app (middleware + routes)
├── server.js             → starts the HTTP + Socket.IO server (run this file)
├── config/
│   ├── env.js             → loads & validates .env
│   └── database.js        → PostgreSQL connection pool
├── common/
│   ├── errors/             → AppError class
│   ├── middleware/         → error handling, validation, async wrapper
│   └── helpers/            → JWT sign/verify
├── modules/
│   ├── auth/                → register, login
│   ├── health/               → GET /api/v1/health
│   └── ... (more modules added phase by phase)
├── routes/
│   └── index.js            → mounts every module's routes under /api/v1
└── sockets/
    └── index.js             → Socket.IO connection handling
