# Multi-cup brewing

- Story preparation offers 1, 2 or 3 cups; the drawer defaults to 2. The permanent mobile dock and playfield keep their existing sizes.
- Each batch uses one preparation slot. Additional cups add 25% of the base brew time each; the existing speed upgrade still applies. There is no additional ingredient cost.
- Delivery consumes exactly one cup only when drink, ice and sweetness all match. Remaining cups stay ready. The next matching waiting customer is selected while the same batch remains selected.
- A wrong order consumes nothing. A served customer is locked before rewards; repeat delivery cannot consume another cup or award twice.
- Remaining quantity is saved. Legacy batches without a quantity restore as one cup; invalid or depleted saved quantities are discarded rather than refilled. Discard removes the selected batch; day completion clears leftovers.
- Review caught and fixed delayed sweetness-control updates when switching away from plain tea. Recipe controls now update immediately on drink selection.
- Coverage includes all drink types and batch sizes, exact modifiers, partial-use reloads, malformed quantities, tray capacity, selected-batch continuity, day closing with leftovers, and narrow/landscape touch controls.
- Cache v22 includes versioned recipe rules and keeps forced HTTP refresh during installation, preventing older cached rules from ignoring the new quantity.
