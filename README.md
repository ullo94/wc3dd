# WC3DD

Warcraft III Discord league monorepo: **Next.js site** (`apps/web`, port **3000**) + **discord.js bot** (`apps/bot`) sharing one **Postgres** database (`packages/db`).

Milestone 1: Discord OAuth registration, admin approve/reject, content editors (rules / CoC / downloads), admin sim/testing tools, and bot role/nickname/approval queue.

## Stack

| Piece | Tech |
| --- | --- |
| Monorepo | pnpm + Turborepo |
| Web | Next.js App Router, Auth.js (Discord OAuth), English UI |
| Bot | discord.js, polls `DiscordAction` queue |
| DB | Postgres + Prisma |
| Icons | [aaronjewell/w3-icons](https://github.com/aaronjewell/w3-icons) (hero + starting-building badge) |

## Quick start (local)

```bash
cp .env.example .env
# fill Discord + NEXTAUTH_SECRET + ADMIN_DISCORD_IDS

# Postgres only (dev)
docker compose -f docker-compose.dev.yml up -d

pnpm install
pnpm db:generate
pnpm --filter @wc3dd/db migrate:dev   # first time: creates migration
# or after migrations exist:
pnpm db:migrate
pnpm db:seed

pnpm --filter @wc3dd/shared build
pnpm web   # http://localhost:3000
pnpm bot   # requires DISCORD_BOT_TOKEN
```

### Full stack via Compose

```bash
cp .env.example .env   # set secrets; DATABASE_URL host becomes `postgres` inside Compose
docker compose up --build
```

- Web: `http://localhost:3000`
- Postgres: `localhost:5432`
- Bot: same container network, no public port

## Environment

See [`.env.example`](./.env.example). Everything is env-driven — no hard-coded host paths.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `DATA_DIR` | Portable file root (default `./data`) for Markdown content, maps, replays |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Auth.js |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | OAuth app |
| `ADMIN_DISCORD_IDS` | Comma-separated Discord user IDs |
| `DISCORD_BOT_TOKEN` | Bot token |
| `DISCORD_GUILD_ID` | Target guild |
| `DISCORD_PARTICIPANT_ROLE_ID` | Role assigned on approval |
| `DISCORD_APPROVAL_CHANNEL_ID` | Approval announce channel |
| `DISCORD_INVITE_URL` | Public invite link on the site |

### Discord Developer Portal checklist

1. Create an application → **OAuth2**: add redirect `http://localhost:3000/api/auth/callback/discord` (and production URL later).
2. Scopes used: `identify`, `email`, `guilds.join`.
3. **Bot** tab: create bot, copy token → `DISCORD_BOT_TOKEN`. Enable Server Members Intent.
4. Invite bot with `bot` + `applications.commands` and permissions: Manage Roles, Manage Nicknames, Send Messages.
5. Copy guild ID, participant role ID, approval channel ID into `.env`.
6. Put your Discord user ID in `ADMIN_DISCORD_IDS`.

## Portable data (`DATA_DIR`)

Default: `./data` at the monorepo root.

```
data/
  content/     # rules.md, conduct.md, maps.md — editable on disk or via /admin
  maps/        # future map packs
  replays/     # future .w3g storage
```

Admin content saves write both the Markdown files and the `ContentBlock` DB cache so either path stays in sync.

## Move to SEK_SERVER / `Media\wc3dd`

Built to run anywhere Docker + Node work. On the server:

1. Clone or sync this repo to `\\SEK_SERVER_JEK\Media\wc3dd` (or the Linux path that share maps to, e.g. `/media/wc3dd`).
2. Copy `.env` (or create from `.env.example`) — update `NEXTAUTH_URL`, Discord redirect URL, and secrets.
3. Keep `DATA_DIR=./data` (relative) or set an absolute path under that folder.
4. `docker compose up --build -d`
5. Run migrations/seed once:  
   `docker compose exec web pnpm db:migrate && docker compose exec web pnpm db:seed`  
   (or from the host against exposed Postgres).

No code changes required for the move — only env values.

## Apps

### Web (`apps/web`)

- `/` — home, season status, registration open badge
- `/register` — Discord OAuth + form (two race/hero combos, rules/CoC checkboxes)
- `/rules`, `/conduct`, `/downloads` — Markdown content
- `/admin` — approve/reject, content editors
- `/admin/testing` — sim players, status, fake BO3, advance week, wipe `isSim` data
- Placeholders: `/standings`, `/stats`, `/replays`, `/players/[id]`

Profanity (`profanease`): severe → hard-block; mild/moderate → `needsProfanityReview` for admin.

Combo UI: large hero icon + small round race starting-building badge (Town Hall / Great Hall / Necropolis / Tree of Life).

### Bot (`apps/bot`)

Polls `DiscordAction` for:

- `assign_role`
- `set_nickname`
- `announce_approval`
- `send_invite` (best-effort; notes invite if member not in guild)

`/health` slash command for admins. Sim users never produce Discord traffic.

## Packages

- `packages/db` — Prisma schema, client, seed
- `packages/shared` — races, heroes, validation, W3Champions helpers, default content

## Scripts

```bash
pnpm dev          # turbo dev (all packages that define it)
pnpm build        # turbo build
pnpm db:generate  # prisma generate
pnpm db:migrate   # prisma migrate deploy
pnpm db:seed      # seed season + content + admin IDs
pnpm web          # Next.js :3000
pnpm bot          # Discord bot
```

## Out of scope (later milestones)

Swiss engine, replay `.w3g` parsing, live stats, scheduling notifications, production deploy to WC3DD.online.
