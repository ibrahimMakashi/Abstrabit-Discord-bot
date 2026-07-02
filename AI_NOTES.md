# AI Notes

## Tools and how we split the work

| Phase | Tool | My role | AI role |
|-------|------|---------|---------|
| Requirements & plan | **ChatGPT** | Broke down the assessment, chose stack, sketched data flow and security bar | Helped compare options (HTTP interactions vs gateway bot, defer vs immediate reply, MongoDB vs Postgres) |
| Implementation | **Cursor Agent** | Reviewed diffs, tested Discord/ngrok flows, rejected wrong patterns, decided per-admin isolation + encryption | Generated boilerplate, wired routes/services/UI, suggested fixes |
| Debugging | **Both** | Reproduced failures in browser/Discord, read logs, validated against Discord docs | Proposed patches; I verified each one actually fixed the issue |

Rough split: **~40% me** (architecture, integration testing, security choices, UX decisions), **~60% AI** (scaffolding and repetitive code). I did not paste AI output blindly — every integration point (cookies, CSRF, Ed25519, webhooks) was tested manually.

**Context files used:** `AGENTS.md` (this repo). No separate `.cursorrules` file — Cursor picked up project structure from the codebase and chat.

---

## Three decisions I made myself

### 1. HTTP interactions + immediate reply, slow work in background

Discord’s ~3s window means we cannot run AI + mirror inside the interaction handler. I chose to **reply to `/report` right away** with the submitted text, then **`queueReportProcessing`** for AI enrichment and webhook mirroring. Alternative was Discord “deferred” + follow-up message; I preferred a single clear reply users see instantly.

### 2. Per-admin server config with encrypted secrets

The assessment allows multi-server stretch. I scoped **each admin to one `guildId`** with their own main channel, mirror channel, and webhook in Settings — **AES-256-GCM at rest** with `ENCRYPTION_KEY`. Global `.env` mirror URLs would not scale for multiple reviewers/admins on one deployment.

### 3. MongoDB Atlas + Render/Vercel monorepo

Free-tier **MongoDB Atlas** (no card on M0), **Render** for the always-on interactions backend, **Vercel** for the SPA. Single GitHub repo with `frontend/` and `backend/` roots so each host deploys independently.

---

## Hardest wrong turn (AI-led) and how I fixed it

**Problem:** Avatar upload (and other PUT requests) failed with `ForbiddenError: invalid csrf token`.

**What AI did wrong:** Early setup generated CSRF tokens using `req.user.id`, but the CSRF middleware ran **before** auth on some routes, so the session identifier did not match on validation.

**How I noticed:** Upload worked in isolation but failed from the profile page; browser showed 403 on `PUT /api/profile`. I compared the CSRF `getSessionIdentifier` in `app.js` with when `req.user` is populated.

**Fix:** Use a **consistent session id** from cookies (`accessToken` / `refreshToken` / `anonymous`) for both token generation and validation, not `req.user.id`. After that, CSRF matched across authenticated requests.

---

## What I’d improve with more time

1. **Guild-scoped slash command registration** — hide disabled commands in Discord UI, not only at runtime.
2. **Real `/report` modal** — stretch goal handler stubs exist; wire a modal submit flow end-to-end.
3. **Socket rooms per `guildId`** — today broadcasts are global; filter realtime events per admin server.
4. **Free-tier LLM** — swap OpenAI for Groq/Gemini to match the assessment’s no-card AI suggestion.
5. **Submission hardening** — document self-service registration for reviewers in README (no shared credentials).

---

## Short prompt excerpt (CSRF debugging)

> “Avatar upload returns invalid csrf token. Check whether CSRF session identifier is the same when the token is created vs when profile PUT validates it. Auth middleware order matters.”

That prompt led to the cookie-based session id fix above — a reminder that **integration bugs need runtime evidence**, not just generated code.

---

## Product AI feature (runtime)

`/report` text can be enriched with OpenAI (`summary`, `category`, `priority`) when enabled in Settings. Failures are stored in `Command.aiError`; the command pipeline still completes and mirrors independently of AI success.
