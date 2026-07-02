# Discord Slash-Command Bot Dashboard

Full-stack web app + Discord bot for the Abstrabit assessment: admins connect a server, users run `/report` and `/status`, the backend verifies signed interactions, records activity, replies in Discord, mirrors to a second channel, and shows everything on a realtime dashboard.

## What it does

1. **Admin** registers/logs in and connects their Discord server (bot invite + server/channel IDs + mirror webhook via a guided setup wizard).
2. **Users** run slash commands in Discord.
3. **Discord** POSTs signed interactions to `/api/interactions`.
4. **Backend** verifies Ed25519 signatures, deduplicates by `interactionId`, records the command, replies in-channel, mirrors `/report` to a webhook channel, optionally runs AI triage, and pushes updates over Socket.io.
5. **Dashboard** (login required) shows command logs, analytics, settings, and live updates.

## Assessment coverage

| Core requirement | Status |
|------------------|--------|
| Public interactions endpoint | Deploy backend to Render (or similar) |
| Two slash commands (`/report`, `/status`) | Registered on backend startup |
| Signed interaction handling + PING | `discord-interactions` middleware |
| Bot replies in Discord | Yes |
| Mirror to second channel | Discord webhook (per-admin Settings) |
| Dashboard + command log + config | Yes |
| README + `.env.example` | This file + `backend/.env.example` |

| Stretch goal | Status |
|--------------|--------|
| Configurable rules in UI | Settings toggles per admin |
| AI summarize/triage | OpenAI (optional) |
| Multi-server isolation | Per-admin `guildId` + encrypted config |
| Retries / failure history | Retry queue + webhook logs |
| Buttons / modal | Handlers stubbed; not full UX flow |

## Tech stack

- **Frontend:** React 19, Vite, MUI, React Router, Axios, Socket.io, Zod
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, CSRF, Socket.io, Pino
- **Integrations:** Discord Interactions API, Discord webhooks, OpenAI (optional), Cloudinary (optional avatars)

## Repository layout

```text
frontend/          React dashboard (deploy root: Vercel)
backend/           Express API + Discord bot (deploy root: Render)
render.yaml        Render service definition
.env.example       Points to backend/ and frontend/ env examples
AGENTS.md          Cursor/agent context used during development
AI_NOTES.md        How AI tools were used (required submission doc)
README.md          This file
```

---

## Run locally (step by step)

### Prerequisites

