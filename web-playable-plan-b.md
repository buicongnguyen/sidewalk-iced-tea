# Web-Playable Plan B

## Purpose

Plan B is the browser-first fallback path for this project.

We use it when:

- AI asset generation is blocked, slow, or inconsistent
- the server is not ready yet
- we want a playable prototype on the web as early as possible

The goal is not "cheap temporary mode". The goal is:

- playable on desktop and mobile browsers
- installable as a PWA
- offline-tolerant after the first successful load
- compatible with later AI-generated assets without rewriting game logic

## What changed after the logic review

I checked the original plan and tightened a few places where the MVP rules were underspecified.

### Logic issue 1: stock existed as an edge case but not as a mechanic

The original MVP mentions `empty stock` as an edge case, but there is no refill or restock mechanic in the MVP spec.

Plan B fix:

- remove stock depletion from the playable fallback MVP
- treat tea supply as infinite in Plan B MVP
- postpone stock and refill logic to a later feature pass

This keeps the MVP coherent and avoids a dead-end state with no recovery action.

### Logic issue 2: the number of upgrades was ambiguous

The original MVP says there is one upgrade (`faster serve`) but also mentions an `umbrella upgrade`.

Plan B fix:

- the browser-first MVP has exactly two upgrades
- upgrade 1: `faster_serve`
- upgrade 2: `umbrella`

This keeps rain meaningful without forcing a larger economy system.

### Logic issue 3: hidden tabs would distort timing

Modern browsers throttle timers in background tabs, and many stop `requestAnimationFrame()` callbacks for hidden tabs.

Plan B fix:

- never trust raw wall-clock time inside the live simulation loop
- pause the active simulation when hidden
- on resume, run a capped catch-up simulation
- if the app was hidden too long, apply condensed idle gains instead of replaying every second

### Logic issue 4: server-save was too central for a web-first fallback

The original MVP assumes server save/load. That is fine for the main plan, but it weakens the browser fallback.

Plan B fix:

- local-first save is the default
- server sync becomes optional and later
- the app stays playable with no backend

## Web references used to refine this plan

These references are current as of April 19, 2026.

Direct crawl of `https://trumviahe.com` returned no crawlable static text in this environment, so the gameplay refinements below are an inference from the original `Plan.md` plus the browser and engine references listed here.

- MDN says installable PWAs need a manifest, and Chromium browsers require members such as `name` or `short_name`, `icons`, `start_url`, and `display` or `display_override`: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- MDN says service workers enable cached assets and offline-first behavior: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
- web.dev recommends an explicit offline fallback page so the app still gives the player "something" when offline: https://web.dev/articles/offline-fallback-page
- web.dev says Cache Storage is for network resources and IndexedDB is for structured data: https://web.dev/learn/pwa/offline-data/
- MDN says `localStorage` is synchronous and can block the UI, so it should stay small: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
- MDN says the Page Visibility API is the correct way to react to hidden/visible state, and notes that background tabs commonly stop `requestAnimationFrame()` and throttle timers: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
- MDN's game-loop overview explains that browser games should attach to `requestAnimationFrame()` rather than trying to replace the browser's own loop: https://developer.mozilla.org/en-US/docs/Games/Anatomy
- PixiJS v8 supports `.svg` assets and manifest-based asset loading through `Assets.load()` and `Assets.init({ manifest })`: https://pixijs.com/8.x/guides/components/assets
- PixiJS supports background bundle loading: https://pixijs.com/8.x/guides/components/assets/background-loader
- PixiJS v8.16 added automatic Canvas fallback when WebGL or WebGPU is unavailable: https://pixijs.com/blog/8.16.0
- MDN notes that web-game audio should begin from a user-initiated event such as a tap or click: https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio_for_Web_Games

## Plan B product scope

This is the refined browser-first scope.

### Player-facing scope

- one playable screen
- one stall
- one customer lane
- one core action: serve tea
- two upgrades: faster serve and umbrella
- one weather event: rain
- local save and resume
- PWA install support
- offline shell after first successful load

### Explicitly out of scope for Plan B MVP

- server auth
- leaderboards
- stock depletion
- multi-product menu
- thug events
- competitors
- prestige
- remote review or Telegram automation

## Core design rules

- Keep one stable asset ID registry from day one.
- Separate game logic state from render state.
- Let the browser own the frame loop.
- Keep saves small, versioned, and recoverable.
- Make placeholders feel intentional, not broken.
- Build for replacement: every placeholder asset must be swappable with a later AI-generated asset.

## Recommended browser stack

- `React + Vite` for shell, menus, install UI, and settings
- `PixiJS v8` for the playfield
- `@pixi/assets` manifest bundles for placeholders and final assets
- `IndexedDB` for save slots and structured local state
- `localStorage` only for tiny synchronous values such as mute, last-used slot ID, and simple flags
- `Service Worker + Cache Storage` for shell files and placeholder assets

## Refined gameplay logic

This section is the game logic Plan B should actually implement.

The tuning numbers below are proposed values, inferred from the original plan and adjusted for a short web-playable session. They are a starting point, not final balance.

### Core loop

