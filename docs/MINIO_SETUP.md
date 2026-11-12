# MinIO setup and credential rotation

MinIO stores uploaded message files. The backend connects to its storage API on port 9000; its browser console normally uses port 9001. Having the project source does not start a storage server.

## First setup on Windows

Install Docker Desktop using the [official Windows instructions](https://docs.docker.com/desktop/setup/install/windows-install/). It may require enabling virtualization, installing WSL 2 and restarting Windows. Start Docker Desktop and wait for its engine to be ready. These project scripts do not install Docker or change Windows settings.

In PowerShell:

```powershell
cd C:\Users\Shalom\Documents\chattova-backend\backend
npm run minio:configure
cd ..
docker compose config --quiet
docker compose up -d minio
```

The helper writes a random 256-bit password to the ignored repository-root `.env` and synchronizes storage credentials in ignored `backend/.env`, without printing values. It preserves unrelated environment settings and the existing root username. Repeating configuration keeps the password; rotation requires a separate command. Files receive owner-only permissions where POSIX permissions are supported; protect your Windows account and folder permissions too.

Database and JWT configuration must be completed separately in `backend/.env`. This helper configures storage only.

Open http://localhost:9001 and read your credentials privately from root `.env` in your editor. Create the `chattova-attachments` bucket if absent. Do not share credentials in chat, screenshots or issues. Keep the bucket private; authorized media downloads remain follow-up work in #11.

## Rotate an existing development server

Use the actual server machine. Make a secure backup of data and configuration, and identify applications and aliases using its credentials. Keep `MINIO_ROOT_USER` unchanged. If the running server uses a username other than this project's original `chattova_minio_admin`, put that existing username in root `.env` first. The helper synchronizes the development backend to the root credentials; a production backend should use a dedicated account with limited permissions.

From `backend/`:

```sh
npm run minio:rotate
cd ..
docker compose config --quiet
docker compose up -d --force-recreate minio
```

The existing named data volume is preserved. Do not run `docker compose down --volumes` during rotation. A plain container restart keeps the old environment; recreation applies the changed password. Restart the backend through its normal launch method. Update other clients and review/revoke compromised service or access keys separately.

From `backend/`, install dependencies and verify:

```sh
npm ci
npm run minio:verify-rotation
```

The verifier reads the exposed credential from historical Git commit `e6803cd` in memory. It checks that the configured new credential can list buckets and that the exposed credential receives an authentication denial. Neither credential is printed or passed as a command-line argument. Git must be on PATH and the commit must be present. Network errors, missing history and unchanged passwords fail verification.

Expected success: `Verified: new credentials authenticate and the exposed credentials are rejected.` This also works with a newly created service configured with a fresh password.

## Exposure review and outstanding work

A focused scan of tracked configuration history found the same literal password in `docker-compose.yml` (introduced in `e6803cd`) and `database/.env.example` (`1c62fc1`). Current files now use required environment references or blank templates. Assignment-like matches in application code were references to runtime secrets/token functions. This targeted review is not a comprehensive secret-scanner audit.

Existing Git history, clones and forks still contain the exposed credential. If it was used for PostgreSQL or another account, rotate those accounts on their actual servers too. Removing a literal or rewriting history cannot replace credential revocation.

On the reviewed Windows machine, no Docker/MinIO process, Docker CLI, WSL installation or listener on port 9000 was found. Repository changes alone do not verify rotation of any deployed server. Keep issue #2 open until relevant services and any reused credentials are checked.

References: [Compose interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/) and [MinIO root rotation](https://docs.min.io/aistor/reference/aistor-server/settings/root-credentials/).
