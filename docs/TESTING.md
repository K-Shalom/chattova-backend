# Automated checks

Backend CI runs on every push and pull request and can also be started from the Actions tab. Its stable check name is **Backend checks**. It installs the lockfile dependencies on Node 22, checks JavaScript syntax, runs unit tests, applies all migrations twice to a disposable PostgreSQL 16 service, and runs real HTTP and Socket.IO tests.

From `backend/`, run:

```sh
npm ci
npm run check
npm test
```

Integration tests require an explicitly configured disposable database. Set `NODE_ENV=test`, `DB_NAME=chattova_test`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` in your shell. Use test-only values and never production credentials. Then run:

```sh
npm run db:test:migrate
npm run db:test:migrate
npm run test:integration
```

The guard refuses database names without the `_test` suffix. The suite creates test accounts/messages; use a dedicated database that can be discarded. It does not reset or connect to a production database. MinIO is configured with dummy test credentials; this baseline does not upload files or claim media pipeline coverage.

Tests cover partial settings updates, the database guard, health, validation, duplicate registration, login failures, missing/invalid tokens, private conversation access, message permissions, and socket authentication/room membership. Add regression tests for each new fix or feature. Existing security and feature issues remain open; this suite is not a full security audit.

Push a feature branch, open a pull request, and wait for **Backend checks** before merging. To enforce this, main branch protection must require a pull request and this status check. A workflow alone does not prevent direct pushes or failing merges.
