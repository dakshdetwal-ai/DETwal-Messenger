# Architecture

## 1. System overview

1. **Web client:** React + TypeScript; owns the UI and client-side encryption/device state.
2. **Identity and account data:** Supabase Auth + PostgreSQL; stores email identity, username, display name, approval status, roles, and device registry metadata.
3. **DETwal core API:** Rust service; enforces approval, role permissions, group policy, device policy, and controlled Matrix operations. The browser must not be trusted to enforce admin permissions.
4. **Messaging:** Matrix Synapse + Matrix JavaScript SDK; handles message delivery, device identities, sync, and E2EE.
5. **Attachment storage:** Telegram may be tested behind a replaceable storage adapter for opaque client-encrypted blobs only. It is not the message transport or source of truth.
6. **Admin interface:** TypeScript MCP service with narrowly scoped administrative tools; no message-content or key access.

## 2. Logical flow

```text
React + TypeScript browser
  |-- Supabase Auth: sign up, sign in, email verification, reset
  |-- Rust API: authorized account, group and device operations
  |-- Matrix JS SDK: E2EE chat and device verification
  |
Rust DETwal API
  |-- Supabase Postgres/Auth: identity and policy metadata
  |-- Matrix Admin API: tightly scoped server operations
  |-- Telegram storage adapter: encrypted blobs only
  |
Matrix Synapse ---- dedicated Matrix database
  |
MCP admin service ---- Rust API (authorization enforced by Rust)
```

## 3. Current implementation: authentication foundation

The first Supabase migration creates `public.profiles` linked to `auth.users`:
- `username` (unique, lowercase, 3–24 characters)
- `display_name`
- `role`: owner, admin, member (defaults to member)
- `status`: pending, approved, rejected, suspended (defaults to pending)
- avatar URL and timestamps

A database trigger creates a pending profile after Auth signup. Clients cannot insert profiles or change their role/status. RLS restricts profile reads to the profile owner; users can update only display name/avatar. A future Rust service will expose controlled admin lookups and status changes.

The frontend currently includes sign-in, sign-up, forgot/reset password, pending approval, access unavailable, and a protected placeholder app page. It is an early foundation, not a finished chat client.

## 4. Registration and identity

- Users choose a unique DETwal username and register with email/password.
- Supabase email verification should be enabled.
- New registrations start as `pending`.
- Owner/admin approval must happen through a trusted server-side operation.
- Do not expose account enumeration or allow users to set their own roles/status.
- Use short-lived sessions and server-side verification for sensitive operations.

## 5. Roles and group policy

Roles: `owner`, `admin`, `member`.

- Owner appoints and revokes administrators.
- Owner/admin approve or reject registrations and manage groups.
- Members can message approved users and participate in groups they belong to.
- Members cannot create groups.
- Every privileged action is authorized by Rust API and written to an append-only audit log.
- MCP is a command interface, never the authorization boundary.
- Never trust user-editable Auth metadata for authorization.

## 6. Messaging and encryption

Use Matrix E2EE via a maintained Matrix client SDK and supported encryption implementation. Do not design a new cryptographic protocol.

- Verify devices and support cross-signing.
- Use encrypted rooms for private chats and groups.
- Encrypt attachments client-side before upload.
- Keep plaintext message content and encryption keys out of the DETwal API, database, logs, analytics, MCP tools, and storage provider.
- Clearly document metadata that remains visible to the homeserver.
- Test key backup, recovery, device revocation, and history transfer.

## 7. Multi-device history

A new device creates its own cryptographic identity. It must be verified by an existing trusted device or an explicitly designed recovery flow. Encrypted room keys/history are transferred through established Matrix secure device/key-backup mechanisms. Never copy plaintext history through the backend. Recovery-key loss can make historical content unrecoverable; explain this to users.

## 8. ChatGPT / MCP administration

A separate MCP service may expose narrowly scoped tools:
- list pending registration requests (minimal metadata)
- approve/reject registration
- create/delete groups
- add/remove group members
- appoint/revoke admins (owner only)
- suspend/restore accounts
- revoke a device
- inspect administrative audit records

Every tool call must authenticate the acting principal, enforce role checks in Rust API, validate target IDs, support confirmation for destructive actions, be idempotent where possible, and emit an audit record. MCP must not expose message contents, attachment contents, encryption keys, recovery keys, or session secrets.

## 9. Telegram storage experiment

Telegram is not a database, message transport, or cryptographic trust boundary for this product. If evaluated for a prototype:
- upload only client-encrypted blobs;
- store opaque object IDs and integrity metadata in Supabase;
- never store keys or plaintext in Telegram;
- verify current Telegram Bot API limits and applicable terms;
- implement retries, integrity checks, deletion behavior, and migration;
- isolate it behind a storage interface so it can be replaced by R2 or another object store.

Do not assume Telegram offers the availability, privacy guarantees, retention, or streaming performance required for production.

## 10. Deployment and operations

- Keep Matrix Synapse, Rust API, database, and MCP service on private networks where possible.
- Use TLS for all network connections.
- Store secrets in a secret manager/environment injection, never in Git.
- Back up databases and encrypted media metadata; test restoration.
- Monitor uptime, queue depth, failed deliveries, storage errors, and security events without logging plaintext.
- Set retention and deletion policies before launch.
