# Chattova — Software Architecture Document (SAD)
**Version 1.0 — Final**
Prepared for Devra Technologies — July 2026

---

## Revision History

| Version | Date | Description |
|---|---|---|
| 0.1 | May 2026 | Initial architecture draft |
| 0.5 | June 2026 | Added offline-first architecture |
| 0.9 | June 2026 | Added synchronization, moderation, multi-device |
| 1.0 | July 2026 | Final — approved for implementation |
| 1.0.1 | July 2026 | Project renamed from OmniChat to **Chattova** |

---

## 1. Introduction

Chattova is a cross-platform communication platform — not just a chat app — built on a single Flutter codebase for Android, iOS, Windows, macOS, Linux, and Web. It operates in **Global Mode** (internet-based, cloud-synced) and **Local Mode** (offline, peer-to-peer over LAN/Bluetooth/Wi-Fi Direct), with automatic sync between the two.

## 2. Purpose

This document describes Chattova's architecture, technology choices, and the reasoning behind them, to guide implementation and onboarding of future engineers.

## 3. Scope

**Included in v1.0:**
- Authentication & multi-device support
- Private & group messaging (text, media, voice notes)
- Offline-first messaging (LAN P2P + sync)
- Notifications, presence, typing indicators
- Moderation (Ghost Mode, Suspension, reports)
- Voice/video calls (1-to-1)
- Basic Admin Dashboard

**Explicitly out of scope for v1.0** (deferred to v2.0+):
- Channels & Communities
- AI Assistant, message translation, bots
- Payments, business accounts
- End-to-end encryption
- Bluetooth/Wi-Fi Direct mesh (true no-network mode)
- Screen sharing, live streaming

## 4. Goals

**Functional:** reliable messaging online and offline, seamless multi-device experience, safe moderation tools.
**Technical:** offline-first, horizontally scalable, secure by default, maintainable monolith that can evolve.
**Business:** a foundation Devra can build a real product and, eventually, a company on — without a v1→v2 rewrite.

## 5. Stakeholders

- **Users** — end consumers of the app
- **Administrators** — Devra staff moderating the platform via Admin Dashboard
- **Developers** — building and maintaining Chattova
- **Testers** — validating functionality before release

---

## 6. System Overview

```
Flutter (Mobile/Web/Desktop)
         |
    REST API  +  Socket.IO
         |
     Node.js + Express
         |
   +-----+------+
   |     |      |
 Redis PostgreSQL  Object Storage (MinIO/S3)
```

## 7. Architectural Principles

Offline-first · Modular · Secure by default · Horizontally scalable · Maintainable · Event-aware · Cloud-ready

## 8. Technology Stack

| Layer | Choice |
|---|---|
| Frontend | Flutter (Riverpod, GoRouter, Dio, Socket.IO Client, sqflite/drift, flutter_secure_storage) |
| Backend | Node.js + Express + Socket.IO |
| Database | PostgreSQL |
| Cache/Presence | Redis |
| Object Storage | MinIO (dev) / AWS S3 (prod) |
| Notifications | Firebase Cloud Messaging |
| Deployment | Docker + NGINX |
| Version Control | Git + GitHub |

---

## 9. Architecture Decision Records (ADR)

| ID | Decision | Reason |
|---|---|---|
| ADR-001 | Flutter for all clients | Single codebase for mobile, web, desktop |
| ADR-002 | PostgreSQL over MongoDB | Relational consistency needed |
| ADR-003 | Redis for presence/typing | Ephemeral, high-speed data doesn't belong in a relational DB |
| ADR-004 | Socket.IO over raw WebSockets | Built-in reconnection, rooms, fallback transport |
| ADR-005 | WebRTC for calls & LAN P2P | Direct peer communication, encrypted by default |
| ADR-006 | Monolith first, microservices later | Avoid premature complexity |
| ADR-007 | SQLite local-first on client | Guarantees offline write availability |
| ADR-008 | Single `conversations` table (no separate `groups`) | Supports direct/group/channel/community without redesign |
| ADR-009 | `is_online` lives only in Redis | Single source of truth for live presence |
| ADR-010 | Client-generated message IDs, server fallback | Offline-first writes, still safe for backend jobs/imports |
| ADR-011 | No `Owner` role — `created_by` on the conversation itself grants deletion rights | Avoids a single fragile "super-role"; Admins share management power equally |
| ADR-012 | Project renamed OmniChat → Chattova | Branding decision; no architectural impact — package names, repo, and identifiers updated accordingly |

