# Chattova

For file storage and password rotation, see [MinIO setup](docs/MINIO_SETUP.md). Compose requires local credentials; run `npm run minio:configure` from `backend/` first. Never commit `.env` files.

Cross-platform communication platform — Global Mode (online) + Local Mode (offline P2P, post-v1.0).
See `docs/SAD/` and `docs/DDD/` for the full architecture documentation.

## Repo structure

```
chattova/
├── backend/          → Node.js + Express + Socket.IO API
├── frontend/         → Flutter app (mobile/web/desktop, single codebase)
├── database/         → PostgreSQL migrations, seeds, ERD
├── docs/             → SAD, DDD, ADR, diagrams, roadmap
├── docker/           → Docker configs (dev/prod services)
├── infrastructure/   → deployment configs (Phase 10 only)
├── scripts/          → setup/migrate/seed/backup scripts
└── .github/          → CI/CD workflows, issue templates
```

## Where to start (Phase 1)

1. `database/README.md` — set up PostgreSQL, run migrations
2. `backend/` — we start here (Express server + auth module)
3. `frontend/` — comes after the backend is working

## Current status

- ✅ Database schema (v1.0, locked) — 17 tables, migrations 001-019 in `database/migrations/`
- ✅ Backend scaffold — Express + Socket.IO + auth module (register/login) working
- ⏳ Frontend — not started

See `docs/roadmap/` for all project phases (1-11).
# chattova-backend
