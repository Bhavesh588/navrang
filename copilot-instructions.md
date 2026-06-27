# Navrang Copilot Instructions

This workspace is a JavaScript/TypeScript monorepo with a backend API and Expo mobile apps.

Folders:
- `backend`: Express + Knex + MySQL, JWT auth, notifications, receipts, stock, sales, roles, users.
- `apps/mobile`: Expo React Native app using `expo-router`, React Query, Axios, and shared package `@navrang/core`.
- `apps/smoke-app`: smoke test Expo app.
- `packages/core`: shared utility and component package.

Action guidelines:
- Use exact file paths from this repository.
- Keep responses concise, practical, and code-focused.
- Provide minimal patch-style fixes.
- Ask follow-up questions if the task is not specific enough.
- Do not introduce new dependencies unless requested.
- Include tests or verification steps when applicable.

When helping with features or bugs:
- Identify the relevant layer (backend API, mobile app, shared package).
- Use route and controller patterns already present in `backend/`.
- Use Expo and React Native patterns present in `apps/mobile/`.
- Preserve existing folder structure and shared package references.
