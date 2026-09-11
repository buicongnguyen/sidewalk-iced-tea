# Neighborhood update: reviewed implementation plan

## Experience and scope

The shop scene is the primary screen. Replace the permanent 260px preparation
panel with a 48px tray dock and 48px horizontally scrolling order strip. Keep a
44px top status/settings bar and a 20px day clock. At 390x844 the scene should
occupy at least 70% of the viewport, and at 320x568 at least 60%. Preparation
opens a short bottom drawer, closes after brewing starts, and never duplicates
the existing recipe rules. All primary touch targets remain at least 44px.

Story mode gains two event opportunities per day, one on the introductory day.
An unobtrusive scene button opens the encounter; reading it freezes the shop.
Ignoring a visitor is allowed and never blocks day completion. Classic remains
unchanged. Vietnamese dialogue is authored as conversational game fiction.

## Event catalog

| Encounter | Choices and consequences | Blender staging |
| --- | --- | --- |
| Argument becoming a fight | Join A/B (repair expense, lower trust); call police (calm returns); offer mediation, then choose how to settle | Two gesturing adults |
| Street racing | Report from shop, move customers back, or cheer; affects trust and traffic; unsafe encouragement costs repairs | Two moving scooters, riders |
| Blocked frontage | Ask driver to move, allow a short stop, or contact attendant; cooperation may bring tomorrow's order | Detailed car |
| Lost girl | Wait in the visible shop and contact family, or ask local staff to assist; guardian returns tomorrow | Girl with backpack |
| Fake payment | Check receipt, accept screenshot, or decline; fixed genuine/fraudulent variant revealed by verification | Adult, phone |
| Request for a meal | Offer food, ask community kitchen to help, or give cash; need/fraud variant not linked to appearance | Adult, parcel |
| Unsettled dog | Close shop gate temporarily, contact handler, or keep distance; no cruelty | Alert dog |
| Friendly dog | Give a dog-safe chew toy or find owner; small cost, trust and returning-owner reward | Articulated dog, chew toy |
| Cat's shiny gift | Inspect, register lost property, or keep it; real jewelry vs bottle cap, delayed owner response | Cat, jewel |
| Street musician | Welcome a song, sponsor a set, or request quiet; modest traffic boost | Musician, guitar |
| Wrong parcel | Check label, hold for courier, or open it; reward for returning, cost for damaging | Parcel |
| Inside-out umbrella | Secure the loose umbrella or bring it inside; little wind comedy, no forced purchase | Umbrella |
| Review for sale | Refuse, offer honest service, or pay; bribery is costly and harms trust | Adult, phone |
| Chess challenge | Play one move or watch; win/lose branch is saved; later regular-customer visit | Elder, chessboard |

Exact dialogue, costs and follow-ups live in `client/event-data.mjs`, separate
from deterministic rules and rendering. New days avoid the last four event IDs
where possible. No encounter judges honesty from clothes or poverty.

## Logic review before implementation

- Separate seeded event RNG from customer RNG. Roll once when encounter starts.
- Persist ID, node, variant, expiry, history and delayed references, not executable
  actions. Validate every restored ID/node/choice. Bound history and pending work.
- Commit terminal effects once before showing outcome. Double clicks, reloads
  and repeated next-day ticks cannot award twice. Validate costs before mutation.
- Every branch has a free exit. Ignore/close does not trap players at zero coins.
- Event choice dialog and settings cannot overlap. Escape closes and resumes only
  a previously running shop. Paused/title states must not be accidentally resumed.
- No event spawn during closing. Expiry and traffic modifiers use simulation time,
  not wall time. Delayed consequences survive rollover, not reset/new-save.
- Renderer consumes snapshots only. Event meshes do not block table picking,
  contain no simulation effects and animate only while the shop runs.

## Art direction and execution

Build native `.blend` and compact `.glb` with Blender 4.5: beveled bodywork, tire
treads, rims, glass, lights, mirrors, layered clothing, facial details, collars,
articulated legs/tails and readable silhouettes. Merge static parts per material
without merging animation joints. Render a contact sheet and transparent 2D
fallback sprites from the same assets. Verify source reopen and GLB node names.
This is AAA-inspired attention to detail, not AAA photorealism or production
animation quality; no unsupported quality or real-phone FPS claim.

## Quality gates and release

1. Unit-test every choice/branch at zero and sufficient coins; saved variants,
   duplicate resolution, malformed saves, delayed effects, cooldown and expiry.
2. Browser-test dock, preparation, serving, modal pause/focus/reload, event effects,
   portrait/landscape resize, table visibility, nonblank moving 3D and 2D fallback.
3. Run all existing smoke, flow, rules, story, mobile and visual regressions.
4. Review final diff for unreachable controls, timer races, duplicate awards,
   cache omissions and scene overlap. Record findings and fixes in review notes.
5. Commit only this release to the standalone SSH GitHub remote. Push main,
   wait for the Pages workflow and verify deployed files and a live playthrough.
