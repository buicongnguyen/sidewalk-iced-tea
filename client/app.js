const GAME_VERSION = 1;
const SAVE_DB_NAME = "sidewalk-iced-tea-planb";
const SAVE_STORE_NAME = "saves";
const SAVE_SLOT_KEY = "slot-1";
const ACTIVE_SLOT_POINTER = "sidewalk-iced-tea:active-slot";
const FALLBACK_SAVE_KEY = "sidewalk-iced-tea:save-fallback";
const SAVE_BACKUP_KEY = "sidewalk-iced-tea:save-backup";
const FIXED_STEP = 0.1;
const MAX_CATCH_UP_SECONDS = 30;
const MAX_IDLE_SECONDS = 600;
const IDLE_EFFICIENCY = 0.25;
const MAX_WAIT_SECONDS = 18;
const BASE_SERVE_TIME = 2.5;
const FAST_SERVE_TIME = 1.5;
const BASE_SPAWN_INTERVAL = 6.0;
const SPAWN_VARIANCE = 1.5;
const WEATHER_WINDOW = [45, 75];
const RAIN_DURATION = 20;
const SHIFT_PHASE_DURATION = 45;
const SHIFT_PHASES = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];
const LEVEL_DURATION = SHIFT_PHASE_DURATION * SHIFT_PHASES.length;
const TABLE_CAPACITY = 2;
const TABLE_ROWS = 2;
const TABLE_COLUMNS = 4;
const BOARD_WIDTH = 960;
const BOARD_HEIGHT = 540;
const AISLE_X = 236;
const DOOR_OUTSIDE_X = AISLE_X;
const DOOR_OUTSIDE_Y = 78;
const DOOR_INSIDE_X = AISLE_X;
const DOOR_INSIDE_Y = 116;
const WALK_FRAME_COUNT = 4;
const RARE_ACCESSORY_WEIGHT = 0.2;

const CUSTOMER_TYPES = [
  { id: "man", assetId: "customer_man", label: "Man" },
  { id: "woman", assetId: "customer_woman", label: "Woman" },
  { id: "old_man", assetId: "customer_old_man", label: "Old man" },
  { id: "old_woman", assetId: "customer_old_woman", label: "Old woman" },
  { id: "young_boy", assetId: "customer_young_boy", label: "Young boy" },
  { id: "young_girl", assetId: "customer_young_girl", label: "Young girl" },
  { id: "asian_man", assetId: "customer_asian_man", label: "Asian man" },
  { id: "asian_woman", assetId: "customer_asian_woman", label: "Asian woman" },
  { id: "asian_old_man", assetId: "customer_asian_old_man", label: "Asian older man" },
  { id: "asian_old_woman", assetId: "customer_asian_old_woman", label: "Asian older woman" },
  { id: "asian_young_boy", assetId: "customer_asian_young_boy", label: "Asian young boy" },
  { id: "asian_young_girl", assetId: "customer_asian_young_girl", label: "Asian young girl" },
  { id: "man_teal", assetId: "customer_man_teal", label: "Teal man" },
  { id: "woman_rose", assetId: "customer_woman_rose", label: "Rose woman" },
  { id: "old_man_sage", assetId: "customer_old_man_sage", label: "Sage elder" },
  { id: "old_woman_lilac", assetId: "customer_old_woman_lilac", label: "Lilac elder" },
  { id: "young_boy_cobalt", assetId: "customer_young_boy_cobalt", label: "Cobalt boy" },
  { id: "young_girl_coral", assetId: "customer_young_girl_coral", label: "Coral girl" },
  { id: "asian_man_indigo", assetId: "customer_asian_man_indigo", label: "Indigo man" },
  { id: "asian_woman_mint", assetId: "customer_asian_woman_mint", label: "Mint woman" },
  { id: "asian_old_man_ochre", assetId: "customer_asian_old_man_ochre", label: "Ochre elder" },
  { id: "asian_old_woman_berry", assetId: "customer_asian_old_woman_berry", label: "Berry elder" },
  { id: "asian_young_boy_lime", assetId: "customer_asian_young_boy_lime", label: "Lime boy" },
  { id: "asian_young_girl_violet", assetId: "customer_asian_young_girl_violet", label: "Violet girl" },
  { id: "man_hippie", assetId: "customer_man_hippie", label: "Hippie man" },
  { id: "woman_hippie", assetId: "customer_woman_hippie", label: "Hippie woman" },
  { id: "young_girl_hippie", assetId: "customer_young_girl_hippie", label: "Hippie girl" },
  { id: "asian_young_boy_hippie", assetId: "customer_asian_young_boy_hippie", label: "Hippie boy" },
  { id: "man_helmet_black", assetId: "customer_man_helmet_black", label: "Black helmet man" },
  { id: "woman_helmet_white", assetId: "customer_woman_helmet_white", label: "White helmet woman" },
  { id: "young_boy_helmet_red", assetId: "customer_young_boy_helmet_red", label: "Red helmet boy" },
  { id: "asian_woman_helmet_blue", assetId: "customer_asian_woman_helmet_blue", label: "Blue helmet woman" },
  { id: "old_man_mask_black", assetId: "customer_old_man_mask_black", label: "Black mask elder" },
  { id: "old_woman_mask_white", assetId: "customer_old_woman_mask_white", label: "White mask elder" },
  { id: "asian_young_boy_mask_green", assetId: "customer_asian_young_boy_mask_green", label: "Green mask boy" },
  { id: "asian_young_girl_mask_pink", assetId: "customer_asian_young_girl_mask_pink", label: "Pink mask girl" },
];

const BASE_ASSET_PATHS = {
  bg_room: "./public/assets/final/bg-room.png",
  stall_counter: "./public/assets/final/stall-counter.png",
  table_slot: "./public/assets/final/table-slot.png",
};

const ASSET_PATHS = {
  ...BASE_ASSET_PATHS,
  ...buildCustomerBaseAssetPaths(),
  ...buildWalkAssetPaths(),
  ...buildServedAssetPaths(),
};

const ui = {
  canvas: document.getElementById("game-canvas"),
  coinsValue: document.getElementById("coins-value"),
  scoreValue: document.getElementById("score-value"),
  servedValue: document.getElementById("served-value"),
  tipsValue: document.getElementById("tips-value"),
  weatherValue: document.getElementById("weather-value"),
  tablesValue: document.getElementById("tables-value"),
  flowValue: document.getElementById("flow-value"),
  saveValue: document.getElementById("save-value"),
  shiftLabel: document.getElementById("shift-label"),
  shiftValue: document.getElementById("shift-value"),
  titleOverlay: document.getElementById("title-overlay"),
  overlayCopy: document.getElementById("overlay-copy"),
  startButton: document.getElementById("start-button"),
  installButton: document.getElementById("install-button"),
  upgradeServe: document.getElementById("upgrade-serve"),
  upgradeUmbrella: document.getElementById("upgrade-umbrella"),
  pauseButton: document.getElementById("pause-button"),
  resetButton: document.getElementById("reset-button"),
  offlineBadge: document.getElementById("offline-badge"),
  toast: document.getElementById("toast"),
};

const ctx = ui.canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TABLE_LAYOUT = buildTableLayout();

const runtime = {
  mode: "title",
  assets: new Map(),
  db: null,
  storageMode: "indexeddb",
  lastFrame: 0,
  accumulator: 0,
  autoSaveTimer: 0,
  toastUntil: 0,
  installPrompt: null,
  isOnline: navigator.onLine,
  hiddenStartedAt: null,
  saveStatus: "booting",
  saveInFlight: false,
  pendingSaveReason: null,
  saveDrainPromise: null,
  audio: createAudioEngine(),
  floatingTexts: [],
};

let gameState = createDefaultState();

init().catch((error) => {
  console.error(error);
  showToast("Prototype boot failed. Refresh to try again.");
});

async function init() {
  bindEvents();
  await loadAssets();
  await initStorage();
  const loadedState = await loadGameState();
  if (loadedState) {
    gameState = restoreState(loadedState);
  }

  updateOverlay();
  updateHud();
  updateOnlineState();
  exposeDebugState();
  registerServiceWorker();
  requestAnimationFrame(frameLoop);
}

function bindEvents() {
  ui.canvas.addEventListener("pointerdown", handleCanvasPointer);
  ui.startButton.addEventListener("click", handleStartButton);
  ui.installButton.addEventListener("click", handleInstallButton);
  ui.upgradeServe.addEventListener("click", () => buyUpgrade("faster_serve"));
  ui.upgradeUmbrella.addEventListener("click", () => buyUpgrade("umbrella"));
  ui.pauseButton.addEventListener("click", togglePause);
  ui.resetButton.addEventListener("click", resetSave);

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", () => {
    void persistGameState("pagehide");
  });
  window.addEventListener("online", updateOnlineState);
  window.addEventListener("offline", updateOnlineState);
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    runtime.installPrompt = event;
    ui.installButton.classList.remove("hidden");
  });
  window.addEventListener("appinstalled", () => {
    runtime.installPrompt = null;
    ui.installButton.classList.add("hidden");
    showToast("Installed. You can reopen it like an app now.");
  });
}