1. Customers appear over time.
2. The player taps or clicks to serve the front customer.
3. Serving grants coins after a short action time.
4. Coins buy upgrades.
5. Rain periodically reduces customer flow.
6. The umbrella reduces the rain penalty.
7. Progress auto-saves and resumes later.

### State model

The minimum serializable logic state should be:

- `version`
- `coins`
- `total_served`
- `serve_level`
- `umbrella_owned`
- `weather_state`
- `weather_ends_at`
- `queue_size`
- `last_saved_at`
- `last_simulated_at`
- `session_started_at`
- `audio_unlocked`

### Customer rules

- base spawn interval: `6.0s`
- spawn interval variance: `+/- 1.5s`
- queue cap: `4`
- if the queue is full, new customers are dropped
- customers do not leave the queue in Plan B MVP

Why this is coherent:

- the player is not punished by unseen patience timers yet
- queue logic stays simple enough for a first web prototype
- later features can add patience, leaving, and priority customers

### Serve rules

- base serve time: `2.5s`
- faster serve upgrade serve time: `1.5s`
- reward per served customer: `1 coin`
- serving is disabled while a serve is already in progress

Why this is coherent:

- there is always one readable main action
- serve speed is a meaningful first upgrade
- queue pressure naturally appears without complex AI

### Upgrade rules

- `faster_serve`
- cost: `10 coins`
- effect: reduce serve time from `2.5s` to `1.5s`

- `umbrella`
- cost: `20 coins`
- effect: reduces rain spawn penalty

Why this is coherent:

- the first upgrade improves the main action
- the second upgrade counters the only environmental hazard
- there is no upgrade tree or dependency complexity

### Weather rules

- weather starts as `clear`
- every `45s` to `75s`, roll for a rain event
- rain duration: `20s`
- clear weather spawn multiplier: `1.0`
- rain spawn multiplier without umbrella: `0.5`
- rain spawn multiplier with umbrella: `0.8`

Why this is coherent:

- rain matters, but it does not stop the game
- umbrella is useful without being mandatory too early
- weather changes are infrequent enough to read on mobile

### Session rules

- target active session: `3` to `10` minutes
- no fail state in the MVP
- the session is about steady improvement, not survival

Why this is coherent:

- this matches the original casual/idle-friendly positioning
- removing fail states reduces friction for early testing

## Hidden-tab and offline logic

This is the most important browser-specific refinement.

### Live loop rule

- run render and active logic from `requestAnimationFrame()`
- keep logic on a fixed-step accumulator, for example `100ms` or `200ms`
- clamp per-frame delta so one long frame does not explode the simulation

### Hidden tab rule

When the page becomes hidden:

- stop interactive timers and visual-only animation
- store a timestamp immediately
- flush a save immediately

When the page becomes visible again:

- measure elapsed real time
- if elapsed time is small, simulate catch-up in fixed steps
- if elapsed time is large, skip full replay and apply condensed offline earnings

Recommended thresholds:

- catch-up simulation cap: `30s`
- condensed offline earnings window cap: `10 minutes`
- condensed offline efficiency: `25%` of normal clear-weather earnings

Why this is coherent:

- MDN notes that browsers may stop `requestAnimationFrame()` and throttle timers in background tabs
- a capped catch-up prevents long resume stalls
- a condensed formula prevents cheating by leaving the tab hidden for hours

## Save and resume model

### Storage choice

Use:

- `Cache Storage` for HTML, JS, CSS, images, audio, and other network resources
- `IndexedDB` for game saves and structured data
- `localStorage` only for tiny flags and last-used settings

This follows current PWA guidance:

- web.dev recommends Cache Storage for URL-addressed resources
- web.dev recommends IndexedDB for structured offline data
- MDN warns that `localStorage` is synchronous

### Save policy

- auto-save every `10s`
- auto-save on `visibilitychange`
- auto-save on upgrade purchase
- auto-save on pause/settings close

### Save format rules

- version every save
- store only serializable logic state
- never store active Pixi display objects in save data
- validate defaults during load
- if load fails, fall back to a clean new save and keep the broken save as a recovery record

## Asset strategy for Plan B

Plan B should not wait for final art.

### Asset pack structure

Create two interchangeable packs:

- `placeholder-pack`
- `final-pack`

Both packs must expose the same asset IDs.

Example IDs:

- `bg_street_corner_day`
- `stall_base`
- `customer_student_idle`
- `icon_coin`
- `icon_umbrella`
- `music_corner_loop`
- `sfx_pour_tea`

### Placeholder asset formats

- SVG for icons and most character or prop silhouettes
- CSS gradients or SVG for backgrounds
- Pixi `Graphics` primitives for rain, glow, and small effects
- optional tiny PNGs only where SVG is awkward

Why this is coherent:

- PixiJS supports `.svg` loading through `Assets`
- placeholders stay lightweight and editable
- final PNGs can replace them later without logic changes

### Loading strategy

- bundle `boot-shell` assets for immediate load
- bundle `main-game-placeholder` assets for the first playable scene
- background-load future or optional assets after the first frame

This maps well to PixiJS manifest bundles and background loading.

