# DETwal Messenger

A username-based web messaging platform designed around end-to-end encrypted private conversations.

> **Status:** Early development. Authentication and registration approval foundation are in place; messaging and E2EE are not implemented yet. Do not use this build for sensitive or real private communications.

## Current stack

- **Frontend:** React + TypeScript + Vite
- **Identity and user data:** Supabase Auth + PostgreSQL
- **Authorization:** Postgres Row Level Security (RLS), with server-side role checks planned
- **Backend direction:** Rust application API for policy enforcement and Matrix integration
- **Messaging direction:** Matrix Synapse + Matrix JavaScript SDK
- **Encrypted attachment storage:** Telegram adapter experiment; only client-encrypted blobs, never plaintext or keys

## Current pages

- `/#/login` — email/password sign-in
- `/#/signup` — registration request with unique username
- `/#/forgot-password` — password reset email
- `/#/reset-password` — choose a new password
- `/#/pending` — waiting for administrator approval
- `/#/app` — protected placeholder for approved accounts

New users start with `status = 'pending'`. The database trigger creates their profile from signup metadata. Users cannot set their own role or approval status. Profile rows are readable only by their owner; only display name and avatar URL are user-editable.

## Supabase setup

Project: **DETwal Messenger**  
Project reference: `arrkwwhngloprfschqdy`  
Dashboard: https://supabase.com/dashboard/project/arrkwwhngloprfschqdy

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` to the project URL.
3. Set `VITE_SUPABASE_PUBLISHABLE_KEY` to the project's publishable key (never use a secret/service-role key in the browser).
4. Configure Supabase Auth email confirmation and the allowed redirect URLs for local development and the deployed site.
5. Apply the SQL migration in `supabase/migrations/` if setting up a fresh database. It has already been applied to the project above.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Before deploying with GitHub Actions, add these repository Actions secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Then enable GitHub Pages with **GitHub Actions** as the build/deployment source. The workflow is in `.github/workflows/deploy.yml`.

## Important security notes

- The repository is public. Never commit secrets, access tokens, service-role keys, private keys, recovery keys, real user data, or unencrypted messages.
- A Supabase publishable key is intended for client use; RLS is mandatory and is not optional.
- The initial UI is not a substitute for server-side authorization. Admin approvals, role changes, device management, and group creation must be enforced by a trusted backend.
- Do not make the first account an owner through client-supplied signup metadata. Owner bootstrap must be a deliberate, server-side operation.
- No Matrix messaging, E2EE, device linking, Telegram storage, or Rust API is active yet.
- Obtain independent security review before production launch.

## Product decisions

- Web first; unique usernames; email verification
- Registration requests require owner/admin approval
- Owner appoints/revokes admins
- Private one-to-one chats and admin-created private groups
- Voice messages and file sharing
- No video calls, public channels, in-chat bots, or member-created groups
- E2EE for messages and media; multiple linked devices with secure history transfer
- ChatGPT/MCP can administer narrowly scoped actions, but cannot read private messages or encryption keys
