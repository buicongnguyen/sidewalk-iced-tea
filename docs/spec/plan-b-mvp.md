# Plan B MVP Spec

## Goal

Build a browser-first playable fallback for `Sidewalk Iced Tea` that works on desktop and mobile, installs as a PWA, saves locally, and keeps asset IDs stable for later replacement.

## In Scope

- single-screen playable prototype
- 2D top-down room with one door and a 2-row by k-column table layout
- six customer types: `man`, `woman`, `old_man`, `old_woman`, `young_boy`, `young_girl`
- customers enter through the door, walk to a table, wait, then leave after service or timeout
- table wait timer rendered on the playfield
- tap or click a table to serve its current customer
- `faster_serve` upgrade
- `umbrella` upgrade
- weather state with rain affecting arrivals
- local-first save and resume
- responsive layout with all controls visible in the same screen as the playfield
- offline-tolerant PWA shell

## Out Of Scope

- backend auth or sync
- leaderboards
- stock depletion and restocking
- multi-product menu
- thug events
- competitors
- prestige systems

## Gameplay Rules

### Layout

- The room shows one entry/exit door on the left side.
- Tables are arranged in exactly `2` rows and `4` columns for the MVP.
- Each table has one seat/customer slot.
- The control bar stays attached to the bottom of the game screen and must remain visible on mobile without scrolling away from gameplay.

### Customer Flow

- Customers spawn at the door.
- If a free table exists, the customer reserves it and walks there.
- If all tables are occupied or reserved, the customer is dropped.
- Once seated, the customer waits up to `18s`.
- If not served within the wait limit, the customer leaves unhappy.
- If served, the customer stays briefly, then exits through the door.

### Customer Types

- `man`
- `woman`
- `old_man`
- `old_woman`
- `young_boy`
- `young_girl`

Customer type is cosmetic in the MVP but must be stored on each live customer entity so future behavior can branch on it.

### Serving

- Serving is started by tapping/clicking a table with a waiting customer.
- Base serve time is `2.5s`.
- `faster_serve` reduces serve time to `1.5s`.
- A table already being served cannot be served again.

### Rewards

- Base reward is `1` coin per served customer.
- A fast service grants up to `2` bonus points.
- A very fast service may also grant `1` tip coin.
- Poor or late service grants no tip and reduced score bonus.

### Weather

- Weather starts as `clear`.
- Rain events occur every `45s` to `75s`.
- Rain lasts `20s`.
- Rain reduces spawn rate to `50%`.
- If the `umbrella` upgrade is owned, rain only reduces spawn rate to `80%`.

### Upgrades

- `faster_serve`
  - cost: `10` coins
  - one-time purchase
- `umbrella`
  - cost: `20` coins
  - one-time purchase

## Simulation Rules

- Use `requestAnimationFrame()` for scheduling.
- Use a fixed logic step of `100ms`.
- Clamp large frame deltas.
- On hidden tab:
  - save immediately
  - pause active simulation
- On visible again:
  - catch up for at most `30s`
  - if hidden longer, apply condensed idle gains instead of replaying all time

## Persistence

- Save the serializable logic state to IndexedDB.
- Keep tiny UI flags in `localStorage` only when useful.
- Auto-save every `10s`.
- Auto-save on `visibilitychange`.
- Auto-save after upgrade purchase.

## Acceptance Criteria

- The game runs in a browser without a backend.
- The playfield and controls are visible together on mobile.
- Customers visibly enter, sit, wait with a timer, and exit.
- Rain changes customer arrival pressure.
- Both upgrades work and persist across reloads.
- Switching tabs does not explode timers or rewards.
- The app provides a manifest, service worker, and offline fallback page.