function buildTableLayout() {
  const layout = [];
  const startX = 280;
  const startY = 120;
  const gapX = 150;
  const gapY = 185;
  const width = 128;
  const height = 96;

  for (let row = 0; row < TABLE_ROWS; row += 1) {
    for (let column = 0; column < TABLE_COLUMNS; column += 1) {
      const id = `table-${row}-${column}`;
      const x = startX + column * gapX;
      const y = startY + row * gapY;
      layout.push({
        id,
        index: layout.length,
        row,
        column,
        x,
        y,
        width,
        height,
        approachX: Math.max(AISLE_X, x - 28),
        approachY: y + height + 12,
        seatX: x + width / 2,
        seatY: y + height + 16,
        seats: [
          { x: x + (width / 2) - 24, y: y + height + 20 },
          { x: x + (width / 2) + 24, y: y + height + 12 },
        ],
      });
    }
  }

  return layout;
}

function createDefaultState() {
  const now = Date.now();

  return {
    version: GAME_VERSION,
    coins: 0,
    score: 0,
    tipCoins: 0,
    totalServed: 0,
    totalMissed: 0,
    serveLevel: 0,
    umbrellaOwned: false,
    weatherState: "clear",
    weatherRemaining: 0,
    nextWeatherRollIn: randomInRange(...WEATHER_WINDOW),
    dayNumber: 1,
    levelElapsed: 0,
    timeOfDay: SHIFT_PHASES[0].id,
    levelComplete: false,
    levelServed: 0,
    levelMissed: 0,
    levelCoinsEarned: 0,
    lastLevelSummary: null,
    lastSavedAt: now,
    lastSimulatedAt: now,
    audioUnlocked: false,
    nextCustomerId: 1,
    spawnTimer: randomSpawnInterval(1),
    tables: TABLE_LAYOUT.map((table) => ({
      id: table.id,
      status: "empty",
      customerIds: [],
      customerId: null,
      waitElapsed: 0,
      serviceElapsed: 0,
      enjoyElapsed: 0,
      lastOutcome: null,
    })),
    customers: [],
    stats: {
      dropped: 0,
    },
  };
}

function restoreState(saved) {
  const base = createDefaultState();

  if (!saved || typeof saved !== "object") {
    return base;
  }

  const restored = {
    ...base,
    version: GAME_VERSION,
    coins: asNumber(saved.coins, base.coins),
    score: asNumber(saved.score, base.score),
    tipCoins: asNumber(saved.tipCoins, base.tipCoins),
    totalServed: asNumber(saved.totalServed, base.totalServed),
    totalMissed: asNumber(saved.totalMissed, base.totalMissed),
    serveLevel: asNumber(saved.serveLevel, base.serveLevel),
    umbrellaOwned: Boolean(saved.umbrellaOwned),
    weatherState: saved.weatherState === "rain" ? "rain" : "clear",
    weatherRemaining: asNumber(saved.weatherRemaining, base.weatherRemaining),
    nextWeatherRollIn: asNumber(saved.nextWeatherRollIn, base.nextWeatherRollIn),
    dayNumber: Math.max(1, asNumber(saved.dayNumber, base.dayNumber)),
    levelElapsed: clampLevelElapsed(asNumber(saved.levelElapsed, base.levelElapsed)),
    timeOfDay: normalizeTimeOfDay(saved.timeOfDay, asNumber(saved.levelElapsed, base.levelElapsed)),
    levelComplete: Boolean(saved.levelComplete),
    levelServed: asNumber(saved.levelServed, base.levelServed),
    levelMissed: asNumber(saved.levelMissed, base.levelMissed),
    levelCoinsEarned: asNumber(saved.levelCoinsEarned, base.levelCoinsEarned),
    lastLevelSummary: normalizeLevelSummary(saved.lastLevelSummary),
    lastSavedAt: asNumber(saved.lastSavedAt, base.lastSavedAt),
    lastSimulatedAt: Date.now(),
    audioUnlocked: Boolean(saved.audioUnlocked),
    nextCustomerId: asNumber(saved.nextCustomerId, base.nextCustomerId),
    spawnTimer: asNumber(saved.spawnTimer, base.spawnTimer),
    stats: {
      dropped: asNumber(saved?.stats?.dropped, base.stats.dropped),
    },
  };

  if (restored.levelComplete) {
    restored.levelElapsed = LEVEL_DURATION;
    restored.timeOfDay = SHIFT_PHASES[SHIFT_PHASES.length - 1].id;
  } else {
    restored.timeOfDay = normalizeTimeOfDay(restored.timeOfDay, restored.levelElapsed);
  }

  restored.tables = TABLE_LAYOUT.map((table) => {
    const incoming = Array.isArray(saved.tables)
      ? saved.tables.find((entry) => entry.id === table.id)
      : null;

    return {
      id: table.id,
      status: incoming?.status ?? "empty",
      customerIds: Array.isArray(incoming?.customerIds)
        ? incoming.customerIds
            .map((customerId) => asNumber(customerId, null))
            .filter((customerId) => customerId !== null)
            .slice(0, TABLE_CAPACITY)
        : incoming?.customerId != null
          ? [incoming.customerId]
          : [],
      customerId: incoming?.customerId ?? null,
      waitElapsed: asNumber(incoming?.waitElapsed, 0),
      serviceElapsed: asNumber(incoming?.serviceElapsed, 0),
      enjoyElapsed: asNumber(incoming?.enjoyElapsed, 0),
      lastOutcome: incoming?.lastOutcome ?? null,
    };
  });

  restored.customers = Array.isArray(saved.customers)
    ? saved.customers
        .map((customer) => normalizeCustomer(customer))
        .filter(Boolean)
    : [];

  return restored;
}

function normalizeCustomer(customer) {
  if (!customer || typeof customer !== "object") {
    return null;
  }

  const tableLayout = getTableLayout(customer.tableId);
  const customerType = CUSTOMER_TYPES.find((entry) => entry.id === customer.type);

  if (!customerType || !tableLayout) {
    return null;
  }

  const seatIndex = normalizeSeatIndex(customer.seatIndex, tableLayout, customer.x);
  const seat = getSeatPosition(tableLayout, seatIndex);

  return {
    id: asNumber(customer.id, 0),
    type: customerType.id,
    phase: customer.phase ?? "waiting",
    rainUmbrella: Boolean(customer.rainUmbrella),
    seatIndex,
    x: asNumber(customer.x, seat.x),
    y: asNumber(customer.y, seat.y),
    targetX: asNumber(customer.targetX, seat.x),
    targetY: asNumber(customer.targetY, seat.y),
    waypoints: normalizeWaypoints(customer.waypoints, tableLayout, customer.phase, seatIndex),
    tableId: tableLayout.id,
    speed: asNumber(customer.speed, 140),
    waitElapsed: asNumber(customer.waitElapsed, 0),
    serveElapsed: asNumber(customer.serveElapsed, 0),
    enjoyElapsed: asNumber(customer.enjoyElapsed, 0),
    rewardGranted: Boolean(customer.rewardGranted),
    tipReward: asNumber(customer.tipReward, 0),
  };
}

async function loadAssets() {
  const entries = Object.entries(ASSET_PATHS);
  await Promise.all(
    entries.map(async ([assetId, path]) => {
      const image = await loadImage(path);
      runtime.assets.set(assetId, image);
    }),
  );
}

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = path;
  });
}

