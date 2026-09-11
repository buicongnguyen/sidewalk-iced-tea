# Sidewalk spacing update

## Scope and plan

- Reduce Story-mode 3D shop objects, customer models and their layout footprint to 88% of the previous size. Keep Classic and the 2D fallback unchanged.
- Scale seat offsets and seated height with the furniture, including attached cups and umbrellas. Preserve table-label size and at least 44 CSS-pixel touch targets.
- Reserve the front sidewalk for existing encounters. Give friendly dogs and cats a wider oval route, facing their travel direction; keep alert dogs near their encounter position.
- Keep the road for vehicle events. Fit the full road scene on short portrait phones without shrinking the mobile playfield itself.
- Refresh the offline cache, verify rendering and game rules, then publish to the existing GitHub Pages site.

## Code and logic review

- Fixed a short-phone framing issue found by the expanded asset tests: a scooter rider could extend above the canvas at 320 x 568. Story framing now has a minimum vertical field of view in both orientations.
- Customer coordinates and table-center coordinates use the same scale. Stool offsets are converted back to local group space before applying the parent scale, avoiding double scaling. Seated height uses that scale too.
- Table picking retains the actual geometry hit test, then checks padded screen-space targets. Overlapping padded regions resolve to the nearest table center.
- Labels retain their previous size. Model geometry, cup ownership, event timing, choice consequences, saved customer positions and economy rules are unchanged.
- Pet heading follows the path tangent instead of flipping between two headings. Animation continues to use the paused simulation presentation clock and never mutates saved state.
- Existing Blender meshes are reused; no binary asset rebuild or new dependency is needed for this layout change.

## Verification

- Full 12-asset event matrix at 390 x 844, 844 x 390, 320 x 568 and 1280 x 900: projected bounds, nonblank pixels, moving animation, pause and snapshot isolation.
- Full dog/cat route sampling: travel distance, table clearance, sidewalk bounds and floor contact.
- Mobile layout tests: seven viewports, unchanged playfield size, readable controls, 44-pixel table targets, padded-edge table selection and orientation changes.
- Regression suites: smoke, flow, rules, events, story, mobile and visual.
- Screenshots inspected for seated customers, sidewalk visitors and short-phone road events.

## Limits

This is a focused spacing improvement, not an additional event-content release or a photorealistic art overhaul. Physical-phone frame rate remains unmeasured. Camera zoom is still user-adjustable; default framing is the tested layout.