- **Node.js 22+** and npm
- **MongoDB** — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free M0 cluster **or** local MongoDB
- **Discord application** — [Developer Portal](https://discord.com/developers/applications) (free, no card)
- **ngrok** (or similar) — required to test Discord interactions locally (Discord cannot reach `localhost`)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Abstrabit-discord-bot

cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set at minimum:

| Variable | Where to get it |
|----------|-----------------|
| `MONGODB_URI` | Atlas → Connect → connection string |
| `JWT_ACCESS_SECRET` | Random 32+ char string |
| `JWT_REFRESH_SECRET` | Random 32+ char string |
| `CSRF_SECRET` | Random 16+ char string |
| `ENCRYPTION_KEY` | Random 32+ char string |
| `DISCORD_PUBLIC_KEY` | Developer Portal → your app → General |
| `DISCORD_APPLICATION_ID` | Same page (Application ID) |
| `DISCORD_BOT_TOKEN` | Developer Portal → Bot → Reset Token |

Optional: `OPENAI_API_KEY` for AI enrichment. Optional: Cloudinary vars for profile avatars.

**Not in `.env`:** main channel ID, mirror channel ID, and mirror webhook — admins enter these in **Settings** after login (stored encrypted in the database).

### 3. Frontend environment (optional)

```bash
cd frontend
cp .env.example .env
```

For local dev, Vite already proxies `/api` and `/socket.io` to `http://localhost:5000` (see `frontend/vite.config.js`). You can leave `VITE_API_BASE_URL=http://localhost:5000/api` or omit `.env` entirely.

### 4. Start MongoDB

- **Atlas:** allow your IP in Network Access; use the connection string in `MONGODB_URI`.
- **Local:** ensure `mongod` is running if using `mongodb://127.0.0.1:27017/...`.

### 5. Start the backend

```bash
cd backend
npm run dev
```

Backend listens on **http://localhost:5000**. On startup it registers `/report` and `/status` with Discord (if bot credentials are set).

### 6. Expose interactions endpoint (local Discord testing)

In a **second terminal**:

```bash
ngrok http 5000
```

Copy the HTTPS URL (e.g. `https://abc123.ngrok-free.app`).

In **Discord Developer Portal** → your app → **General** → **Interactions Endpoint URL**:

```text
https://abc123.ngrok-free.app/api/interactions
```

Save. Discord sends a PING; the backend must verify the signature (uses `DISCORD_PUBLIC_KEY`).

### 7. Start the frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**.

### 8. First-time dashboard setup

1. **Register** a new admin account (`/register`) or use your test account.
2. **Log in** — if Discord is not connected, a setup wizard opens.
3. Click **Add bot to your server** and complete all steps:
   - Invite the bot
   - Discord Server ID
   - Main Channel ID
   - Mirror Channel ID
   - Mirror Webhook URL (Discord channel → Integrations → Webhooks → New Webhook → Copy URL)
4. Save. Enable **AI** / **Notifications** in Settings as needed.

### 9. Test in Discord

In your server:

```text
/status
/report message:Payment API returning 500 errors
```

**Expected:**

- Bot replies in the channel
- Mirror channel receives a webhook message (if notifications enabled)
- Dashboard **Command Logs** updates in real time (green **Real-time** badge)
- `/report` may show AI summary in log details if `OPENAI_API_KEY` is set

### 10. Verify quality bar (optional)

| Check | How |
|-------|-----|
| Unsigned request rejected | `POST /api/interactions` without Discord headers → 401 |
| Duplicate interaction | Same `interactionId` twice → second request conflict |
| Mirror retry | Temporarily use bad webhook URL → entry in retry queue / failed mirror status |

---

## Environment variables reference

**Backend** — full list in [`backend/.env.example`](backend/.env.example).

**Frontend** — [`frontend/.env.example`](frontend/.env.example).

**Production extras (Vercel backend + separate frontend):**

- `NODE_ENV=production`
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=none`
- `FRONTEND_URL=https://your-frontend.vercel.app` (exact origin, no trailing slash)
- `MONGODB_URI` set in Vercel env (not only in local `.env`)

---

## Deployment

One GitHub repo; **two hosts**.

### Backend — Vercel (current setup)

1. Import repo → **Root Directory:** `backend`
2. Vercel uses `backend/vercel.json` and `backend/index.js` (serverless Express handler).
3. Set all variables from `backend/.env.example` in the Vercel project **Environment Variables**.
4. **MongoDB Atlas → Network Access → allow `0.0.0.0/0`** (fixes `admins.findOne() buffering timed out`).
5. Interactions URL:

```text
https://abstrabit-discord-bot.vercel.app/api/interactions
```

6. Redeploy after changing env vars.

**Check:** open `https://your-backend.vercel.app/health` — `databaseConnected` should be `true`.

### Backend — Render (alternative, better for Socket.io + cron)

1. New **Web Service** → connect repo.
2. **Root Directory:** `backend`
3. **Build:** `npm install`
4. **Start:** `npm start`
5. Set all variables from `backend/.env.example` in Render dashboard.
6. Interactions URL:

```text
https://<your-render-service>.onrender.com/api/interactions
```

Or use [`render.yaml`](render.yaml) as a starting point.

### Frontend — Vercel

1. Import repo → **Root Directory:** `frontend`
2. **Build:** `npm run build`
3. **Output:** `dist`
4. Environment variable (required when API is on a different host):

```text
VITE_API_BASE_URL=https://abstrabit-discord-bot.vercel.app/api
```

Socket.io connects to the same backend host automatically (or set `VITE_SOCKET_URL` explicitly).

5. Update backend `FRONTEND_URL` to your new frontend Vercel URL.

`frontend/vercel.json` rewrites SPA routes for React Router.

### MongoDB Atlas

- Free M0 cluster
- Database user with read/write access
- **Network Access → `0.0.0.0/0`** (required for Vercel/Render dynamic IPs)
- `MONGODB_URI` on your backend host

---

## Troubleshooting production login

| Error | Fix |
|-------|-----|
| `MongooseError: ... buffering timed out` | Atlas IP allowlist `0.0.0.0/0`; confirm `MONGODB_URI` in Vercel env; redeploy |
| `/health` shows `databaseConnected: false` | Same as above |
| Login succeeds but session lost | Set `COOKIE_SAME_SITE=none`, `COOKIE_SECURE=true`, `FRONTEND_URL` = exact frontend URL |
| CORS error in browser | `FRONTEND_URL` must match the site you open (scheme + host) |

---

## For reviewers — how to test

> **Update the live URLs below before submission.**

| Item | Value |
|------|--------|
| **Live dashboard** | `https://YOUR-FRONTEND.vercel.app` |
| **API / interactions** | `https://YOUR-BACKEND.onrender.com/api/interactions` |

**No shared test account is provided.** The app has a public **Register** flow — create your own admin account at `/register`, then log in.

### Steps

1. Open the **live dashboard URL** and **register** a new admin account (`/register`), then log in.
2. Complete **Discord setup** when prompted (or go to Settings → *Add bot to your server*).
3. **Add the bot to your Discord server** via the setup wizard (*Open Discord Invite*).
4. Enter your **Server ID**, **Main Channel ID**, **Mirror Channel ID**, and **Mirror Webhook URL** in the guided steps (see Settings for help text).
5. Run `/status` and `/report message:Reviewer test from Abstrabit` in your server.
6. Confirm:
   - Bot reply in Discord
   - Mirror message in your configured webhook channel
   - New row in **Command Logs** without manual refresh (green **Real-time** badge)
   - **View** on a log row shows full details

Each admin account is isolated to the Discord server they configure — your data and settings are scoped to your own `guildId`.

### Bot invite (optional template)

```text
https://discord.com/api/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=84992&scope=bot%20applications.commands
```

---

## API overview

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/interactions` | Discord signature |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/commands` | Admin JWT |
| `GET` / `PUT` | `/api/settings` | Admin JWT |
| `GET` | `/api/dashboard/summary` | Admin JWT |

Full route list in source under `backend/src/routes/`.

---

## Security notes

- Bot token, public key, webhook URLs, and encryption key are **server-only** — never in the frontend or git.
- Interaction requests: **Ed25519** verification + timestamp replay window.
- **Dedup** on `interactionId`.
- Admin channel/webhook values **encrypted at rest** (AES-256-GCM).
- HttpOnly JWT cookies + CSRF on state-changing API calls.

---

## Scripts

```bash
# Backend
cd backend && npm run dev    # development
cd backend && npm start      # production
cd backend && npm run lint

# Frontend
cd frontend && npm run dev
cd frontend && npm run build
cd frontend && npm run lint
```

---

## Related docs

- [`AI_NOTES.md`](AI_NOTES.md) — AI collaboration (required)
- [`AGENTS.md`](AGENTS.md) — agent/cursor context file
- [`backend/.env.example`](backend/.env.example) — backend secrets template
- [`frontend/.env.example`](frontend/.env.example) — frontend env template

---

## License

Assessment submission — see repository owner for terms.
