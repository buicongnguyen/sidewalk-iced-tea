# Sidewalk Iced Tea

A Vietnamese-first neighborhood tea-shop game. Prepare the right drinks, serve
two seats per table, meet regulars and make choices in 14 street encounters.
Story mode has timed days, branching events, next-day consequences, neighborhood
trust and upgrades. The older automatic-service game is available as Classic.

## Play

GitHub Pages deploys the static client from `client/`:

https://buicongnguyen.github.io/sidewalk-iced-tea/

## Run Locally

```bash
cd client
npm install
npm start
```

Then open the local URL printed by the server.

## Smoke Test

```bash
cd client
npm install
npm run smoke
npm run flow
npm run rules
npm run story
npm run mobile
npm run events
npm run visual
```

## Art

Story defaults to 3D with Blender-authored shop and street kits. The 2D fallback
uses the existing customer sprites and Blender-rendered event portraits. Source
`.blend`, runtime `.glb` and reproducible builders are included. See
[Blender art](docs/blender-art.md) and the reviewed
[neighborhood implementation plan](docs/neighborhood-plan.md).

Rebuild the encounter assets with Blender 4.5:

```bash
blender --background --factory-startup --python-exit-code 1 --python tools/build_event_assets.py
blender --background --factory-startup --python-exit-code 1 --python tools/verify_event_assets.py
```

The 4.6 MB event GLB uses shared materials and separate articulation joints.
This is detailed stylized art, not a claim of AAA photorealism. Phone layouts
and software-rendered browser tests are covered; physical-device FPS is not.
