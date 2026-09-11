# Chuyen Goc Pho: implementation and design review

## Product direction

Build a five-day Vietnamese neighborhood tea-shop campaign. Improve clarity,
player agency, pacing, feedback and character continuity rather than claim AAA
asset scale. Keep the existing Classic mode and its saves separate. The new
campaign is the default entry point and shares the existing 2D/3D rendering.

## Release scope and acceptance

1. Three tables, two seats each, a closer shop composition and compact controls.
2. Structured orders: iced tea and kumquat tea on day one, ice preferences from
   day two, coffee and sweetness preferences from day three. Dialogue must be
   generated from the exact recipe checked by delivery, never decorative promises.
3. Preparation produces a cup in a finite slot; players select a ready cup and
   a seated customer to deliver. No automatic serving. Drinks have distinct brew
   times, colors and rewards. Wrong orders are rejected without destroying the cup;
   unwanted cups can be discarded and remade without a money soft lock.
4. One preparation slot initially; a second can be bought from day two. Faster
   brewing and a permanent awning provide alternative uses for money.
5. Three 60-second phases per day. A midday rush changes arrival cadence.
   Closing stops new arrivals but keeps accepted orders playable until customers
   leave. No surprise deletion of guests or loss of in-progress service rewards.
6. Five authored chapter introductions and outcomes. Two named regulars have
   explicit preferences, remembered visits and a short story payoff. Reading and
   pausing stop simulation. Finishing day five offers an epilogue/endless continuation.
7. Forecast rain on day four and later; an awning counters the demand reduction.
   Correct service builds a visible streak; accuracy, target and streak determine
   up to three stars. No lives, debt, energy limit or punishment for taking a break.

## Logic review before coding

- Separate story storage prevents migration from deleting or reinterpreting Classic.
- Persist recipe, preparation progress, ready cups, chapter progress and relationships.
- Use a seeded PRNG for orders/arrival timing; renderer randomness cannot change rules.
- Only one successful delivery can grant a customer's reward. A ready cup is consumed
  in the same state transition; duplicate delivery events do nothing.
- Neither locked recipes nor impossible ice/sugar requests may spawn. Day one has
  no hidden customization. Unlocks are checked again when starting preparation.
- A customer remains patient while a cup is brewing, but ordinary waiting still
  times out. Wrong delivery must not reset patience or create infinite tips.
- Preparation capacity counts both brewing and ready cups. Selling or discarding
  releases a slot. Closing cannot deadlock on cups with no remaining customer.
- Regular appearance and its relationship reward are limited to once per day,
  independent of clothes, ethnicity or gender. Reload cannot farm repeat rewards.
- Restoring a save sanitizes invalid batch/order IDs and clamps numeric fields.
- No offline income in story mode; closed-tab time cannot skip a story beat or shift.
- Keep long dialogue outside timed play. Buttons must stay stable while order timers
  update; render updates must not steal focus or rebuild active controls every frame.

## Verification and release gates

- Pure rule tests: recipe unlocks, matching, capacity, preparation, duplicate delivery,
  chapter/stars, seeded outcomes and save normalization.
- Browser story tests: start/select/prepare/deliver, wrong order, reload, upgrade,
  closing with outstanding guests, day transitions and old-save isolation.
- Keep Classic smoke/13-flow/visual tests running explicitly in Classic mode.
- Verify desktop/mobile story screenshots, 3D nonblank pixels and loaded Blender kit.
- Review final code and rules, fix findings, then SSH commit/push and test-gated Pages.
- Compare the live release's module/asset markers after successful deployment.

## Deliberately deferred

Pets, wind, inventory costs, a timing minigame, voice acting, skeletal animation
clips and additional neighborhoods are not bundled into this first campaign.
Player studies and real-phone FPS/retention targets require people and devices;
automated checks cannot establish whether the redesign is fun or AAA quality.

## Status

- Design and pre-implementation logic review complete.
- Five-day campaign, dual modes, UI, drink assets and persistence implemented.
- Pure rules, story browser flows and Classic regression checks passed locally.
- Deployment is gated by the GitHub workflow, which repeats all six test commands.

## Post-implementation review

1. Immediate reload after an upgrade exposed stale IndexedDB recovery. Added a
   synchronous backup checkpoint, monotonically increasing save revisions,
   newest-save selection and transaction-completion acknowledgement. Reset keeps
   the revision sequence, and a failed IndexedDB read can recover from backup.
2. Invalid save records could contain unknown recipe names, duplicate batch IDs,
   duplicate customer IDs/seats or invalid phases. Added sanitization, null-prototype
   lookup catalogs and bounded campaign star history.
3. Regular portraits could be assigned to unrelated random guests. Reserve those
   two appearances for their named characters in story mode only.
4. Correct closing must retain accepted orders, not clear the board at the clock
   boundary. Browser tests now finish the last drink after closing and verify the
   next chapter, persisted bonuses and fifth-day ending.
5. Desktop screenshots placed preparation below the first viewport. Reworked the
   desktop layout into a scene and adjacent preparation area; mobile remains stacked.
6. Reward feedback used the old one-coin base for every drink. It now displays
   the actual drink price. Plain iced tea never requests a sugar adjustment.
7. Existing service-worker caches could mix the old interface with the redesign.
   Versioned entry CSS/JS and the 3D import, and precached both versioned entrypoints
   and the new modules/icons in cache v18.

## Test commands

From `client`: `npm run rules`, `npm run story`, `npm run smoke`, `npm run flow`,
`npm run mobile`, and `npm run visual`. Story tests include wrong orders, remake, pause, immediate
reload, equipment, save isolation, all five chapters, single rewards, a regular
arrival, rain and desktop/mobile 3D screenshots with pixel and overflow checks.

Human playtesting is still needed to establish enjoyment, difficulty and retention.
The shipped campaign is a polished playable scope, not a claim of AAA production.

## Mobile layout review

- A safe-area-aware viewport grid keeps status, scene, orders and preparation on
  one screen. Landscape moves preparation beside the scene. Short labels and
  stable controls avoid layout changes as timers, recipes and balances change.
- Top settings and pause buttons use offline Lucide icons. View, zoom, upgrades,
  detailed statistics, mode selection and reset live in a native modal dialog.
- Settings freeze simulation without changing the prior play/pause state. Closing
  or pressing Escape restores focus and preserves a deliberately paused game.
  Start/settings and lifecycle checkpoints wait until the existing save has loaded.
- Portrait 3D framing keeps all tables and the entry aisle visible. Only scenery
  and camera framing adapt; customer positions, orders and rewards do not change.
- Rotation testing exposed retained canvas dimensions caused by implicit grid
  minimums. Explicit zero-minimum tracks now let the canvas shrink correctly.
- Browser checks cover 320x568, 360x640, 390x844, 430x932, 844x390, 568x320 and
  1280x900, including overflow, clipped text, settings, focus and frozen timers.
  Four 3D resize checks verify nonblank pixels, visible tables and unchanged state;
  a table-picking check verifies input after rotation. Physical phones remain a
  separate performance and usability check.
