# Sidewalk Iced Tea — Clone/Similar Game Build Plan

A detailed, step-by-step plan to build a browser game in the style of
**Trà Đá Vỉa hè** (https://trumviahe.com): a chill street-corner iced-tea
shop management/tycoon game with thugs, weather, competitors, and an
expanding sidewalk empire. Fully "vibe-coded" using Claude Code as the
primary agent, with Codex and Gemini as reviewers, and all assets
AI-generated.

---

## Cost Policy (read this first)

**Only one paid tool: Codex (ChatGPT Plus, GPT-5.4) for targeted code
review.** Everything else must use a free tier or a local/open-source
alternative. When a free quota is exhausted, fall back to the local/open
option — never silently upgrade to a paid plan.

| Need | Free choice | Paid fallback (avoid) |
|---|---|---|
| Primary coding agent | **Claude Code** free tier (or local open models via `aider` / `continue.dev` + Llama/Qwen/DeepSeek as backup) | Claude Max |
| Secondary reviewer #1 | **Codex (GPT-5.4)** — *the only paid tool, already covered by ChatGPT Plus* | — |
| Secondary reviewer #2 | **Gemini** — free tier of `gemini-2.5-flash` / `gemini-2.5-pro` via AI Studio API key; Google AI Studio web UI as backup | Vertex AI paid |
| Image generation | **Gemini 2.5 Flash Image** (free tier) → **Flux.1 [schnell]** / **SDXL** local via ComfyUI when quota hits | Imagen paid, Midjourney |
| Background removal | **`rembg`** (local, open-source) | remove.bg paid |
| Upscaling | **Real-ESRGAN** (local) | Topaz |
| Music | **Meta MusicGen** (local via `audiocraft`) or free tier of Suno (limited daily) | Suno/Udio paid |
| SFX | **AudioLDM 2** / **Stable Audio Open** (local) + **Freesound.org** CC0 fallback | ElevenLabs paid |
| TTS (optional) | **Piper TTS** / **Coqui XTTS** (local, multilingual incl. Vietnamese) | ElevenLabs paid |
| Hosting (client) | **Cloudflare Pages** free | — |
| Hosting (server) | **Fly.io** free allowance or **Oracle Cloud Always Free** VM | paid VPS |
| Database | **SQLite** (file, free) | managed Postgres |
| CDN / domain | Cloudflare free tier; domain is the only unavoidable ~$10/yr | — |
| Error tracking | **Sentry** free tier (5k events/mo) | paid |
| CI | **GitHub Actions** free minutes on public repo | — |
| Telegram bot | Telegram Bot API (free) | — |

**Rule of thumb:** if a step below mentions a paid service, treat it as
*not selected* and use the free alternative listed here.

---

## Phase 0 — Preparation

### Step 0.1. Define the game pillars (before any code)
Write a one-page design brief answering:
- **Theme:** Vietnamese sidewalk iced-tea stall, nostalgic, casual, humorous.
- **Core loop:** serve customers → earn coin → upgrade stall → face obstacles (thugs, weather, rivals) → expand territory.
- **Session length:** 3–10 min casual sessions, idle-friendly.
- **Art direction:** flat 2D, warm pastel palette, hand-drawn-looking, evoking Saigon/Hanoi street life.
- **Target platform:** Web (desktop + mobile browsers), PWA-installable.
- **Monetization (optional):** none at MVP; cosmetic/prestige later.

Output: `docs/design/brief.md`.

### Step 0.2. Set up the repo and baseline tooling
```
small_game/
  client/          # React + PixiJS
  server/          # Node.js + SQLite
  assets/          # raw + processed AI-generated assets
  scripts/         # asset generation, build automation
  docs/
    rfc/           # Request-for-Change design debates
    spec/          # approved specs per feature
    plans/         # implementation plans
  .claude/         # CLAUDE.md, plugins, commands
  CLAUDE.md
  GEMINI.md
  AGENTS.md
```
- Initialize Git, add `.gitignore` (node_modules, dist, .env, large binaries).
- Add `package.json` workspaces or use separate `client/` and `server/` packages.
- Install Node LTS, pnpm (or npm), SQLite CLI.

---

## Phase 1 — Research

### Step 1.1. Research free AI asset-generation methods
**Goal:** pick a free + local pipeline for images, sprites, music, SFX.
Paid services are excluded per the Cost Policy.

**Images / Sprites / UI art — free stack**
- **Primary (cloud, free quota):** `gemini-2.5-flash-image` via Google AI Studio free API key — strong style/character consistency via reference images, matches the reference project's pipeline. Free tier rate limits (RPM/RPD) are enough if we run scripts overnight in batches.
- **Fallback (local, unlimited):** **ComfyUI** + **Flux.1 [schnell]** (Apache 2.0) or **SDXL Turbo** on a local GPU. Use **ControlNet** (pose/canny) and **IP-Adapter** for style consistency. If no GPU, run CPU + lower step count (slow but free).
- **Character consistency:** generate one "style sheet" reference, then pass it as `reference_images` to Gemini, or train a small LoRA locally (via `kohya_ss`) from 10–20 approved renders.

Evaluate on: style consistency across a batch, transparent-background support (we post-process with `rembg`), sprite-sheet friendliness, throughput on free quota, license.

**Music (background loops) — free stack**
- **Primary:** **MusicGen Medium** (Meta, MIT-licensed weights) via the `audiocraft` Python package, local. Produces 30–120 s loops from text prompts; we concatenate/crossfade with `ffmpeg` for seamless looping.
- **Fallback:** **Stable Audio Open** (Stability AI, free weights for non-commercial — verify license before shipping commercially; for a personal project it's fine).
- **Avoid:** Suno/Udio paid tiers. Their free tiers are usable for one-off experiments only.

**Sound Effects (SFX) — free stack**
- **Primary:** **AudioLDM 2** (open weights) local — text-to-SFX (pour, ice clink, coin, rain, crowd chatter).
- **Secondary:** **Freesound.org** filtered to CC0 / CC-BY licenses; keep attribution file if CC-BY.
- **Avoid:** ElevenLabs paid SFX.

**Voice lines (optional, ambient chatter) — free stack**
- **Primary:** **Piper TTS** (MIT) — fast, lightweight, has Vietnamese voices.
- **Secondary:** **Coqui XTTS v2** — higher quality, voice cloning from short samples.
- **Avoid:** ElevenLabs paid.

Output: `docs/research/asset-tooling.md` with a decision matrix (quality, speed, free-quota limit, license, setup effort) and a locked stack per asset type. **Default pipeline: Gemini free → local Flux/SDXL fallback for images; MusicGen local for music; AudioLDM 2 + Freesound for SFX; Piper for voice.**

### Step 1.2. Research the gameplay reference
- Play https://trumviahe.com hands-on; take notes on UI layout, upgrade curve, obstacle cadence, monetization (if any), save system.
- Catalogue every distinct screen/scene and every asset type used (background, character sprites, item icons, particle effects, UI widgets, SFX categories, music tracks).
- Output: `docs/research/reference-teardown.md` — scene list, asset inventory, mechanics list.

### Step 1.3. Research the tech stack conventions
Search for current best practices and pin versions:
- React 18+ with Vite.
- PixiJS v8 (latest major — faster WebGPU renderer, different API than v7).
- State management: Zustand (lightweight, plays well with game loops).
- Node.js LTS + Fastify (or Express) + better-sqlite3 (sync, fast, simple).
- Drizzle ORM or Kysely for typed SQL.
- Testing: Vitest (client), Node `--test` or Vitest (server), Playwright (E2E).
- Output: `docs/research/stack-decisions.md`.

---

## Phase 2 — Architecture & First Spec

### Step 2.1. Write the architecture RFC
`docs/rfc/0001-architecture.md` — covers:
- Client/server split: what runs authoritatively server-side (economy, anti-cheat, saves) vs. client-side (rendering, input, animation).
- Communication: REST for CRUD (save/load, leaderboard); WebSocket only if live multiplayer/events are in scope (start without).
- Render loop: PixiJS `Application.ticker` drives rendering; game logic on a fixed 30 Hz tick separate from render. React renders only HUD/menus; PixiJS canvas mounted once and never re-rendered by React.
- State separation: `RenderState` (sprites, animations) vs. `LogicState` (pure data: coin, stock, customers, weather). Logic state is serializable for save/load.
- Save system: autosave every N seconds to server; localStorage mirror for offline tolerance.
- Folder structure, coding conventions, error-handling policy.

Have Claude spawn 2–3 sub-agents to debate it; resolve comments; get Codex and Gemini reviews before approval.

### Step 2.2. Write the data model spec
`docs/spec/0001-data-model.md` — SQLite schema:
- `players(id, created_at, last_seen_at, display_name)`
- `saves(player_id PK, state_json, version, updated_at)`
- `events(id, player_id, type, payload_json, created_at)` (for audit/telemetry)
- `leaderboard(player_id, score, period)` (optional)
Include migration strategy.

### Step 2.3. Write the MVP gameplay spec
`docs/spec/0002-mvp-loop.md` — minimum playable:
- One stall, one product (iced tea), one customer type.
- Click-to-serve, earn coin, buy one upgrade (faster serve).
- Single obstacle: rain (halves customer spawn) with umbrella upgrade.
- Save/load from server.
Acceptance criteria and edge cases (empty stock, offline, tab backgrounded).

---

## Phase 3 — Asset Generation Pipeline

### Step 3.1. Build the asset script scaffold (all free tools)
`scripts/gen/` with:
- `gen-image.ts` — primary path calls **Gemini free-tier** image API with a prompt template + style-guide ref image; on quota error, falls back to a local **ComfyUI** HTTP endpoint running Flux.1/SDXL. Saves PNG with a deterministic filename from a seed.
- `gen-music.ts` — spawns a local Python subprocess running **MusicGen** (`audiocraft`); saves OGG via ffmpeg.
- `gen-sfx.ts` — spawns local **AudioLDM 2** for generated SFX; pulls CC0 clips from **Freesound** API (free key) for anything it can't synthesize.
- `gen-voice.ts` — local **Piper TTS** CLI for Vietnamese/English ambient lines.
- `manifest.json` per category — source of truth; script is idempotent (skip if output exists unless `--force`). Track the backend used per asset for reproducibility.
- `post/` — all free/local post-processing: transparent-bg cleanup with **`rembg`** (local), resize via **sharp**, sprite-sheet packing with **`free-tex-packer-cli`** (free, open-source), audio normalization via **ffmpeg** `-af loudnorm`, upscale via **Real-ESRGAN** CLI if needed.
- Add a `--budget` flag that caps daily Gemini calls and forces local fallback after the cap.

### Step 3.2. Lock the style guide
Before batch generation, produce ~10 reference images and pin the winning prompt prefix/suffix in `assets/STYLE.md`. All future prompts inherit it to keep style consistent across hundreds of assets. Include:
- Color palette (hex values).
- Line weight, shading style, perspective.
- Negative prompts (no text, no watermark, no 3D).

### Step 3.3. Generate the MVP asset set
Per the reference teardown (Step 1.2), generate:
- 1 background (street corner, day/evening variants).
- 3–5 customer character sprites + walk animations (or generate turnarounds then rig in code).
- Stall sprite + upgrade variants.
- UI icons (coin, tea, ice, umbrella, settings).
- 1 background music loop.
- SFX: pour, ice clink, coin, rain start/loop, customer greeting.

Gate: assets reviewed and approved before being imported to `client/public/assets/`.

---

## Phase 4 — MVP Implementation

### Step 4.1. Scaffold the client
- `pnpm create vite client --template react-ts`.
- Add PixiJS v8, Zustand, React Router (if multiple screens).
- Create `PixiStage` component that creates the Pixi Application once and exposes a scene manager.
- Implement scenes: `BootScene` (asset load + progress bar), `MainScene` (stall + customers), `MenuOverlay` (React HUD).

### Step 4.2. Scaffold the server
- `server/` with Fastify, better-sqlite3, Drizzle.
- Endpoints: `POST /auth/guest` (create anon player), `GET /save`, `PUT /save`, `POST /event`.
- Rate limiting, input validation (zod), CORS locked to client origin.

### Step 4.3. Implement MVP loop per spec
- Fixed-timestep logic tick (`setInterval` or `requestAnimationFrame` with accumulator).
- Customer spawner, serve action, coin counter, upgrade purchase.
- Rain weather state + sprite overlay; umbrella upgrade flag.
- Autosave every 10 s; load on boot.

### Step 4.4. Test
- Unit: economy math, spawner probabilities, save/load round-trip.
- Integration: client boots, plays 60 s, saves, reloads, state preserved.
- Playwright smoke: open page, start game, earn coin, buy upgrade.

---

## Phase 5 — AI-Assisted Development Workflow

### Step 5.1. Author the agent guide files
- `CLAUDE.md` — orchestration rules, "surgical edit only" mandate (no full-file rewrites), spec-consistency mandate (update spec whenever behavior changes), review-loop instructions.
- `GEMINI.md` — review rubric for Gemini: correctness, performance, readability, spec alignment, security.
- `AGENTS.md` — shared conventions for any agent: commit style, file layout, testing expectations.

### Step 5.2. Wire up review commands (Codex paid, Gemini free)
- Install the Codex plugin for Claude → exposes `/codex:review`. **This is the one paid path** — runs on ChatGPT Plus GPT-5.4. Use sparingly: one pass per artifact, on the final draft only.
- Create a custom Gemini plugin in `.claude/` that wraps the free `gemini` CLI (`gemini -p "<prompt>"` using a free AI Studio API key) → exposes `/gemini:review`. Gemini carries the review volume because it's free.
- Define the pipeline Claude runs per artifact:
  1. Spawn 2–3 Claude sub-agents for internal review rounds; Claude applies fixes. (Free — same Claude session.)
  2. Run `/gemini:review` ~5 times; apply fixes each round. (Free tier.)
  3. Run `/codex:review` **once, on the final draft**; apply fixes. (Paid — budget-gated.)
  4. Re-run tests; commit.
- Add a soft guard: script checks Gemini free-tier quota before calling; if exhausted, pause and notify via the Telegram bot (Step 7.1) rather than failing.

### Step 5.3. Feature-development loop (for every new feature)
1. **RFC** (only for complex features) — design debate, trade-offs, decision.
2. **Spec** — functional requirements, edge cases, acceptance criteria.
3. **Implementation plan** — file-by-file change list.
4. **Tests first** — write failing tests against the spec.
5. **Implementation** — surgical edits.
6. **Multi-round review** — per Step 5.2.
7. **Merge** — only when tests pass and reviews are clean.

---

## Phase 6 — Expanding Gameplay (Post-MVP)

Iterate one feature at a time, each through the full Phase 5 loop.

### Step 6.1. Thugs system
Random thug events that demand "protection money"; player can negotiate, pay, or call the ward police (cooldown). New assets: thug sprites, confrontation SFX, tension music stinger.

### Step 6.2. Weather system
Sun/cloud/rain/storm cycle with gameplay effects on customer flow and item demand (hot day = more ice needed, stock management). New assets: weather overlays, ambient loops.

### Step 6.3. Competitor stalls
Rival AI stalls appear nearby; price wars, customer poaching, sabotage events. New assets: rival stall sprites, rival character portraits.

### Step 6.4. Expansion / prestige
Unlock new corners of the sidewalk → new biomes (alley, market, bus stop). New assets per biome.

### Step 6.5. Menu expansion
Additional products (kumquat tea, pandan drink, sunflower seeds) with prep-time mini-mechanics.

### Step 6.6. Meta-progression
Daily goals, achievements, cosmetic unlocks.

---

## Phase 7 — Automation & Remote Control

### Step 7.1. Telegram bot
`scripts/bot/` — a small Node.js bot that:
- Subscribes to Claude's progress events (via a local HTTP webhook Claude posts to, or by tailing a log file).
- Pushes status updates ("spec approved", "gemini review round 3/5", "tests passing").
- Accepts commands: `/commit <msg>`, `/status`, `/run-review`, `/pause`.
- Auth: single-user chat-ID allowlist.

### Step 7.2. Full-pipeline runner
A single script `pnpm run feature "<name>"` that, given a feature folder with a stub spec, drives Claude through the entire pipeline (spec → tests → code → reviews → commit) end-to-end — the "~1-hour iced-tea break" workflow.

---

## Phase 8 — Deployment

### Step 8.1. Hosting (free)
- Client: static build on **Cloudflare Pages** free plan (unlimited bandwidth).
- Server: **Fly.io** free allowance (shared-cpu-1x, 256 MB, 1 GB volume) OR **Oracle Cloud Always Free** VM (4 ARM cores, 24 GB RAM — generous) running Node + SQLite on a persistent volume.
- Domain: the only unavoidable cost (~$10/yr). HTTPS via Cloudflare free tier.

### Step 8.2. Observability (free)
- Server: **pino** logs to stdout, simple `/healthz`, basic request metrics.
- Client: **Sentry** free tier (5k events/mo) for error tracking.
- Game analytics: custom `POST /event` endpoint → SQLite; periodic dump to CSV. No paid analytics service.

### Step 8.3. Backups (free)
- SQLite nightly dump to **Cloudflare R2** free tier (10 GB storage, 1M ops/mo) or **Backblaze B2** free tier (10 GB). Cron job on the server.
- Save-file version field to allow safe schema migrations.

### Step 8.4. Launch checklist
- Privacy policy page (even for guest accounts).
- Mobile tap targets verified.
- PWA manifest + offline-safe boot (cached shell + last save from localStorage).
- Share card (OG image, Twitter card) — another AI-generated asset.

---

## Phase 9 — Constraints & Guardrails (enforced throughout)

- **Spec-first, always.** No code without an approved spec (or for trivial changes, a one-line spec note).
- **Surgical edits only.** Agents must not rewrite whole files; changes are diffs.
- **Tests before implementation.** Every feature merges with tests proving the acceptance criteria.
- **Multi-model review** for every artifact (RFC, spec, plan, code): Claude sub-agents → Codex → Gemini.
- **Budget awareness — free-only except Codex.** Every dependency must be free-tier or local/open-source. Codex (GPT-5.4 via ChatGPT Plus) is the **only paid tool** and runs once per artifact on the final draft. Gemini free tier carries the review volume. On quota exhaustion, fall back to local models — never upgrade to a paid plan silently.
- **No unnecessary plugins/MCPs.** Only the Codex plugin and the custom Gemini plugin — keep the agent surface small.
- **Spec must stay in sync** with shipped behavior; drift is a review-blocker.

---

## Deliverables Summary

By the end of this plan:
- A playable browser game at a custom domain, similar in feel to trumviahe.com.
- All art/audio AI-generated via a reproducible script pipeline.
- A documented spec/RFC trail for every feature.
- A multi-model review pipeline that runs inside Claude Code with minimal human intervention.
- A Telegram bot for remote monitoring/control during long pipeline runs.
