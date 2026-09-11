# Evaluation and release plan

## Evaluation

The Games copy and the standalone Pages repository diverged. Pages has 36 customer
variants, two seats per table, a top entrance, rain protection, and 135-second days.
Games has a different renderer and drink/animal prototypes. Replacing Pages with
Games would remove established features. Release from the standalone source.

The core loop needs a visible reason to complete each day. Start with a service
target and a modest reward; preserve quick-service tips and existing upgrades.
Do not add drink stock, animal penalties, and wind penalties simultaneously:
their combined difficulty needs playtesting before release.

## Executable release scope

1. Finish and review the pending Vietnamese localization in the Pages source.
2. Fix the missing bubble drawing helper; wrap measured text to the bubble width.
3. Show one active order per shared table to avoid overlapping seat dialogue.
4. Add a daily target: 8 customers on day 1, increasing by one per day to 14.
   Award 5 coins exactly once when the day closes with the target achieved.
   The target uses total served, not tips or clicks. No penalty for missing it.
5. Persist the end-of-day reward in the summary so reloads cannot award it again.
6. Reject malformed request URLs without terminating the local server.
7. Run existing gameplay and smoke tests, inspect desktop/mobile rendering,
   review the final diff, push through SSH, and verify the Pages workflow and URL.

## Logic review before implementation

- Service completion is the only source of served counts. Repeated completion
  calls must not grant another reward.
- Day completion must be idempotent. Save a completed summary with bonus.
- Keep target growth capped: a day permits only about twenty arrivals before
  weather and walking time. A target of 14 remains a challenge without requiring
  an arrival rate that overwhelms touch input.
- New fields need defaults when loading old saves. Reloading a completed legacy
  day must not retroactively grant a bonus.
- Dialogue must not interfere with table hit testing. Keep it within the canvas.
- Keep the day clock, pause, rain umbrellas, unique types, and both seats covered
  by the existing regression harness.

## 3D recommendation and later milestones

Blender is an authoring tool, not the browser runtime. Use Blender to author
low-poly assets, export GLB, and load them in Three.js. Keep the simulation in
world-independent state so a renderer cannot change score, timing, or occupancy.
The current release stays 2D; a full 3D conversion is a separately testable phase.

1. Extract simulation updates and seeded randomness into a DOM-free module.
   Compare identical command traces against the existing renderer before moving on.
2. Build one Blender table, chair, cup, and character with consistent meter scale.
   Put character origins at the feet; export walk, idle, sit, sip, and exit clips.
   Attach the drink to a hand socket only while enjoying. Validate in a GLB viewer.
3. Use an orthographic Three.js camera and a full playfield. Map table clicks with
   raycasting to existing table IDs; preserve Vietnamese DOM HUD and 2D fallback.
4. Budget initially for fewer than 100 draw calls, 100k visible triangles, 1024px
   atlases, and a 10 MB compressed initial download. These are targets to measure,
   not claims about achieved performance.
5. Verify nonblank canvas, camera framing, animation and cup visibility on desktop
   and mobile; target 30 FPS on a representative midrange phone. Keep 2D default
   until performance and all gameplay traces pass.

Reference: https://threejs.org/manual/en/loading-3d-models.html recommends glTF/GLB
for runtime delivery and supports Blender exports, skeletal animation and materials.

## Later engagement experiments

- Introduce one drink preference at a time with a visible selection and matching
  served art. Do not imply that ice/sugar preferences work without those controls.
- Add optional pet interactions with positive rewards, never unavoidable fines.
- Add wind as a visible temporary challenge only after an understandable counter
  action exists. Tune its overlap with rain using recorded play sessions.
- Track completion rate and average wait time locally; use them to tune targets
  rather than automatically increasing difficulty after every success.