---

## 10. Core Components

Authentication · Conversation · Messaging · Notification · Media · Synchronization · Moderation · Presence

*These are logical modules organized within the Phase 1 monolith (ADR-006) — not separate deployed services. They may be extracted into physical microservices later if scale requires it, without changing their external contracts.*

## 11. Backend Architecture (Layered)

```
Request
  |
Controllers   -> parse/validate input, call services
  |
Services      -> business logic (e.g. RestrictionService, SyncService)
  |
Repositories  -> data access (PostgreSQL queries)
  |
Middlewares   -> auth, rate limiting, error handling (cross-cutting)
  |
Workers       -> background jobs (restriction expiry, media processing)
  |
Socket Server -> real-time event handling, separate from REST controllers but shares services
```

## 12. Database Architecture

The database contains: Users, Devices, Contacts, Blocks, Conversations, Conversation Invites, Conversation Participants, Messages, Attachments, Message Statuses, Message Reactions, Message History, Pinned Messages, Calls, Notifications, Reports, Moderation Actions.

> The complete SQL schema, with all constraints, indexes, and migration ordering, is maintained as a separate **Database Design Document (DDD)** — see below — to simplify future database migrations and versioning independently of this architecture document.

## 13. Synchronization Architecture

Offline queue (SQLite) → client-generated UUIDs → server-authoritative `server_created_at` for ordering → idempotent merge via `POST /api/v1/sync/messages` → conflict resolution by timestamp → logical clock → UUID tiebreak.

## 14. Offline-First Strategy

Every write lands in local SQLite first. A sync engine watches connectivity and pushes the pending queue when online; failed pushes retry with backoff. LAN peers receive messages directly via WebRTC DataChannel discovery (mDNS/UDP) independent of server sync.

## 15. Security Architecture

JWT (access + refresh) · Argon2/bcrypt password hashing · TLS everywhere · input validation · parameterized queries (SQL injection prevention) · rate limiting · Helmet (HTTP headers) · CORS policy

## 16. Authentication & Authorization

Registration → email verification → login → JWT issuance → refresh token rotation → device registration on login → logout revokes device-specific token.

## 17. Messaging Architecture

Private & group chat · replies · forwarding · attachments · read receipts · typing indicators · reactions · pinned messages · editing (with history) · soft deletion (with accountability)

## 18. Media Handling

Upload → virus scan → compression → thumbnail generation → checksum → metadata extraction → storage (S3/MinIO) → signed URL → notify recipient

## 19. Notification Architecture

FCM push notifications · local/desktop notifications · background notification handling · payload includes `conversationId`/`messageId` for deep linking

## 20. Presence Management

Redis-backed: online/idle/away/offline state machine, typing indicators, last-seen fallback, heartbeat-based liveness

## 21. Multi-Device Architecture

Device registration & trust · push tokens per device · message fan-out to all active devices · read-state sync across devices

## 22. Moderation Architecture

**Roles:** Admin → Moderator → Member → Guest *(no Owner role — see ADR-011; group deletion rights belong to `conversations.created_by`)*

| Role | Capabilities |
|---|---|
| Admin | Remove members, mute, delete messages, apply restrictions, promote/demote Moderators, change group settings, manage invite links |
| Moderator | Delete other members' messages, apply time-boxed restrictions (Ghost/Suspend), mute members |
| Member | Send messages, upload files, delete own messages |
| Guest | Read-only or limited chat (configurable) |

**Time-Boxed Restrictions:**
- **Ghost Mode** (`is_silent=true`): stays in group, stops receiving new messages, never notified.
- **Temporary Suspension** (`is_silent=false`): blocked from posting, sees a clear "restricted until X" notice.
- Expiry via lazy check + scheduled job (every 1 min); enforced at Socket.IO emit layer and REST query layer, never client-side only.
- All actions logged to `moderation_actions`.

## 23. Reporting System

User reports · message reports · conversation reports → `pending → reviewed → dismissed/actioned` workflow with `resolved_by`/`resolved_at` audit trail.

## 24. Error Handling

