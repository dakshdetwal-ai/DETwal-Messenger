# Development Roadmap

## Phase 0 — Decisions and feasibility
- [ ] Confirm Matrix/Synapse deployment model and federation policy.
- [ ] Confirm username mapping and homeserver identity model.
- [ ] Validate web SDK support for multi-device encrypted history transfer.
- [ ] Decide Telegram prototype constraints and storage adapter interface.
- [ ] Define privacy policy, retention, deletion, and account recovery.

## Phase 1 — Foundation
- [ ] Repository conventions, TypeScript tooling, linting, tests, CI.
- [ ] DETwal web shell and responsive layout.
- [ ] Registration request flow.
- [ ] Unique username validation.
- [ ] Owner/admin/member roles.
- [ ] Approval/rejection API and audit log.
- [ ] Secure authentication and session management.

## Phase 2 — Messaging foundation
- [ ] Deploy Matrix Synapse in a development environment.
- [ ] Integrate Matrix JavaScript SDK.
- [ ] Provision approved users.
- [ ] One-to-one rooms and real-time sync.
- [ ] Delivery/read state UX.
- [ ] Verify encryption is enabled and plaintext is not exposed to DETwal services.

## Phase 3 — Device security
- [ ] Per-device identities.
- [ ] Cross-signing and device verification.
- [ ] Encrypted key backup/recovery UX.
- [ ] Secure new-device history transfer.
- [ ] Device list and revocation.
- [ ] Lost-device and lost-recovery-key tests.

## Phase 4 — Groups and media
- [ ] Server-enforced admin-only group creation.
- [ ] Group membership management.
- [ ] Encrypted voice messages.
- [ ] Client-side encrypted file attachments.
- [ ] Replaceable attachment storage adapter.
- [ ] Telegram prototype test (encrypted blobs only), if still justified.

## Phase 5 — ChatGPT administration
- [ ] MCP service with authenticated principals.
- [ ] Registration approval/rejection tools.
- [ ] Group and membership tools.
- [ ] Owner-only administrator management.
- [ ] Suspend user and revoke device tools.
- [ ] Confirmation for destructive actions.
- [ ] Audit log viewer tool.
- [ ] Verify actual ChatGPT plan/workspace support for write-enabled custom MCP.

## Phase 6 — Hardening and beta
- [ ] Automated authorization and abuse tests.
- [ ] Load and reconnect tests.
- [ ] Database/media backup and restore drills.
- [ ] Rate limiting and monitoring.
- [ ] Privacy and incident-response documentation.
- [ ] Independent security review.
- [ ] Invite-only beta with non-sensitive test data.

## Non-goals for v1
- Video calls
- Public channels
- User-created groups
- In-chat bots
- Public federation
- Traditional admin dashboard
