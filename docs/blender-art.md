# Blender visual upgrade

## Shipped assets

The 3D view now loads an original Blender-authored GLB kit instead of the first
prototype's box furniture. The roughly 1 MB runtime kit includes rounded table
edges, tubular steel frames, rubber feet, molded stools, grain-textured timber,
cart hardware, striped fabric, canisters, plants, glass, tea, ice and a straw.
Customers use smooth facial geometry and separate arm, leg and knee pivots.
Walking, sitting and sipping still follow the existing game simulation.

The browser uses ACES tone mapping, environment reflections, contact shadows,
textured pavement and a wetter ground material during rain. Repeated furniture
is instanced. The zoom slider is optional; the initial view frames all tables.

This is a more detailed stylized browser game, not a claim of AAA photorealism.
Production character sculpting, skeletal deformation, authored animation clips,
scanned textures and real-device performance validation remain future work.

## Editable source and rebuild

- Native source: `client/public/assets/3d/shop-kit.blend`
- Runtime asset: `client/public/assets/3d/shop-kit.glb`
- Reproducible authoring script: `tools/build_shop_assets.py`

Built with official portable [Blender 4.5 LTS](https://www.blender.org/releases/4-5/).
No Blender runtime is required to play. From the repository root, run:

```powershell
blender --background --factory-startup --python-exit-code 1 --python tools/build_shop_assets.py
```

The script creates geometry, original timber texture and materials, batches
static parts without crossing animation joints, and validates required node
names. It saves both native Blender source and glTF binary output. Blender
backup files (`*.blend1`) are not deployment inputs.

## Review and verification

The review fixed a batch-merge renaming the tabletop used by raycasting and
preserved individual customer joint pivots. The render path does not award
coins or advance time. Cups remain hidden during arrival, waiting and exit.

Run smoke, flow and visual tests from `client`. Visual tests check the loaded
Blender kit, both viewport sizes, table service, rendered pixels, zoom, rain,
pause/state equivalence and WebGL-loss fallback. The initial unbatched scene
measured 551 draw calls with two customers; batching reduced that sample to
67 before the final glass transmission pass. Those are sample measurements,
not a full-capacity or phone FPS guarantee. GitHub Pages remains test-gated.
The final glass-transmission test measured 127-131 calls with two customers.
Native source reopening and GLB re-import also passed via
`tools/verify_shop_assets.py`, including the knee-to-leg hierarchy assertions.

The earlier prototype limitations in `improvement-plan.md` are historical;
Blender is now available in the development workspace and was executed for this
release. The older `shop-prototype.glb` is retained as an earlier snapshot.
