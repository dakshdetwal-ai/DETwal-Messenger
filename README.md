# DETwal Messenger

A private, username-based web messaging platform with end-to-end encrypted conversations and ChatGPT-assisted administration.

> **Status:** Planning / architecture phase. This repository is not production-ready and must not be used for real private communications yet.

## Product decisions

- Web application first
- Unique usernames (no phone number required)
- Registration requests require approval
- Owner and explicitly appointed administrators manage access
- Private one-to-one chats
- Administrator-created private groups only
- Voice messages and file sharing
- No video calls, public channels, in-chat bots, or user-created groups
- End-to-end encryption for messages and media
- Multiple linked devices per account
- Encrypted history transfer to newly linked devices
- ChatGPT integration for administrative commands; no conventional admin dashboard

## Architecture direction

Use a custom DETwal web client with the Matrix ecosystem for messaging and encryption, plus a separate DETwal API for registration, roles, approvals, and policy enforcement.

Telegram is being considered only as an **experimental encrypted-attachment storage adapter**. It is not the source of truth, message database, identity provider, or encryption system. Keep storage behind an adapter so it can be replaced with object storage such as Cloudflare R2.

See:
- [Architecture blueprint](docs/ARCHITECTURE.md)
- [Security requirements](docs/SECURITY.md)
- [Development roadmap](docs/ROADMAP.md)

## Important security status

The design requires independent security review before launch. Do not claim the product is secure or production-ready until encryption, device linking, recovery, access control, metadata handling, backups, and deployment have been tested.

Never commit secrets, access tokens, private keys, recovery keys, real user data, or unencrypted private messages.

## Initial development principles

1. Prefer established, reviewed cryptographic protocols over custom cryptography.
2. Enforce permissions on the server for every administrative action.
3. Treat ChatGPT/MCP as an authorized command interface, not a security boundary.
4. Keep message plaintext and encryption keys inaccessible to DETwal servers and admin integrations.
5. Make every external storage provider replaceable.
6. Build and test incrementally, starting with registration and authorization before messaging.
