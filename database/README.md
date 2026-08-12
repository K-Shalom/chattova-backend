# Chattova — Database Migrations

This folder contains 19 migration files that build the full Chattova PostgreSQL database.
Everything you need is here — from installing PostgreSQL to seeing all tables in your database.

---

## Step 1 — Install PostgreSQL on Deepin

Deepin is Debian-based, so `apt` is the tool used to install software.

Open **Terminal** (Ctrl+Alt+T on Deepin) and run:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

Once done, check that PostgreSQL is running:

```bash
sudo systemctl status postgresql
```

If you see "active (running)" in green, it worked. Press `q` to exit that status view.

---

## Step 2 — Create the database and user

PostgreSQL comes with an admin user called `postgres`. Log in as that user:

```bash
sudo -u postgres psql
```

You're now inside `psql` (the PostgreSQL shell). Type the following, one line at a time (each line ends with `;`):

```sql
CREATE DATABASE chattova;
CREATE USER chattova_user WITH ENCRYPTED PASSWORD 'changeme123';
GRANT ALL PRIVILEGES ON DATABASE chattova TO chattova_user;
ALTER DATABASE chattova OWNER TO chattova_user;
```

Then exit:

```sql
\q
```

> ⚠️ **Important:** Replace `'changeme123'` with a strong password of your own, and use that same password in your `.env` file (next step).

---

## Step 3 — Set up your `.env`

From the repo root (`chattova/`), copy the template:

```bash
cp database/.env.example database/.env
```

Open `database/.env` (using nano or any text editor you like):

```bash
nano database/.env
```

Fill in your details (matching what you set in Step 2):

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chattova
DB_USER=chattova_user
DB_PASSWORD=changeme123
```

Save (in nano: `Ctrl+O`, then `Enter`, then `Ctrl+X` to exit).

---

## Step 4 — Make the script executable

This only needs to be done once:

```bash
chmod +x scripts/migrate.sh
```

---

## Step 5 — Run all migrations

From the repo root, run:

```bash
./scripts/migrate.sh
```

You'll see each file run one by one (001 through 019), then a final message:

```
🎉 All 19 migrations completed successfully! Your database now has every Chattova table.
```

---

## Step 6 — Verify it worked

Connect to your database:

```bash
psql -h localhost -U chattova_user -d chattova
```

(It will ask for the password you set in `.env`)

Then run:

```sql
\dt
```

You should see a list of all 17 tables (users, messages, conversations, and 14 more). If you see all of them, it worked 🎉

To exit:

```sql
\q
```

---

## Troubleshooting

- **"psql: command not found"** → PostgreSQL wasn't installed correctly; go back to Step 1.
- **"FATAL: password authentication failed"** → The password in `.env` doesn't match the one you set in Step 2. Fix one so they match.
- **"database chattova does not exist"** → You didn't create the database in Step 2, or the name in `.env` doesn't match.
- **A migration fails partway through** → The script stops immediately (`set -e`). Check the error message — it will point to exactly where the problem is. You don't need to re-run migrations that already succeeded; fix the issue and continue from the file that failed.

---

## Migration order

| # | File | What it does |
|---|---|---|
| 001 | extensions.sql | Enables UUID generation |
| 002 | users.sql | User accounts |
| 003 | devices.sql | User devices |
| 004 | contacts.sql | Address book |
| 005 | blocks.sql | Blocking other users |
| 006 | conversations.sql | Conversations (direct/group/channel) |
| 007 | conversation_invites.sql | Invite links |
| 008 | conversation_participants.sql | Conversation membership + roles |
| 009 | messages.sql | Messages |
| 010 | add_last_read_message_fk.sql | Links last_read to messages |
| 011 | attachments.sql | Photos/audio/files |
| 012 | message_statuses.sql | Delivered/read receipts |
| 013 | message_reactions.sql | Emoji reactions |
| 014 | message_history.sql | Edit history |
| 015 | pinned_messages.sql | Pinned messages |
| 016 | calls.sql | Voice/video calls |
| 017 | notifications.sql | Notifications |
| 018 | reports.sql | Abuse reports |
| 019 | moderation_actions.sql | Moderation action log |

---

**Next:** The backend scaffold (Node.js + Express + Socket.IO) will connect to this database using the same values as `.env`.
