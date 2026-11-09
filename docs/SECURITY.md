# Security Requirements and Threat Model

**Status:** Requirements for implementation and review. This document is not a security certification.

## Assets to protect

- User identities and account credentials
- Message plaintext and attachments
- Per-device private keys and cross-signing keys
- Recovery keys and encrypted key backups
- Group membership and administrative privileges
- Sessions, access tokens, and server secrets

## Trust boundaries

1. Browser/device: trusted to hold user plaintext and private keys, subject to endpoint compromise.
2. DETwal API: trusted for identity, authorization, and policy; must not see message plaintext or E2EE keys.
3. Matrix homeserver: transports/stores encrypted events but can observe some metadata.
4. Attachment storage: untrusted for confidentiality; receives encrypted blobs only.
5. ChatGPT/MCP integration: privileged command surface; must never receive conversation content or cryptographic secrets.

## Mandatory controls

- Use maintained, independently reviewed cryptographic implementations; no custom cryptography.
- Require secure device verification and cross-signing.
- Encrypt media on the client before upload.
- Enforce authorization on every server-side operation.
- Use least-privilege service accounts and scoped tokens.
- Protect sessions with secure, HttpOnly, SameSite cookies where applicable; implement CSRF protection.
- Rate-limit registration, login, username lookup, messaging, and admin tools.
- Use generic authentication errors to reduce account enumeration.
- Validate and normalize usernames, file metadata, and all API input.
- Scan untrusted uploads where feasible without decrypting private user content; communicate limitations.
- Keep secrets out of source control, client bundles, logs, analytics, and error reports.
- Audit privileged actions without recording private message contents.
- Support device/session revocation and account suspension.
- Define secure account recovery and explain loss-of-key consequences.
- Apply retention, deletion, backup, and incident-response policies.

## Administrative safeguards

- Owner is the only role allowed to appoint/revoke administrators.
- Admin actions require backend role checks; never trust a ChatGPT instruction alone.
- Destructive actions (delete group, suspend account, revoke device) require explicit confirmation.
- MCP tools expose only necessary metadata and narrowly scoped actions.
- Log actor, action, target, timestamp, result, and request ID; do not log message content or secrets.

## Known limitations to disclose

- E2EE does not hide all metadata such as timing, membership, IP/network information, or server relationships.
- A compromised or unlocked endpoint can expose plaintext.
- Screenshots, forwarding, and recipient copying cannot be fully prevented.
- Revoking a device cannot erase content already copied or decrypted by it.
- Lost recovery keys/trusted devices can cause permanent loss of historical messages.
- Browser-based E2EE has a larger code-delivery trust surface than signed native clients; secure deployment and supply-chain controls are essential.

## Release gates

Do not launch real-user private messaging until:
1. Threat model reviewed.
2. Encryption/device flows tested against supported Matrix SDK versions.
3. Authorization tests cover every privileged endpoint and MCP tool.
4. Backup/restore and device revocation tested.
5. Independent security review completed.
6. Incident response, retention, and account recovery documented.
