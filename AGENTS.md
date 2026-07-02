# Abstrabit Discord Bot Dashboard — Agent Context

This file documents the project conventions used while building with **Cursor Agent**. It is the equivalent of a `.cursorrules` / `AGENTS.md` context file for this repository.

## Project goal

Discord slash-command bot + admin dashboard: verify signed interactions, handle `/report` and `/status`, mirror notifications to a second Discord channel, persist logs, and expose a logged-in dashboard with realtime updates.

## Stack

- **Frontend:** `frontend/` — React 19, Vite, MUI, React Router, Socket.io client, Zod
- **Backend:** `backend/` — Express 5, MongoDB/Mongoose, JWT cookies, CSRF, Socket.io, `discord-interactions`
- **Deploy:** Vercel (frontend root), Render (backend root), MongoDB Atlas

## Local development

Discord interactions go to the **public Render URL** — not `localhost`. For local UI work, set `frontend/.env` to the deployed backend (`VITE_API_BASE_URL` + `VITE_SOCKET_URL` → `https://abstrabit-discord-bot.onrender.com`). See `frontend/.env.example` and README.

## Architecture rules

1. **Discord interactions** must be verified with Ed25519 (`verifyKeyMiddleware`) before JSON body parsers run.
2. **Respond within ~3s** — reply to `/report` immediately, run AI + mirror in background.
3. **Dedup** on `interactionId` before processing.
4. **Per-admin tenancy** — settings and logs scoped by admin `guildId`; channel IDs and mirror webhook encrypted at rest (`ENCRYPTION_KEY`).
5. **No secrets in client** — Discord tokens, webhooks, and encryption keys stay server-side only.
6. **Mirror config** comes from dashboard Settings, not `.env`.

## Code conventions

- ES modules (`import` / `export`) throughout.
- API responses: `{ success, message, data }` via `apiResponse()`.
- Validate request bodies with Zod in `backend/src/validators/`.
- Prefer small focused services under `backend/src/services/`.
- Frontend API calls through `frontend/src/api/` using the shared axios client with CSRF.

## Key paths

| Area | Path |
|------|------|
| App entry | `backend/src/index.js` |
| Interactions | `backend/src/routes/interactionRoutes.js` |
| Interaction handler | `backend/src/controllers/interactionController.js` |
| Settings (per admin) | `backend/src/services/settingsService.js` |
| Mirror + retry | `backend/src/services/mirrorService.js`, `retryQueueService.js` |
| Dashboard UI | `frontend/src/pages/` |
| Discord setup wizard | `frontend/src/components/DiscordServerSetupDialog.jsx` |

## When extending

- New slash commands: register in `discordService.js`, handle in `interactionController.js`, respect per-guild settings.
- New protected routes: `requireAuth` + CSRF on mutating requests.
- Do not log webhook URLs, bot tokens, or decrypted channel IDs.

## AI collaboration note

Planning and requirement mapping were done with ChatGPT; implementation and iteration were done in Cursor with this context. See `AI_NOTES.md` for an honest split of human vs AI work.
