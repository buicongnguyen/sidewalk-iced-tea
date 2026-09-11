# Neighborhood release review

## Implemented scope

- 14 authored encounters, 43 choices across initial and follow-up nodes, two
  saved outcome variants where appropriate, and next-day consequences.
- One opportunity on day 1, two thereafter, with recent-event avoidance, neutral
  expiry, a bounded journal, neighborhood trust, modest tip and traffic effects.
- A 44px header, 20px clock and compact order/tray dock. At 390x844, the scene is
  656px high (77.7%). At 320x568 it is 380px (66.9%). Landscape uses a single dock
  row; the clock overlays the upper edge. Preparation is an on-demand drawer.
- Native Blender source, a 4.66 MB GLB, 12 role/prop groups and 14 rendered
  portraits, including cat-gift and dog-toy variants. The kit reuses the game's
  existing human anatomy and adds detailed original props and articulated pets.

## Findings fixed before release

1. Enlarging the canvas initially left excessive empty space. Portrait projection,
   table/stool instance matrices and customer placement now use the same narrower,
   taller mapping. Rotation preserves simulation coordinates and table picking.
2. Scooters and the umbrella could clip on narrow screens. Their routes and
   placement now fit the portrait camera. The wider camera preserves the road.
   The expanded landscape matrix also caught a rider's helmet at the top edge;
   that camera now includes a little extra vertical headroom.
3. Two coplanar road meshes risked flickering; only one road is rendered in Story.
   Vehicle wheels and visitor feet now meet their respective ground surfaces.
4. Red clothing inherited automotive gloss. Separate cotton materials are used;
   the guitar is angled away from the face and the elder has silver hair.
5. A bottle-cap outcome still showed jewelry, and a dog portrait showed a toy
   before it was offered. Separate portrait/mesh visibility states now agree with
   the saved branch and selected action. The unsettled dog has a restrained pose.
6. Invalid saved node names and null pending references could throw. Restoration
   uses own-property checks and authored effect lookup, filters/deduplicates
   pending work, clamps values and bounds history. Negative saved coins normalize.
7. Displayed repair/trust changes could exceed actual changes at zero coins or
   capped trust. Persisted outcome deltas now report the actual applied values.
8. Reducing cup labels removed ice/sugar distinctions, especially problematic on
   phones without hover. Compact preference text is retained, with the full recipe
   shown on cup selection. The landscape dock has enough width for both modifiers.
9. Closing a dialog could focus a now-disabled prepare button. Focus now returns
   to an enabled dock control. Event dialogs freeze the shop and render clock;
   Escape closes them without changing manual pause state. Settings stay separate.
10. Legacy service-worker activation deleted every other origin cache. On GitHub
    Pages that could remove other projects' offline files. Cleanup is now limited
    to this game's cache prefix; smoke tests execute the worker's actual activation
    handler against both game and foreign cache names.

## Verification

- `events`: 172 choice/variant/budget cases; all free exits; exact costs and caps;
  duplicate-choice rejection; persisted branches; next-day single awards; malformed
  input; neutral expiry; 40-day deterministic simulation and event diversity.
- Event browser coverage: all 12 model groups, phone framing and rendered motion,
  dialog freeze, zero-coin choices, preparation on narrow/landscape screens,
  branch/result reloads, a next-day reward across rollover, natural scheduling,
  and the bottle-cap branch. Screenshots include the Blender asset contact sheet.
  The complete asset matrix uses one real renderer across portrait and landscape,
  with pixel, pause and immutable-state assertions. Separate live UI cases cover
  dialogs and persistence. Reusing the renderer avoids repeated GPU environment
  setup on the slower GitHub runner without removing any model from coverage.
- `mobile`: seven viewport sizes, long labels, overflow, focus/settings, boot/save
  protection, four 3D resize sizes, canvas pixels and table picking.
- `story`, `rules`, `flow`, `visual`, `smoke`: retained coverage for recipes,
  two-seat service, five-day progression, rain, umbrellas, customer uniqueness,
  rare accessories, saved upgrades, no session carry-over, real asset 404s,
  rejection of bad cache responses, 3D animation/cups and WebGL fallback.
- Blender 4.5.9 executed the builder, reopened the native source, and re-imported
  the GLB. Required roots and leg-parent relationships pass. The entire kit has
  209 mesh objects and 148,268 faces; only the current encounter is instantiated.
- Service-worker cache v20 includes the new modules, GLB and all portrait variants.

No unresolved correctness issue was found in the reviewed paths after these
fixes. This is stylized browser art, not AAA photorealism. Physical-device GPU
performance and long-term event balancing still need player/device feedback;
automated Chromium viewport tests do not establish real-phone FPS.
