# Architecture

## 1. System overview

The initial design has five logical layers:

1. **Web client** — custom HTML/CSS/TypeScript UI; owns user-side encryption and local device state.
2. **Matrix client layer** — Matrix JavaScript SDK for room messaging, device identities, encryption, sync, and encrypted media workflows.
3. **DETwal application API** — registration approval, usernames, role checks, group policy, device registry, audit records, and integration with the messaging homeserver.
4. **Messaging homeserver** — self-hosted Matrix Synapse, configured for private federation policy or disabled federation as appropriate to the product's threat model.
5. **Storage** — PostgreSQL for application metadata; replaceable encrypted-media storage adapter. Telegram may be evaluated for a prototype only.

## 2. Logical flow

```text
Browser (DETwal Web)
  |-- DETwal API: registration, approval state, roles, group policy
  |-- Matrix SDK: encrypted messages, device verification, sync
  |
DETwal API (Node.js / TypeScript)
  |-- PostgreSQL
  |-- Matrix Admin API (server-side, tightly scoped)
  |-- MCP admin tools (ChatGPT integration)
  |-- Storage adapter
  |
Matrix Synapse ---- PostgreSQL
  |
Encrypted media storage adapter
```

## 3. Registration and identity

- Users choose a unique DETwal username.
- Registration starts in `pending` state.
- An owner or appointed administrator approves or rejects the request.
- Only approved users receive access to the messaging service.
- Username uniqueness and authorization are enforced server-side.
- Do not expose whether a username exists in ways that enable account enumeration.

## 4. Roles and group policy

Roles: `owner`, `admin`, `member`.

- Owner appoints and revokes administrators.
- Owner and admins can approve registrations and manage groups.
- Members can message approved users and participate in groups they belong to.
- Members cannot create groups.
- Group membership changes are authorized by the DETwal API and reflected in the Matrix room.
- Every privileged action is checked server-side and written to an append-only audit log.
- MCP is a command interface, never the authorization boundary.

## 5. Messaging and encryption

Use Matrix E2EE via a maintained Matrix client SDK and supported encryption implementation. Do not design a new cryptographic protocol.

- Verify devices and support cross-signing.
- Use encrypted rooms for private chats and groups.
- Encrypt attachments client-side before upload.
- Keep plaintext message content and encryption keys out of the DETwal API, database, logs, analytics, MCP tools, and storage provider.
- Clearly document metadata that remains visible to the homeserver.
- Test key backup, recovery, device revocation, and history transfer.

## 6. Multi-device history

A new device creates its own cryptographic identity. It must be verified by an existing trusted device or an explicitly designed recovery flow. Encrypted room keys/history are transferred through the established Matrix secure device/key-backup mechanisms. Never copy plaintext history through the backend. Recovery-key loss can make historical content unrecoverable; explain this to users.

## 7. ChatGPT / MCP administration

A separate MCP service may expose narrowly scoped tools:
- list pending registration requests (minimal metadata)
- approve/reject registration
- create/delete groups
- add/remove group members
- appoint/revoke admins (owner only)
- suspend/restore accounts
- revoke a device
- inspect administrative audit records

Every tool call must authenticate the acting principal, enforce role checks in the API, validate target IDs, support confirmation for destructive actions, be idempotent where possible, and emit an audit record. MCP must not expose message contents, attachment contents, encryption keys, recovery keys, or session secrets.

## 8. Telegram storage experiment

Telegram is not a database, message transport, or cryptographic trust boundary for this product. If evaluated for a prototype:
- upload only client-encrypted blobs;
- store opaque object IDs and integrity metadata in DETwal's database;
- never store keys or plaintext in Telegram;
- verify current Telegram Bot API limits and applicable terms;
- implement retries, integrity checks, deletion behavior, and migration;
- isolate it behind a storage interface so it can be replaced by R2 or another object store.

Do not assume Telegram offers the availability, privacy guarantees, retention, or streaming performance required for production.

## 9. Deployment and operations

- Keep Matrix Synapse, DETwal API, database, and MCP service on private networks where possible.
- Use TLS for all network connections.
- Store secrets in a secret manager/environment injection, never in Git.
- Back up databases and encrypted media metadata; test restoration.
- Monitor uptime, queue depth, failed deliveries, storage errors, and security events without logging plaintext.
- Set retention and deletion policies before launch.