Standard HTTP status codes (400/401/403/404/409/422/429/500), consistent JSON error shape (`{ success, error: { code, message } }`), Socket error events mirrored to client, centralized logging.

## 25. Scalability Strategy

Stateless API (horizontal scaling behind load balancer) · Redis for shared session/presence state · connection pooling · background workers for heavy tasks · object storage offloads file I/O from the API · path to microservices if/when scale demands it

## 26. Deployment Architecture

Docker containers (API, PostgreSQL, Redis, MinIO) behind NGINX · docker-compose for local dev · CI/CD pipeline (build/test/deploy) · monitoring (logs, metrics, error tracking)

## 27. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Redis unavailable | Fallback to PostgreSQL for presence reads |
| Internet instability | SQLite queue + retry with backoff |
| Large file uploads | Chunked uploads + resume support |
| Message duplication | Client-generated UUID + idempotent sync |
| Bluetooth/Wi-Fi API differences across OSes | Abstract platform-specific implementations |
| Restriction logic leaking messages to ghosted members | Enforce server-side at emit + query layer; dedicated tests |
| Database failure | Replication |
| Storage failure | Retry with backoff |
| Notification failure | Retry worker |

---

## 28. Project Roadmap

*Ordered by dependency, not fixed calendar time — paced for a solo developer alongside other commitments.*

**Phase 1 — Foundation**
Repo setup, Docker Compose, PostgreSQL + Redis running locally, CI pipeline, database migrations applied, Express server skeleton, Flutter project skeleton, JWT auth foundation.
*Milestone: working local dev environment.*

**Phase 2 — User Management**
Registration, login, logout, JWT + refresh rotation, password hashing, profile management, device registration.
*Milestone: fully functional authentication.*

**Phase 3 — Conversations**
Contacts, direct conversations, group conversations, invites, participant management, roles.
*Milestone: users can create and manage conversations.*

**Phase 4 — Messaging**
Send/receive, edit, delete, replies, reactions, read receipts, typing indicators, pinned messages, offline queue.
*Milestone: real-time messaging platform.*

**Phase 5 — Media & Synchronization**
Image/video/audio/file sharing, compression, thumbnailing, full sync engine, conflict resolution, LAN P2P discovery + WebRTC DataChannel messaging.
*Milestone: reliable offline-first media messaging.*

**Phase 6 — Calls & Notifications**
Voice/video calls (WebRTC), push notifications, presence, last seen.
*Milestone: complete communication experience.*

**Phase 7 — Moderation & Administration**
Reports, Ghost Mode, Suspend, kick, ban, audit logs, basic Admin Dashboard.
*Milestone: moderation system live.*

**Phase 8 — Desktop & Mobile Packaging**
Flutter Desktop build, mobile app store packaging.
*Milestone: apps installable on all target platforms.*

**Phase 9 — Testing & Optimization**
Unit, integration, load, and security testing; performance tuning; bug fixing.
*Milestone: production-ready system.*

**Phase 10 — Deployment**
Production database, Docker deployment, SSL, domain, monitoring, backups.
*Milestone: Chattova v1.0 released.*

**Phase 11 — True Offline Mesh** *(post-v1.0)*
Bluetooth/Wi-Fi Direct mesh via native plugins (mobile only).

---

## 29. Future Enhancements (v2.0+)

Channels & Communities · AI Assistant · Message translation · Polls · Stories · Bots · Business accounts · End-to-end encryption · Screen sharing · Live streaming

## 30. Conclusion

This architecture provides a secure, scalable, offline-first, and modular foundation for Chattova. It supports future growth while maintaining clear separation of concerns; additional features arrive through future versions without requiring a major architectural redesign.

---
---

# Database Design Document (DDD)

## Chattova — Complete SQL Schema (v1.0, Locked)

*17 tables. Migration order below resolves the one circular dependency (`conversation_participants.last_read_message_id` → `messages`) via post-creation `ALTER TABLE`.*