async function initStorage() {
  localStorage.setItem(ACTIVE_SLOT_POINTER, SAVE_SLOT_KEY);

  try {
    runtime.db = await openDatabase();
    runtime.storageMode = "indexeddb";
    runtime.saveStatus = "ready";
  } catch (error) {
    console.warn("IndexedDB unavailable, falling back to localStorage.", error);
    runtime.storageMode = "localstorage";
    runtime.saveStatus = "fallback";
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }

    const request = indexedDB.open(SAVE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SAVE_STORE_NAME)) {
        db.createObjectStore(SAVE_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadGameState() {
  try {
    let data = null;

    if (runtime.storageMode === "indexeddb" && runtime.db) {
      data = await idbGet(runtime.db, SAVE_SLOT_KEY);
    }

    if (!data) {
      const raw = localStorage.getItem(FALLBACK_SAVE_KEY);
      const backupRaw = localStorage.getItem(SAVE_BACKUP_KEY);
      data = parseSaveSource(raw, backupRaw);
    }

    runtime.saveStatus = data ? "loaded" : "ready";
    return data;
  } catch (error) {
    console.warn("Save load failed. Starting from a clean slot.", error);
    runtime.saveStatus = "recovered";
    return null;
  }
}

function idbGet(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAVE_STORE_NAME, "readonly");
    const store = tx.objectStore(SAVE_STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

function idbPut(db, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAVE_STORE_NAME, "readwrite");
    const store = tx.objectStore(SAVE_STORE_NAME);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function persistGameState(reason = "autosave") {
  runtime.pendingSaveReason = reason;

  if (!runtime.saveDrainPromise) {
    runtime.saveDrainPromise = drainPendingSaves();
  }

  return runtime.saveDrainPromise;
}

async function drainPendingSaves() {
  runtime.saveInFlight = true;

  try {
    while (runtime.pendingSaveReason) {
      const reason = runtime.pendingSaveReason;
      runtime.pendingSaveReason = null;
      await writeGameState(reason);
    }
  } finally {
    runtime.saveInFlight = false;
    runtime.saveDrainPromise = null;
  }
}

async function writeGameState(reason) {
  gameState.lastSavedAt = Date.now();

  try {
    const serializableState = structuredClone(gameState);

    if (runtime.storageMode === "indexeddb" && runtime.db) {
      await idbPut(runtime.db, SAVE_SLOT_KEY, serializableState);
    }

    localStorage.setItem(FALLBACK_SAVE_KEY, JSON.stringify(serializableState));
    localStorage.setItem(SAVE_BACKUP_KEY, JSON.stringify(serializableState));
    runtime.saveStatus = reason === "autosave" ? "saved" : reason;
    updateHud();
  } catch (error) {
    console.error("Failed to save the game state.", error);
    runtime.saveStatus = "save error";
  }
}

function frameLoop(timestamp) {
  if (!runtime.lastFrame) {
    runtime.lastFrame = timestamp;
  }

  const deltaSeconds = Math.min((timestamp - runtime.lastFrame) / 1000, 0.25);
  runtime.lastFrame = timestamp;

  if (runtime.mode === "playing" && !document.hidden) {
    runtime.accumulator += deltaSeconds;
    runtime.autoSaveTimer += deltaSeconds;

    while (runtime.accumulator >= FIXED_STEP) {
      updateLogic(FIXED_STEP);
      runtime.accumulator -= FIXED_STEP;
    }

    if (runtime.autoSaveTimer >= 10) {
      runtime.autoSaveTimer = 0;
      void persistGameState("autosave");
    }
  }

  renderScene(timestamp);
  requestAnimationFrame(frameLoop);
}

function updateLogic(deltaSeconds) {
  gameState.lastSimulatedAt = Date.now();

  if (updateShift(deltaSeconds)) {
    updateHud();
    return;
  }

  updateWeather(deltaSeconds);
  updateSpawning(deltaSeconds);
  updateCustomers(deltaSeconds);
  syncTablesFromCustomers();
  updateFloatingTexts(deltaSeconds);
  updateHud();
}

function updateShift(deltaSeconds) {
  if (gameState.levelComplete) {
    return true;
  }

  const previousPhase = getShiftPhaseInfo(gameState.levelElapsed);
  gameState.levelElapsed = clampLevelElapsed(gameState.levelElapsed + deltaSeconds);
  const nextPhase = getShiftPhaseInfo(gameState.levelElapsed);

  if (previousPhase.id !== nextPhase.id) {
    gameState.timeOfDay = nextPhase.id;
    showToast(getShiftPhaseToast(nextPhase));
  } else {
    gameState.timeOfDay = nextPhase.id;
  }

  if (gameState.levelElapsed >= LEVEL_DURATION) {
    completeLevel();
    return true;
  }

  return false;
}

function completeLevel() {
  const summary = {
    dayNumber: gameState.dayNumber,
    served: gameState.levelServed,
    missed: gameState.levelMissed,
    coinsEarned: gameState.levelCoinsEarned,
  };

  gameState.levelComplete = true;
  gameState.levelElapsed = LEVEL_DURATION;
  gameState.timeOfDay = SHIFT_PHASES[SHIFT_PHASES.length - 1].id;
  gameState.lastLevelSummary = summary;

  clearLevelBoard();
  runtime.mode = "title";
  runtime.lastFrame = 0;
  runtime.accumulator = 0;
  runtime.autoSaveTimer = 0;
  showToast(`Day ${summary.dayNumber} is done. Evening service is over.`);
  updateOverlay();
  updateHud();
  void persistGameState("day-complete");
}

function startNextLevel() {
  if (gameState.levelComplete) {
    gameState.dayNumber += 1;
  }

  resetLevelProgress();
  runtime.mode = "playing";
  runtime.lastFrame = 0;
  runtime.accumulator = 0;
  runtime.autoSaveTimer = 0;
  gameState.audioUnlocked = true;
  runtime.audio.unlock();
  ui.titleOverlay.classList.add("hidden");
  showToast(`Day ${gameState.dayNumber} starts in the morning.`);
  updateOverlay();
  updateHud();
  void persistGameState(gameState.dayNumber === 1 ? "start" : "next-day");
}

function resetLevelProgress() {
  gameState.levelElapsed = 0;
  gameState.timeOfDay = SHIFT_PHASES[0].id;
  gameState.levelComplete = false;
  gameState.levelServed = 0;
  gameState.levelMissed = 0;
  gameState.levelCoinsEarned = 0;
  gameState.lastLevelSummary = null;
  gameState.weatherState = "clear";
  gameState.weatherRemaining = 0;
  gameState.nextWeatherRollIn = randomInRange(...WEATHER_WINDOW);
  gameState.spawnTimer = randomSpawnInterval(1);
  clearLevelBoard();
}

function clearLevelBoard() {
  gameState.tables = TABLE_LAYOUT.map((table) => ({
    id: table.id,
    status: "empty",
    customerIds: [],
    customerId: null,
    waitElapsed: 0,
    serviceElapsed: 0,
    enjoyElapsed: 0,
    lastOutcome: null,
  }));
  gameState.customers = [];
  runtime.floatingTexts = [];
}

function updateWeather(deltaSeconds) {
  if (gameState.weatherState === "rain") {
    gameState.weatherRemaining = Math.max(0, gameState.weatherRemaining - deltaSeconds);
    if (gameState.weatherRemaining <= 0) {
      gameState.weatherState = "clear";
      gameState.nextWeatherRollIn = randomInRange(...WEATHER_WINDOW);
      showToast("Rain cleared. The street is busy again.");
    }
    return;
  }

  gameState.nextWeatherRollIn -= deltaSeconds;
  if (gameState.nextWeatherRollIn <= 0) {
    gameState.weatherState = "rain";
    gameState.weatherRemaining = RAIN_DURATION;
    gameState.nextWeatherRollIn = randomInRange(...WEATHER_WINDOW);
    runtime.audio.beep("rain");
    showToast(gameState.umbrellaOwned ? "Light rain. Umbrella is helping." : "Rain cut the foot traffic.");
  }
}

function updateSpawning(deltaSeconds) {
  gameState.spawnTimer -= deltaSeconds;

  if (gameState.spawnTimer > 0) {
    return;
  }

  if (!spawnCustomer()) {
    gameState.stats.dropped += 1;
    gameState.spawnTimer = randomSpawnInterval(getSpawnRateMultiplier());
    return;
  }

  gameState.spawnTimer = randomSpawnInterval(getSpawnRateMultiplier());
}

function updateCustomers(deltaSeconds) {
  const customersToRemove = new Set();

  for (const customer of gameState.customers) {
    const table = getTableState(customer.tableId);
    const tableLayout = getTableLayout(customer.tableId);
    const seat = tableLayout ? getSeatPosition(tableLayout, customer.seatIndex) : null;

    if (!table || !tableLayout) {
      customersToRemove.add(customer.id);
      continue;
    }

    if (customer.phase === "walking_to_table") {
      const reachedSeat = moveAlongWaypoints(customer, deltaSeconds);
      if (reachedSeat) {
        customer.phase = "waiting";
        customer.x = seat.x;
        customer.y = seat.y;
        table.status = "waiting";
        table.waitElapsed = customer.waitElapsed;
      }
      continue;
    }

    if (customer.phase === "waiting") {
      customer.waitElapsed += deltaSeconds;
      table.status = "waiting";
      table.waitElapsed = customer.waitElapsed;
      if (customer.waitElapsed >= MAX_WAIT_SECONDS) {
        table.lastOutcome = "missed";
        beginExit(customer, table);
        gameState.totalMissed += 1;
        gameState.levelMissed += 1;
        gameState.score = Math.max(0, gameState.score - 1);
        spawnFloatingText({
          text: "Too late",
          x: seat.x,
          y: tableLayout.y - 10,
          color: "#ffd5d5",
        });
        showToast(`${customerLabel(customer.type)} left after waiting too long.`);
        void persistGameState("missed");
      }
      continue;
    }

    if (customer.phase === "being_served") {
      customer.serveElapsed += deltaSeconds;
      table.status = "serving";
      table.serviceElapsed = customer.serveElapsed;
      if (customer.serveElapsed >= currentServeTime()) {
        finishService(customer, table);
      }
      continue;
    }

    if (customer.phase === "enjoying") {
      customer.enjoyElapsed += deltaSeconds;
      table.status = "enjoying";
      table.enjoyElapsed = customer.enjoyElapsed;
      if (customer.enjoyElapsed >= 2.4) {
        beginExit(customer, table);
      }
      continue;
    }

    if (customer.phase === "walking_out") {
      const reachedDoor = moveAlongWaypoints(customer, deltaSeconds);
      if (reachedDoor) {
        customersToRemove.add(customer.id);
      }
    }
  }

  if (customersToRemove.size > 0) {
    gameState.customers = gameState.customers.filter(
      (customer) => !customersToRemove.has(customer.id),
    );
  }
}

function syncTablesFromCustomers() {
  for (const table of gameState.tables) {
    const customers = getOccupyingTableCustomers(table.id);
    const waitingCustomer = getPriorityTableCustomer(table.id, "waiting");
    const servingCustomer = getPriorityTableCustomer(table.id, "being_served");
    const enjoyingCustomer = getPriorityTableCustomer(table.id, "enjoying");

    table.customerIds = customers.map((customer) => customer.id);
    table.customerId = table.customerIds[0] ?? null;
    table.waitElapsed = 0;
    table.serviceElapsed = 0;
    table.enjoyElapsed = 0;

    if (customers.length === 0) {
      if (table.status !== "empty") {
        table.status = "empty";
      }
      continue;
    }

    if (waitingCustomer) {
      table.status = "waiting";
      table.customerId = waitingCustomer.id;
      table.waitElapsed = waitingCustomer.waitElapsed;
      continue;
    }

    if (servingCustomer) {
      table.status = "serving";
      table.customerId = servingCustomer.id;
      table.serviceElapsed = servingCustomer.serveElapsed;
      continue;
    }

    if (enjoyingCustomer) {
      table.status = "enjoying";
      table.customerId = enjoyingCustomer.id;
      table.enjoyElapsed = enjoyingCustomer.enjoyElapsed;
      continue;
    }

    table.status = "reserved";
  }
}

function spawnCustomer() {
  const openSeat = findOpenTableSeat();
  if (!openSeat) {
    return false;
  }

  const customerType = findAvailableCustomerType();
  if (!customerType) {
    return false;
  }

  const customerId = gameState.nextCustomerId;
  gameState.nextCustomerId += 1;
  const seat = getSeatPosition(openSeat.layout, openSeat.seatIndex);

  const customer = {
    id: customerId,
    type: customerType.id,
    phase: "walking_to_table",
    rainUmbrella: false,
    seatIndex: openSeat.seatIndex,
    x: DOOR_OUTSIDE_X,
    y: DOOR_OUTSIDE_Y,
    targetX: seat.x,
    targetY: seat.y,
    waypoints: buildEntryWaypoints(openSeat.layout, openSeat.seatIndex),
    tableId: openSeat.layout.id,
    speed: 140,
    waitElapsed: 0,
    serveElapsed: 0,
    enjoyElapsed: 0,
    rewardGranted: false,
    tipReward: 0,
  };

  const table = getTableState(openSeat.layout.id);
  table.status = "reserved";
  table.customerIds = [...table.customerIds, customerId].slice(0, TABLE_CAPACITY);
  table.customerId = table.customerIds[0] ?? customerId;
  table.lastOutcome = null;
  gameState.customers.push(customer);
  return true;
}

function beginExit(customer, table) {
  const tableLayout = getTableLayout(customer.tableId);
  customer.phase = "walking_out";
  customer.rainUmbrella = false;
  customer.targetX = DOOR_OUTSIDE_X;
  customer.targetY = DOOR_OUTSIDE_Y;
  customer.waypoints = tableLayout ? buildExitWaypoints(tableLayout) : [];
  customer.serveElapsed = 0;
  customer.enjoyElapsed = 0;
}

function finishService(customer, table) {
  const waitTime = customer.waitElapsed;
  const tableLayout = getTableLayout(customer.tableId);
  const seat = tableLayout ? getSeatPosition(tableLayout, customer.seatIndex) : null;
  let scoreGain = 0;
  let tipGain = 0;

  if (waitTime <= 5) {
    scoreGain = 2;
    tipGain = 1;
  } else if (waitTime <= 10) {
    scoreGain = 1;
  }

  gameState.coins += 1 + tipGain;
  gameState.tipCoins += tipGain;
  gameState.score += 1 + scoreGain;
  gameState.totalServed += 1;
  gameState.levelServed += 1;
  gameState.levelCoinsEarned += 1 + tipGain;
  customer.rewardGranted = true;
  customer.tipReward = tipGain;
  customer.phase = "enjoying";
  customer.enjoyElapsed = 0;
  table.lastOutcome = tipGain > 0 ? "tipped" : "served";
  runtime.audio.beep(tipGain > 0 ? "tip" : "serve");

  if (seat && tableLayout) {
    spawnFloatingText({
      text: tipGain > 0 ? `+${1 + tipGain} coins / +${1 + scoreGain} pts` : `+1 coin / +${1 + scoreGain} pts`,
      x: seat.x,
      y: tableLayout.y - 14,
      color: tipGain > 0 ? "#fff2a8" : "#dcffe1",
    });
  }

  const toastMessage =
    tipGain > 0
      ? `${customerLabel(customer.type)} tipped you for quick service.`
      : `${customerLabel(customer.type)} got served.`;
  showToast(toastMessage);
  void persistGameState("served");
}

function handleCanvasPointer(event) {
  if (runtime.mode === "title") {
    handleStartButton();
    return;
  }

  if (runtime.mode !== "playing") {
    return;
  }

  const point = getCanvasPoint(event);
  if (!point) {
    return;
  }

  const tableLayout = TABLE_LAYOUT.find((table) =>
    point.x >= table.x &&
    point.x <= table.x + table.width &&
    point.y >= table.y &&
    point.y <= table.y + table.height + 70,
  );

  if (!tableLayout) {
    return;
  }

  const table = getTableState(tableLayout.id);
  if (!table) {
    return;
  }

  const waitingCustomer = getPriorityTableCustomer(tableLayout.id, "waiting");
  if (!waitingCustomer) {
    if (tryPlaceRainUmbrella(tableLayout, getOccupyingTableCustomers(tableLayout.id))) {
      return;
    }

    showToast("That table is not ready to serve.");
    return;
  }

  waitingCustomer.phase = "being_served";
  waitingCustomer.serveElapsed = 0;
  table.status = "serving";
  table.serviceElapsed = 0;
  runtime.audio.beep("tap");
}

function tryPlaceRainUmbrella(tableLayout, customers) {
  if (gameState.weatherState !== "rain" || !Array.isArray(customers) || customers.length === 0) {
    return false;
  }

  const umbrellaEligibleCustomers = customers.filter((customer) =>
    ["being_served", "enjoying"].includes(customer.phase),
  );
  if (umbrellaEligibleCustomers.length === 0) {
    return false;
  }

  const uncoveredCustomers = umbrellaEligibleCustomers.filter((customer) => !customer.rainUmbrella);
  if (uncoveredCustomers.length === 0) {
    showToast("That table already has rain cover.");
    return true;
  }

  uncoveredCustomers.forEach((customer) => {
    customer.rainUmbrella = true;
  });
  runtime.audio.beep("upgrade");
  showToast(
    uncoveredCustomers.length > 1
      ? `The customers at T${tableLayout.index + 1} are covered from the rain.`
      : `${customerLabel(uncoveredCustomers[0].type)} is covered from the rain.`,
  );
  void persistGameState("umbrella");
  return true;
}

function getCanvasPoint(event) {
  const bounds = ui.canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) {
    return null;
  }

  const scaleX = BOARD_WIDTH / bounds.width;
  const scaleY = BOARD_HEIGHT / bounds.height;

  return {
    x: (event.clientX - bounds.left) * scaleX,
    y: (event.clientY - bounds.top) * scaleY,
  };
}

function handleStartButton() {
  if (runtime.mode === "playing") {
    return;
  }

  if (runtime.mode === "paused") {
    runtime.mode = "playing";
    runtime.lastFrame = 0;
    ui.titleOverlay.classList.add("hidden");
    showToast("Back to service.");
    updateOverlay();
    updateHud();
    return;
  }

  if (gameState.levelComplete) {
    startNextLevel();
    return;
  }

  runtime.mode = "playing";
  runtime.lastFrame = 0;
  runtime.accumulator = 0;
  runtime.autoSaveTimer = 0;
  gameState.audioUnlocked = true;
  runtime.audio.unlock();
  ui.titleOverlay.classList.add("hidden");
  updateOverlay();
  updateHud();
  void persistGameState(gameState.levelElapsed > 0 ? "continue" : "start");
}

async function handleInstallButton() {
  if (!runtime.installPrompt) {
    return;
  }

  runtime.installPrompt.prompt();
  await runtime.installPrompt.userChoice;
  runtime.installPrompt = null;
  ui.installButton.classList.add("hidden");
}

function buyUpgrade(kind) {
  if (runtime.mode === "title" && !gameState.levelComplete) {
    handleStartButton();
  }

  if (kind === "faster_serve") {
    if (gameState.serveLevel > 0) {
      showToast("Faster Serve is already active.");
      return;
    }

    if (gameState.coins < 10) {
      showToast("Need 10 coins for Faster Serve.");
      return;
    }

    gameState.coins -= 10;
    gameState.serveLevel = 1;
    runtime.audio.beep("upgrade");
    showToast("Faster Serve unlocked.");
    void persistGameState("upgrade");
    updateHud();
    return;
  }

  if (kind === "umbrella") {
    if (gameState.umbrellaOwned) {
      showToast("Umbrella is already covering the stall.");
      return;
    }

    if (gameState.coins < 20) {
      showToast("Need 20 coins for the umbrella.");
      return;
    }

    gameState.coins -= 20;
    gameState.umbrellaOwned = true;
    runtime.audio.beep("upgrade");
    showToast("Umbrella unlocked. Rain hurts less now.");
    void persistGameState("upgrade");
    updateHud();
  }
}

function togglePause() {
  if (runtime.mode === "title") {
    return;
  }

  if (runtime.mode === "paused") {
    runtime.mode = "playing";
    runtime.lastFrame = 0;
    ui.titleOverlay.classList.add("hidden");
    showToast("Back to service.");
  } else {
    runtime.mode = "paused";
    updateOverlay();
    showToast("Stall paused.");
  }

  updateOverlay();
  updateHud();
}

async function resetSave() {
  const confirmed = window.confirm("Reset the local save for this tea stall?");
  if (!confirmed) {
    return;
  }

  gameState = createDefaultState();
  runtime.mode = "title";
  runtime.lastFrame = 0;
  runtime.accumulator = 0;
  updateOverlay();
  updateHud();
  await persistGameState("reset");
  showToast("Save reset. Your stall is fresh again.");
}

async function handleVisibilityChange() {
  if (document.hidden) {
    runtime.hiddenStartedAt = Date.now();
    runtime.lastFrame = 0;
    runtime.accumulator = 0;
    await persistGameState("hidden");
    return;
  }

  if (!runtime.hiddenStartedAt || runtime.mode !== "playing") {
    runtime.hiddenStartedAt = null;
    runtime.lastFrame = 0;
    return;
  }

  const elapsedSeconds = (Date.now() - runtime.hiddenStartedAt) / 1000;
  runtime.hiddenStartedAt = null;
  applyResumeSimulation(elapsedSeconds);
  runtime.lastFrame = 0;
  updateHud();
}

function applyResumeSimulation(elapsedSeconds) {
  const catchUp = Math.min(elapsedSeconds, MAX_CATCH_UP_SECONDS);
  const extraIdle = Math.max(0, Math.min(elapsedSeconds - catchUp, MAX_IDLE_SECONDS));

  if (catchUp > 0) {
    let remaining = catchUp;
    while (remaining > 0) {
      const step = Math.min(FIXED_STEP, remaining);
      if (updateShift(step)) {
        break;
      }
      updateWeather(step);
      updateSpawning(step);
      updateCustomers(step);
      syncTablesFromCustomers();
      updateFloatingTexts(step);
      remaining -= step;
    }
  }

  if (runtime.mode === "playing" && extraIdle > 0) {
    const estimatedCoins = Math.floor(
      (extraIdle / BASE_SPAWN_INTERVAL) * IDLE_EFFICIENCY,
    );
    if (estimatedCoins > 0) {
      gameState.coins += estimatedCoins;
      gameState.score += estimatedCoins;
      showToast(`Idle catch-up: +${estimatedCoins} coins.`);
    }
  }

  updateHud();
  if (runtime.mode === "playing") {
    void persistGameState("resume");
  }
}

function renderScene(timestamp) {
  ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  drawRoom();
  drawTables();
  drawCustomers(timestamp);
  drawFloatingTexts();

  if (gameState.weatherState === "rain") {
    drawRainOverlay(timestamp);
  }

  drawDaylightOverlay();

  if (runtime.mode === "paused") {
    drawPauseHint();
  }

  renderToast();
}

function drawRoom() {
  ctx.fillStyle = "#3a2216";
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  const bgImage = runtime.assets.get("bg_room");
  if (bgImage) {
    ctx.drawImage(bgImage, 0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    return;
  }

  const counterImage = runtime.assets.get("stall_counter");
  if (counterImage) {
    ctx.drawImage(counterImage, 96, 66, 232, 145);
  }
}

function drawTables() {
  const tableImage = runtime.assets.get("table_slot");

  for (const layout of TABLE_LAYOUT) {
    const table = getTableState(layout.id);

    ctx.save();
    if (tableImage) {
      ctx.drawImage(tableImage, layout.x, layout.y, layout.width, layout.height);
    } else {
      ctx.fillStyle = "#7c5333";
      ctx.fillRect(layout.x, layout.y, layout.width, layout.height);
    }

    drawTableStatusHalo(layout, table);
    drawTableSeats(layout);
    drawTableLabel(layout);
    drawTableTimer(layout, table);
    drawServeHint(layout, table);
    ctx.restore();
  }
}

function drawTableStatusHalo(layout, table) {
  if (table.status === "empty") {
    return;
  }

  const centerX = layout.x + layout.width / 2;
  const centerY = layout.y + layout.height / 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 64, 34, 0, 0, Math.PI * 2);

  if (table.status === "serving") {
    ctx.fillStyle = "rgba(255, 166, 83, 0.28)";
  } else if (table.status === "enjoying") {
    ctx.fillStyle = "rgba(112, 196, 151, 0.26)";
  } else {
    ctx.fillStyle = "rgba(112, 158, 215, 0.22)";
  }

  ctx.fill();
}

function drawTableLabel(layout) {
  ctx.fillStyle = "#3d2414";
  ctx.font = '700 16px "Trebuchet MS", sans-serif';
  ctx.fillText(`T${layout.index + 1}`, layout.x + 10, layout.y + 18);
}

function drawTableSeats(layout) {
  const customers = getOccupyingTableCustomers(layout.id);
  const seatStates = layout.seats.map((seat, seatIndex) => {
    const customer = customers.find((entry) => entry.seatIndex === seatIndex) ?? null;
    return {
      seat,
      customer,
      waiting: customer?.phase === "waiting",
    };
  });

  ctx.save();
  for (const seatState of seatStates) {
    ctx.beginPath();
    ctx.ellipse(seatState.seat.x, seatState.seat.y + 2, 19, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = seatState.customer ? "rgba(68, 42, 24, 0.42)" : "rgba(255, 245, 223, 0.26)";
    ctx.fill();

    if (seatState.waiting) {
      ctx.beginPath();
      ctx.ellipse(seatState.seat.x, seatState.seat.y + 1, 22, 9, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 246, 205, 0.72)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawTableTimer(layout, table) {
  if (table.status === "empty" || table.status === "reserved") {
    return;
  }

  const timerX = layout.x + layout.width / 2;
  const timerY = layout.y - 6;

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = '700 26px "Courier New", monospace';

  if (table.status === "waiting") {
    const remaining = Math.max(0, Math.ceil(MAX_WAIT_SECONDS - table.waitElapsed));
    const ratio = remaining / MAX_WAIT_SECONDS;
    ctx.fillStyle = ratio > 0.55 ? "#174d2e" : ratio > 0.3 ? "#915c13" : "#9b2626";
    ctx.fillRect(timerX - 26, timerY - 24, 52, 28);
    ctx.fillStyle = "#fff7ea";
    ctx.fillText(String(remaining), timerX, timerY - 2);
  } else if (table.status === "serving") {
    const progress = Math.min(1, table.serviceElapsed / currentServeTime());
    ctx.fillStyle = "#22507d";
    ctx.fillRect(timerX - 32, timerY - 24, 64, 28);
    ctx.fillStyle = "#fff7ea";
    ctx.fillText(`${Math.round(progress * 100)}%`, timerX, timerY - 2);
  } else if (table.status === "enjoying") {
    ctx.fillStyle = "#2a683d";
    ctx.fillRect(timerX - 30, timerY - 24, 60, 28);
    ctx.fillStyle = "#fff7ea";
    ctx.fillText("OK", timerX, timerY - 2);
  }

  ctx.restore();
}

function drawServeHint(layout, table) {
  if (table.status !== "waiting") {
    return;
  }
  const waitingCustomers = getOccupyingTableCustomers(layout.id).filter(
    (customer) => customer.phase === "waiting",
  );

  ctx.save();
  ctx.strokeStyle = "rgba(255, 248, 214, 0.9)";
  ctx.lineWidth = 2;
  for (const customer of waitingCustomers) {
    const seat = getSeatPosition(layout, customer.seatIndex);
    const centerX = seat.x;
    const centerY = seat.y - 18;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - 6, centerY);
    ctx.lineTo(centerX + 6, centerY);
    ctx.moveTo(centerX, centerY - 6);
    ctx.lineTo(centerX, centerY + 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCustomers(timestamp) {
  const sorted = [...gameState.customers].sort((left, right) => left.y - right.y);

  for (const customer of sorted) {
    const customerType = CUSTOMER_TYPES.find((entry) => entry.id === customer.type);
    const image = customerType ? getCustomerImage(customerType, customer, timestamp) : null;
    const isWalking = customer.phase === "walking_to_table" || customer.phase === "walking_out";
    const bob = isWalking
      ? Math.sin((timestamp / 95) + customer.id) * 2.2
      : Math.sin((timestamp / 180) + customer.id) * 1.2;
    const drawX = Math.round(customer.x - 28);
    const drawY = Math.round(customer.y - 72 + bob);

    ctx.save();
    ctx.fillStyle = "rgba(30, 18, 10, 0.24)";
    ctx.beginPath();
    ctx.ellipse(customer.x, customer.y + 2, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (image) {
      ctx.drawImage(image, drawX, drawY, 56, 72);
    } else {
      ctx.fillStyle = "#f5cab0";
      ctx.fillRect(drawX + 16, drawY + 12, 24, 18);
      ctx.fillStyle = "#5277a5";
      ctx.fillRect(drawX + 12, drawY + 30, 32, 24);
    }

    if (customer.phase === "waiting") {
      const labelOffsetX = customer.seatIndex === 0 ? -18 : 18;
      const labelOffsetY = customer.seatIndex === 0 ? -12 : -24;
      ctx.fillStyle = "#fff6de";
      ctx.font = '700 11px "Trebuchet MS", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(customerLabel(customer.type), customer.x + labelOffsetX, drawY + labelOffsetY);
    }

    if (shouldDrawRainUmbrella(customer)) {
      drawCustomerUmbrella(customer, drawY, timestamp);
    }
    ctx.restore();
  }
}

function shouldDrawRainUmbrella(customer) {
  return (
    customer.rainUmbrella &&
    gameState.weatherState === "rain" &&
    ["waiting", "being_served", "enjoying"].includes(customer.phase)
  );
}

function drawCustomerUmbrella(customer, drawY, timestamp) {
  const pulse = Math.sin((timestamp / 220) + customer.id) * 1.2;
  const centerX = Math.round(customer.x);
  const canopyY = Math.round(drawY - 4 + pulse);
  const left = centerX - 38;
  const right = centerX + 38;
  const bottom = canopyY + 20;

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.fillStyle = "rgba(20, 33, 30, 0.28)";
  ctx.beginPath();
  ctx.ellipse(centerX + 4, bottom + 5, 34, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.quadraticCurveTo(centerX - 28, canopyY - 18, centerX, canopyY - 16);
  ctx.quadraticCurveTo(centerX + 28, canopyY - 18, right, bottom);
  ctx.quadraticCurveTo(centerX + 19, bottom - 7, centerX, bottom);
  ctx.quadraticCurveTo(centerX - 19, bottom - 7, left, bottom);
  ctx.closePath();
  ctx.fillStyle = "#2a8a76";
  ctx.fill();
  ctx.strokeStyle = "#153f39";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = "rgba(218, 255, 246, 0.58)";
  ctx.lineWidth = 2;
  for (const ribX of [centerX - 23, centerX, centerX + 23]) {
    ctx.beginPath();
    ctx.moveTo(centerX, canopyY - 13);
    ctx.lineTo(ribX, bottom - 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "#3b2b1d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, bottom - 1);
  ctx.lineTo(centerX, drawY + 38);
  ctx.stroke();

  ctx.restore();
}

function getCustomerImage(customerType, customer, timestamp) {
  if (customer.phase === "walking_to_table" || customer.phase === "walking_out") {
    const frameIndex = Math.floor((timestamp / 130) + customer.id) % WALK_FRAME_COUNT;
    const walkAssetId = `${customerType.assetId}_walk_${frameIndex}`;
    return runtime.assets.get(walkAssetId) ?? runtime.assets.get(customerType.assetId);
  }

  if (customer.phase === "enjoying") {
    const servedAssetId = `${customerType.assetId}_served`;
    return runtime.assets.get(servedAssetId) ?? runtime.assets.get(customerType.assetId);
  }

  return runtime.assets.get(customerType.assetId);
}

function drawFloatingTexts() {
  for (const item of runtime.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - (item.age / item.lifetime));
    ctx.fillStyle = item.color;
    ctx.textAlign = "center";
    ctx.font = '700 18px "Trebuchet MS", sans-serif';
    ctx.fillText(item.text, item.x, item.y - (item.age * 22));
    ctx.restore();
  }
}

function drawRainOverlay(timestamp) {
  const seconds = timestamp / 1000;

  ctx.save();
  ctx.fillStyle = "rgba(32, 58, 90, 0.22)";
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(218, 244, 255, 0.62)";

  for (let index = 0; index < 74; index += 1) {
    const lane = index % 13;
    const row = Math.floor(index / 13);
    const x = ((lane * 86) + (row * 39) + (seconds * 38)) % (BOARD_WIDTH + 96) - 48;
    const y = ((row * 92) + (lane * 31) + (seconds * 330)) % (BOARD_HEIGHT + 96) - 48;
    const length = 18 + ((index % 5) * 3);

    ctx.globalAlpha = 0.45 + ((index % 4) * 0.11);
    ctx.lineWidth = index % 3 === 0 ? 2.6 : 1.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 8, y + length);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = "rgba(202, 236, 255, 0.52)";
  ctx.lineWidth = 1.4;
  for (let index = 0; index < 22; index += 1) {
    const x = ((index * 47) + (seconds * 72)) % BOARD_WIDTH;
    const y = 368 + ((index * 19) % 126);
    const pulse = 2 + ((seconds * 8 + index) % 5);
    ctx.beginPath();
    ctx.ellipse(x, y, pulse * 2.2, pulse * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawDaylightOverlay() {
  const phase = getShiftPhaseInfo(gameState.levelElapsed);

  ctx.save();
  if (phase.id === "morning") {
    const skyGlow = ctx.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
    skyGlow.addColorStop(0, "rgba(255, 229, 177, 0.16)");
    skyGlow.addColorStop(0.58, "rgba(255, 244, 216, 0.06)");
    skyGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = skyGlow;
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    const sunGlow = ctx.createRadialGradient(176, 92, 24, 176, 92, 248);
    sunGlow.addColorStop(0, "rgba(255, 247, 212, 0.16)");
    sunGlow.addColorStop(1, "rgba(255, 247, 212, 0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  } else if (phase.id === "afternoon") {
    ctx.fillStyle = "rgba(255, 244, 216, 0.05)";
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  } else {
    const duskShade = ctx.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
    duskShade.addColorStop(0, "rgba(80, 70, 106, 0.18)");
    duskShade.addColorStop(0.65, "rgba(52, 45, 74, 0.12)");
    duskShade.addColorStop(1, "rgba(255, 168, 121, 0.05)");
    ctx.fillStyle = duskShade;
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    const streetGlow = ctx.createRadialGradient(152, 428, 32, 152, 428, 280);
    streetGlow.addColorStop(0, "rgba(255, 201, 134, 0.12)");
    streetGlow.addColorStop(1, "rgba(255, 201, 134, 0)");
    ctx.fillStyle = streetGlow;
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  }
  ctx.restore();
}

function drawPauseHint() {
  ctx.save();
  ctx.fillStyle = "rgba(23, 12, 8, 0.56)";
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  ctx.fillStyle = "#fff7ea";
  ctx.textAlign = "center";
  ctx.font = '700 36px "Trebuchet MS", sans-serif';
  ctx.fillText("Paused", BOARD_WIDTH / 2, BOARD_HEIGHT / 2);
  ctx.font = '600 18px "Trebuchet MS", sans-serif';
  ctx.fillText("Tap Resume to reopen the stall.", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 32);
  ctx.restore();
}

function renderToast() {
  if (runtime.toastUntil <= performance.now()) {
    ui.toast.classList.add("hidden");
  }
}

function updateHud() {
  const busyTables = gameState.tables.filter((table) => table.status !== "empty").length;
  const shiftPhase = getShiftPhaseInfo(gameState.levelElapsed);

  ui.coinsValue.textContent = String(gameState.coins);
  ui.scoreValue.textContent = String(gameState.score);
  ui.servedValue.textContent = String(gameState.totalServed);
  ui.tipsValue.textContent = String(gameState.tipCoins);
  ui.weatherValue.textContent =
    gameState.weatherState === "rain"
      ? `rain ${Math.ceil(gameState.weatherRemaining)}s`
      : "clear";
  ui.tablesValue.textContent = `${busyTables} / ${TABLE_LAYOUT.length}`;
  ui.flowValue.textContent = `${gameState.totalServed} served / ${gameState.totalMissed} missed`;
  ui.saveValue.textContent = runtime.saveStatus;
  ui.shiftLabel.textContent = `Day ${gameState.dayNumber}`;
  ui.shiftValue.textContent = gameState.levelComplete
    ? "Complete"
    : `${shiftPhase.label} ${formatCountdown(shiftPhase.remainingInPhase)}`;
  ui.pauseButton.innerHTML =
    runtime.mode === "paused"
      ? 'Resume<small>back to service</small>'
      : 'Pause<small>freeze the stall</small>';

  ui.upgradeServe.disabled = gameState.serveLevel > 0 || gameState.coins < 10;
  ui.upgradeServe.innerHTML =
    gameState.serveLevel > 0
      ? 'Faster Serve<small>bought</small>'
      : 'Faster Serve<small>10 coins</small>';

  ui.upgradeUmbrella.disabled = gameState.umbrellaOwned || gameState.coins < 20;
  ui.upgradeUmbrella.innerHTML =
    gameState.umbrellaOwned
      ? 'Umbrella<small>bought</small>'
      : 'Umbrella<small>20 coins</small>';

  updateOverlay();
}

function updateOverlay() {
  const shiftPhase = getShiftPhaseInfo(gameState.levelElapsed);

  if (gameState.levelComplete) {
    const summary = gameState.lastLevelSummary ?? {
      dayNumber: gameState.dayNumber,
      served: gameState.levelServed,
      missed: gameState.levelMissed,
      coinsEarned: gameState.levelCoinsEarned,
    };
    const nextDay = gameState.dayNumber + 1;
    ui.titleOverlay.classList.remove("hidden");
    ui.startButton.textContent = `Start Day ${nextDay}`;
    ui.overlayCopy.textContent =
      `Day ${summary.dayNumber} closed after evening. Served ${summary.served}, missed ${summary.missed}, earned ${summary.coinsEarned} coins. Tap to open morning on Day ${nextDay}.`;
    return;
  }

  if (runtime.mode === "title") {
    ui.titleOverlay.classList.remove("hidden");
    ui.startButton.textContent =
      gameState.levelElapsed > 0 || gameState.totalServed > 0 || gameState.coins > 0
        ? `Continue Day ${gameState.dayNumber}`
        : `Open Day ${gameState.dayNumber}`;
    ui.overlayCopy.textContent =
      gameState.levelElapsed > 0
        ? `Day ${gameState.dayNumber} is in ${shiftPhase.label.toLowerCase()}. ${formatCountdown(shiftPhase.remainingInLevel)} remain before the evening close.`
        : "Each day runs from morning to afternoon to evening. Tap a table to serve before the timers and the shift clock run out.";
    return;
  }

  if (runtime.mode === "paused") {
    ui.titleOverlay.classList.remove("hidden");
    ui.startButton.textContent = "Resume Shift";
    ui.overlayCopy.textContent =
      "Service is paused. Resume when you want customers moving again.";
    return;
  }

  ui.titleOverlay.classList.add("hidden");
}

function updateOnlineState() {
  runtime.isOnline = navigator.onLine;
  ui.offlineBadge.classList.toggle("hidden", runtime.isOnline);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker
    .register("./sw.js", { scope: "./" })
    .catch((error) => console.warn("Service worker registration failed.", error));
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.remove("hidden");
  runtime.toastUntil = performance.now() + 2200;
}

function moveEntityToward(entity, targetX, targetY, deltaSeconds) {
  const dx = targetX - entity.x;
  const dy = targetY - entity.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 1) {
    entity.x = targetX;
    entity.y = targetY;
    return true;
  }

  const maxStep = entity.speed * deltaSeconds;
  if (distance <= maxStep) {
    entity.x = targetX;
    entity.y = targetY;
    return true;
  }

  entity.x += (dx / distance) * maxStep;
  entity.y += (dy / distance) * maxStep;
  return false;
}

function moveAlongWaypoints(entity, deltaSeconds) {
  if (!Array.isArray(entity.waypoints) || entity.waypoints.length === 0) {
    return moveEntityToward(entity, entity.targetX, entity.targetY, deltaSeconds);
  }

  const currentWaypoint = entity.waypoints[0];
  const reached = moveEntityToward(entity, currentWaypoint.x, currentWaypoint.y, deltaSeconds);

  if (!reached) {
    return false;
  }

  entity.waypoints.shift();
  if (entity.waypoints.length === 0) {
    entity.targetX = currentWaypoint.x;
    entity.targetY = currentWaypoint.y;
    return true;
  }

  return false;
}

function getTableLayout(id) {
  return TABLE_LAYOUT.find((table) => table.id === id) ?? null;
}

function getTableState(id) {
  return gameState.tables.find((table) => table.id === id) ?? null;
}

function getSeatPosition(tableLayout, seatIndex = 0) {
  return tableLayout.seats[normalizeSeatIndex(seatIndex, tableLayout)] ?? tableLayout.seats[0];
}

function normalizeSeatIndex(value, tableLayout, fallbackX = null) {
  const parsedValue = asNumber(value, NaN);
  if (Number.isInteger(parsedValue) && parsedValue >= 0 && parsedValue < tableLayout.seats.length) {
    return parsedValue;
  }

  if (Number.isFinite(Number(fallbackX))) {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    tableLayout.seats.forEach((seat, seatIndex) => {
      const distance = Math.abs(Number(fallbackX) - seat.x);
      if (distance < nearestDistance) {
        nearestIndex = seatIndex;
        nearestDistance = distance;
      }
    });

    return nearestIndex;
  }

  return 0;
}

function getTableCustomers(tableId) {
  return gameState.customers
    .filter((customer) => customer.tableId === tableId)
    .sort((left, right) => left.seatIndex - right.seatIndex);
}

function getOccupyingTableCustomers(tableId) {
  return getTableCustomers(tableId).filter((customer) => customer.phase !== "walking_out");
}

function getOpenSeatIndex(tableId) {
  const occupiedSeats = new Set(
    getOccupyingTableCustomers(tableId).map((customer) => customer.seatIndex),
  );

  for (let seatIndex = 0; seatIndex < TABLE_CAPACITY; seatIndex += 1) {
    if (!occupiedSeats.has(seatIndex)) {
      return seatIndex;
    }
  }

  return null;
}

function findOpenTableSeat() {
  const openSeats = TABLE_LAYOUT.flatMap((layout) => {
    const seatIndex = getOpenSeatIndex(layout.id);
    return seatIndex === null ? [] : [{ layout, seatIndex }];
  });

  if (openSeats.length === 0) {
    return null;
  }

  return openSeats[Math.floor(Math.random() * openSeats.length)];
}

function getPriorityTableCustomer(tableId, phases) {
  const wantedPhases = Array.isArray(phases) ? phases : [phases];
  const matchingCustomers = getOccupyingTableCustomers(tableId).filter(
    (customer) => wantedPhases.includes(customer.phase),
  );

  if (matchingCustomers.length === 0) {
    return null;
  }

  if (wantedPhases.includes("waiting")) {
    return matchingCustomers.sort((left, right) => {
      if (right.waitElapsed !== left.waitElapsed) {
        return right.waitElapsed - left.waitElapsed;
      }

      return left.seatIndex - right.seatIndex;
    })[0];
  }

  return matchingCustomers.sort((left, right) => {
    if (left.seatIndex !== right.seatIndex) {
      return left.seatIndex - right.seatIndex;
    }

    return left.id - right.id;
  })[0];
}

function findAvailableCustomerType() {
  const activeTypes = new Set(gameState.customers.map((customer) => customer.type));
  const availableTypes = CUSTOMER_TYPES.filter((customerType) => !activeTypes.has(customerType.id));

  if (availableTypes.length === 0) {
    return null;
  }

  return pickWeightedCustomerType(availableTypes);
}

function pickWeightedCustomerType(customerTypes) {
  const totalWeight = customerTypes.reduce(
    (sum, customerType) => sum + customerSpawnWeight(customerType),
    0,
  );

  if (totalWeight <= 0) {
    return customerTypes[0] ?? null;
  }

  let roll = Math.random() * totalWeight;
  for (const customerType of customerTypes) {
    roll -= customerSpawnWeight(customerType);
    if (roll <= 0) {
      return customerType;
    }
  }

  return customerTypes[customerTypes.length - 1] ?? null;
}

function customerSpawnWeight(customerType) {
  return isRareAccessoryCustomerType(customerType.id) ? RARE_ACCESSORY_WEIGHT : 1;
}

function isRareAccessoryCustomerType(customerTypeId) {
  return customerTypeId.includes("_helmet_") || customerTypeId.includes("_mask_");
}

function getShiftPhaseInfo(elapsed = gameState.levelElapsed) {
  const clampedElapsed = clampLevelElapsed(elapsed);
  const phaseIndex = Math.min(
    SHIFT_PHASES.length - 1,
    Math.floor(clampedElapsed / SHIFT_PHASE_DURATION),
  );
  const phase = SHIFT_PHASES[phaseIndex];
  const phaseEnd = (phaseIndex + 1) * SHIFT_PHASE_DURATION;

  return {
    ...phase,
    phaseIndex,
    remainingInPhase: Math.max(0, phaseEnd - clampedElapsed),
    remainingInLevel: Math.max(0, LEVEL_DURATION - clampedElapsed),
  };
}

function getShiftPhaseToast(phase) {
  if (phase.id === "afternoon") {
    return "Afternoon rush started. The light is brighter now.";
  }

  if (phase.id === "evening") {
    return "Evening settled in. The patio light is getting warmer.";
  }

  return "Morning service started.";
}

function currentServeTime() {
  return gameState.serveLevel > 0 ? FAST_SERVE_TIME : BASE_SERVE_TIME;
}

function getSpawnRateMultiplier() {
  if (gameState.weatherState !== "rain") {
    return 1;
  }

  return gameState.umbrellaOwned ? 0.8 : 0.5;
}

function randomSpawnInterval(rateMultiplier) {
  const base = BASE_SPAWN_INTERVAL + randomInRange(-SPAWN_VARIANCE, SPAWN_VARIANCE);
  return Math.max(2.4, base / Math.max(rateMultiplier, 0.2));
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function formatElapsed(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatCountdown(seconds) {
  return formatElapsed(Math.ceil(Math.max(0, seconds)) * 1000);
}

function asNumber(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clampLevelElapsed(value) {
  return Math.max(0, Math.min(LEVEL_DURATION, value));
}

function normalizeTimeOfDay(value, elapsed = 0) {
  if (SHIFT_PHASES.some((phase) => phase.id === value)) {
    return value;
  }

  return getShiftPhaseInfo(elapsed).id;
}

function normalizeLevelSummary(summary) {
  if (!summary || typeof summary !== "object") {
    return null;
  }

  return {
    dayNumber: Math.max(1, asNumber(summary.dayNumber, 1)),
    served: asNumber(summary.served, 0),
    missed: asNumber(summary.missed, 0),
    coinsEarned: asNumber(summary.coinsEarned, 0),
  };
}

function customerLabel(type) {
  return CUSTOMER_TYPES.find((entry) => entry.id === type)?.label ?? "Customer";
}

function parseSaveSource(primaryRaw, backupRaw) {
  if (primaryRaw) {
    try {
      return JSON.parse(primaryRaw);
    } catch (error) {
      console.warn("Primary fallback save is unreadable, trying backup.", error);
    }
  }

  if (backupRaw) {
    try {
      return JSON.parse(backupRaw);
    } catch (error) {
      console.warn("Backup save is unreadable.", error);
    }
  }

  return null;
}

function buildEntryWaypoints(tableLayout, seatIndex = 0) {
  const seat = getSeatPosition(tableLayout, seatIndex);
  return [
    { x: DOOR_INSIDE_X, y: DOOR_INSIDE_Y },
    { x: AISLE_X, y: tableLayout.approachY },
    { x: tableLayout.approachX, y: tableLayout.approachY },
    { x: seat.x, y: seat.y },
  ];
}

function buildExitWaypoints(tableLayout) {
  return [
    { x: tableLayout.approachX, y: tableLayout.approachY },
    { x: AISLE_X, y: tableLayout.approachY },
    { x: DOOR_INSIDE_X, y: DOOR_INSIDE_Y },
    { x: DOOR_OUTSIDE_X, y: DOOR_OUTSIDE_Y },
  ];
}

function normalizeWaypoints(waypoints, tableLayout, phase, seatIndex = 0) {
  if (phase === "walking_out") {
    return buildExitWaypoints(tableLayout);
  }

  if (phase === "walking_to_table") {
    return buildEntryWaypoints(tableLayout, seatIndex);
  }

  if (Array.isArray(waypoints) && waypoints.length > 0) {
    return waypoints
      .filter((point) => point && Number.isFinite(point.x) && Number.isFinite(point.y))
      .map((point) => ({ x: Number(point.x), y: Number(point.y) }));
  }

  return [];
}

function customerAssetSlug(customerType) {
  return customerType.id.replaceAll("_", "-");
}

function buildCustomerBaseAssetPaths() {
  return Object.fromEntries(
    CUSTOMER_TYPES.map((customerType) => [
      customerType.assetId,
      `./public/assets/final/customer-${customerAssetSlug(customerType)}.png`,
    ]),
  );
}

function buildWalkAssetPaths() {
  return Object.fromEntries(
    CUSTOMER_TYPES.flatMap((customerType) =>
      Array.from({ length: WALK_FRAME_COUNT }, (_, frameIndex) => [
        `${customerType.assetId}_walk_${frameIndex}`,
        `./public/assets/final/walk/customer-${customerAssetSlug(customerType)}-walk-${frameIndex}.png`,
      ]),
    ),
  );
}

function buildServedAssetPaths() {
  return Object.fromEntries(
    CUSTOMER_TYPES.map((customerType) => [
      `${customerType.assetId}_served`,
      `./public/assets/final/served/customer-${customerAssetSlug(customerType)}-served.png`,
    ]),
  );
}

function spawnFloatingText({ text, x, y, color }) {
  runtime.floatingTexts.push({
    text,
    x,
    y,
    color,
    age: 0,
    lifetime: 1.4,
  });
}

function updateFloatingTexts(deltaSeconds) {
  runtime.floatingTexts = runtime.floatingTexts
    .map((item) => ({
      ...item,
      age: item.age + deltaSeconds,
    }))
    .filter((item) => item.age < item.lifetime);
}

function exposeDebugState() {
  window.__planBGame = {
    getSnapshot() {
      return {
        mode: runtime.mode,
        saveStatus: runtime.saveStatus,
        tables: structuredClone(gameState.tables),
        customers: structuredClone(gameState.customers),
        stats: structuredClone(gameState.stats),
        coins: gameState.coins,
        score: gameState.score,
        totalServed: gameState.totalServed,
        totalMissed: gameState.totalMissed,
        umbrellaOwned: gameState.umbrellaOwned,
        serveLevel: gameState.serveLevel,
        dayNumber: gameState.dayNumber,
        levelElapsed: gameState.levelElapsed,
        levelComplete: gameState.levelComplete,
        levelServed: gameState.levelServed,
        levelMissed: gameState.levelMissed,
        levelCoinsEarned: gameState.levelCoinsEarned,
        lastLevelSummary: structuredClone(gameState.lastLevelSummary),
        timeOfDay: gameState.timeOfDay,
        levelRemaining: getShiftPhaseInfo(gameState.levelElapsed).remainingInLevel,
        weatherState: gameState.weatherState,
        weatherRemaining: gameState.weatherRemaining,
        layout: structuredClone(TABLE_LAYOUT),
        customerCatalog: CUSTOMER_TYPES.map((customerType) => ({
          id: customerType.id,
          spawnWeight: customerSpawnWeight(customerType),
        })),
      };
    },
  };
}

function createAudioEngine() {
  let audioContext = null;

  function ensureContext() {
    if (audioContext) {
      return audioContext;
    }

    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) {
      return null;
    }

    audioContext = new Context();
    return audioContext;
  }

  function pulse({ frequency, duration, type = "square", gain = 0.02 }) {
    const context = ensureContext();
    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    envelope.gain.value = gain;
    oscillator.connect(envelope);
    envelope.connect(context.destination);
    const now = context.currentTime;
    envelope.gain.setValueAtTime(gain, now);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  return {
    unlock() {
      ensureContext();
    },
    beep(kind) {
      if (kind === "tip") {
        pulse({ frequency: 780, duration: 0.12, gain: 0.03 });
        setTimeout(() => pulse({ frequency: 920, duration: 0.1, gain: 0.025 }), 80);
        return;
      }

      if (kind === "upgrade") {
        pulse({ frequency: 620, duration: 0.16, gain: 0.028 });
        setTimeout(() => pulse({ frequency: 830, duration: 0.12, gain: 0.022 }), 120);
        return;
      }

      if (kind === "rain") {
        pulse({ frequency: 240, duration: 0.22, type: "triangle", gain: 0.02 });
        return;
      }

      if (kind === "tap") {
        pulse({ frequency: 460, duration: 0.08, gain: 0.018 });
        return;
      }

      pulse({ frequency: 540, duration: 0.12, gain: 0.02 });
    },
  };
}