## Detailed implementation steps

Each step below includes both the action and the logic reason behind it.

### Step B1. Freeze the fallback scope

Do:

- write a one-page Plan B scope note
- list what is in and out
- lock the MVP around one screen, one action, one hazard, two upgrades

Logic check:

- if a feature requires a backend, it is not part of Plan B MVP
- if a feature requires more than one new UI screen, defer it

Deliverable:

- `docs/spec/plan-b-mvp.md`

### Step B2. Build the asset registry first

Do:

- define a single manifest of asset IDs and paths
- point the registry to placeholder assets first
- keep the IDs stable for later AI asset replacement

Logic check:

- scene code should never care whether an asset is placeholder or final

Deliverable:

- `assets/manifest/*.json`

### Step B3. Create a placeholder pack

Do:

- make SVG placeholders for the stall, customer, and icons
- use CSS or SVG for backgrounds
- use Pixi `Graphics` for rain and simple effects

Logic check:

- every placeholder should match the final planned bounding box and anchor expectations

Deliverable:

- `client/public/assets/placeholder/*`

### Step B4. Build the PWA shell

Do:

- add `manifest.webmanifest`
- add icons
- register a service worker
- pre-cache app shell files
- add a custom offline fallback page

Logic check:

- after one successful online load, the shell must still open without a network
- if the server is down, the player should still see a controlled offline experience

Deliverable:

- installable browser build with an offline shell

### Step B5. Implement local-first save

Do:

- create an IndexedDB save store
- store one active save slot
- keep a tiny `localStorage` pointer to the active slot and basic user preferences

Logic check:

- save data must be readable without a server
- save migration must be versioned from day one

Deliverable:

- local save/load working on desktop and mobile

### Step B6. Implement the fixed-step game loop

Do:

- use `requestAnimationFrame()` for frame scheduling
- run logic updates at a fixed step
- separate `updateLogic()` from `renderFrame()`

Logic check:

- weather, spawn timing, and serving must not depend on render FPS
- resuming after a lag spike should not simulate an absurd number of frames

Deliverable:

- stable play behavior across devices

### Step B7. Implement the gameplay state machine

Do:

- define states such as `boot`, `loading`, `ready`, `serving`, `paused`, `offline`
- disable illegal actions in each state

Logic check:

- the player cannot buy the same upgrade twice
- the player cannot start a second serve while one is already running
- queue count cannot go negative or exceed cap

Deliverable:

- deterministic core interaction flow

### Step B8. Handle hidden-tab and offline resume

Do:

- listen to `visibilitychange`
- save immediately when hidden
- run capped catch-up or condensed idle reward on return

Logic check:

- returning after a background tab should feel fair, not explosive
- resume should be fast even after minutes away

Deliverable:

- no broken timers after tab switching or phone lock/unlock

### Step B9. Add audio unlock behavior

Do:

- load audio early
- only start playback after a tap or click on the title screen or start button
- store a small `audio_unlocked` preference for the session

Logic check:

- do not rely on autoplay working on mobile

Deliverable:

- reliable music/SFX start behavior

### Step B10. Add AI-asset swap support

Do:

- keep placeholder and final assets behind the same registry keys
- optionally allow a runtime flag like `assetPack = placeholder | final`

Logic check:

- swapping art should not change gameplay code, scene layout, or save format

Deliverable:

- future AI asset import becomes content replacement, not refactor work

## Recommended scene structure

### Boot scene

- load shell bundle
- show progress
- initialize save
- initialize audio in locked state

### Title/start overlay

- show play button
- unlock audio on first user interaction
- offer install button when available

### Main scene

- render stall, queue, weather overlay, and tap target
- show serve progress
- show coin counter and upgrade buttons

### Offline overlay

- show that the app is in offline/local mode
- allow continue with local save
- do not block the whole app if the shell is already cached

## Acceptance criteria

Plan B is good enough when all of these are true:

- the game opens and is playable in a browser with placeholder assets
- the app can be installed as a PWA on supported browsers
- after one online load, the shell opens again offline
- save/load works without a backend
- switching tabs does not break timing or inflate rewards
- the two upgrades work and persist
- rain visibly affects customer flow
- final assets can replace placeholders without changing asset IDs

## Risks and mitigations

### Risk: local storage bugs or blocked UI

Mitigation:

- keep `localStorage` tiny
- keep saves in IndexedDB

### Risk: service worker complexity

Mitigation:

- start with shell caching and one offline page
- do not begin with aggressive runtime caching rules

### Risk: placeholder art feels too temporary

Mitigation:

- use a locked palette, silhouettes, and consistent layout
- make placeholders deliberate and readable

### Risk: balance feels flat

Mitigation:

- ship with explicit tuning constants
- instrument queue size, serves per minute, and upgrade timing

## Final recommendation

Plan B should be treated as a first-class delivery path, not a backup sketch.

The best order is:

1. build the browser shell
2. lock the local-first gameplay loop
3. ship a placeholder-asset playable build
4. replace assets gradually with AI-generated art and audio

That order keeps the project playable, testable, and portable to the web at every stage.