```sql
-- 001_extensions.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 002_users.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    status_message TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_platform_admin BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 003_devices.sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(100),
    platform VARCHAR(20),
    push_token TEXT,
    public_key TEXT,
    app_version VARCHAR(20),
    last_ip VARCHAR(45),
    trusted BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, push_token)
);
CREATE INDEX idx_devices_user_id ON devices(user_id);

-- 004_contacts.sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(100),
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, contact_user_id)
);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);

-- 005_blocks.sql
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (blocker_id, blocked_id)
);

-- 006_conversations.sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'channel', 'community', 'bot')),
    name VARCHAR(100),
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT named_conversation_types CHECK (type = 'direct' OR name IS NOT NULL)
);

-- 007_conversation_invites.sql
CREATE TABLE conversation_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    max_uses INT,
    use_count INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (max_uses IS NULL OR max_uses > 0),
    CHECK (use_count >= 0)
);
CREATE INDEX idx_invites_code ON conversation_invites(code);
CREATE INDEX idx_invites_conversation ON conversation_invites(conversation_id);

-- 008_conversation_participants.sql
CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin','moderator','member','guest')),
    nickname VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','ghosted','suspended','left','removed')),
    restricted_until TIMESTAMP WITH TIME ZONE,
    restricted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    restricted_reason TEXT,
    is_silent BOOLEAN DEFAULT FALSE,
    muted_until TIMESTAMP WITH TIME ZONE,
    joined_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (conversation_id, user_id),
    CHECK (restricted_until IS NULL OR restricted_until >= joined_at)
);
CREATE INDEX idx_conversation_members ON conversation_participants(user_id);
CREATE INDEX idx_participants_restricted ON conversation_participants(restricted_until)
    WHERE restricted_until IS NOT NULL;

-- 009_messages.sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN
        ('text','image','video','audio','voice_note','file','system','location','contact','poll')),
    content TEXT,
    edited BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    server_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, server_created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- 010_add_last_read_message_fk.sql
ALTER TABLE conversation_participants ADD COLUMN last_read_message_id UUID;
ALTER TABLE conversation_participants
ADD CONSTRAINT fk_last_read_message
FOREIGN KEY (last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL;

-- 011_attachments.sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT CHECK (size_bytes >= 0),
    duration_seconds INT CHECK (duration_seconds >= 0),
    width INT,
    height INT,
    checksum VARCHAR(64),
    storage_url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_attachments_message_id ON attachments(message_id);

-- 012_message_statuses.sql
CREATE TABLE message_statuses (
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    received_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (message_id, user_id),
    CONSTRAINT read_after_delivered CHECK (read_at IS NULL OR delivered_at IS NULL OR read_at >= delivered_at)
);
CREATE INDEX idx_status_user ON message_statuses(user_id);

-- 013_message_reactions.sql
CREATE TABLE message_reactions (
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id, user_id, emoji)
);

-- 014_message_history.sql
CREATE TABLE message_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    old_content TEXT,
    edited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_history_message_id ON message_history(message_id);

-- 015_pinned_messages.sql
CREATE TABLE pinned_messages (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    pinned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, message_id)
);

-- 016_calls.sql
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    started_by UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(10) CHECK (type IN ('voice','video')),
    status VARCHAR(20) CHECK (status IN ('ongoing','missed','completed','declined','cancelled','failed')),
    ended_reason VARCHAR(30) CHECK (ended_reason IN
        ('completed','declined','timeout','network_error','cancelled')),
    recording_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    CHECK (ended_at IS NULL OR ended_at >= started_at)
);
CREATE INDEX idx_calls_conversation ON calls(conversation_id);
CREATE INDEX idx_calls_started_by ON calls(started_by);

-- 017_notifications.sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50),
    title VARCHAR(255),
    body TEXT,
    data JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX idx_notifications_data ON notifications USING GIN (data);

-- 018_reports.sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed','actioned')),
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (target_user_id IS NOT NULL OR target_message_id IS NOT NULL OR conversation_id IS NOT NULL)
);
CREATE INDEX idx_reports_status ON reports(status);

-- 019_moderation_actions.sql
CREATE TABLE moderation_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN
        ('ghost','suspend','mute','kick','ban','promote','demote','lifted_early','expired')),
    reason TEXT,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    duration_seconds INT CHECK (duration_seconds >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_moderation_target_user ON moderation_actions(target_user_id);
```

---

**Iyi ni SAD + DDD y'iherezo yasubiwemo izina — Chattova v1.0.** Suggested package/repo identifiers going forward: `com.chattova.app` (Android), `io.chattova.app` or repo `github.com/<you>/chattova`.
