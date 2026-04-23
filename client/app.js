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
  sessionValue: document.getElementById("session-value"),
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
    sessionStartedAt: now,
    lastSavedAt: now,
    lastSimulatedAt: now,
    audioUnlocked: false,
    nextCustomerId: 1,
    spawnTimer: randomSpawnInterval(1),
    tables: TABLE_LAYOUT.map((table) => ({
      id: table.id,
      status: "empty",
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
    sessionStartedAt: asNumber(saved.sessionStartedAt, base.sessionStartedAt),
    lastSavedAt: asNumber(saved.lastSavedAt, base.lastSavedAt),
    lastSimulatedAt: Date.now(),
    audioUnlocked: Boolean(saved.audioUnlocked),
    nextCustomerId: asNumber(saved.nextCustomerId, base.nextCustomerId),
    spawnTimer: asNumber(saved.spawnTimer, base.spawnTimer),
    stats: {
      dropped: asNumber(saved?.stats?.dropped, base.stats.dropped),
    },
  };

  restored.tables = TABLE_LAYOUT.map((table) => {
    const incoming = Array.isArray(saved.tables)
      ? saved.tables.find((entry) => entry.id === table.id)
      : null;

    return {
      id: table.id,
      status: incoming?.status ?? "empty",
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

  return {
    id: asNumber(customer.id, 0),
    type: customerType.id,
    phase: customer.phase ?? "waiting",
    rainUmbrella: Boolean(customer.rainUmbrella),
    x: asNumber(customer.x, tableLayout.seatX),
    y: asNumber(customer.y, tableLayout.seatY),
    targetX: asNumber(customer.targetX, tableLayout.seatX),
    targetY: asNumber(customer.targetY, tableLayout.seatY),
    waypoints: normalizeWaypoints(customer.waypoints, tableLayout, customer.phase),
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

  updateWeather(deltaSeconds);
  updateSpawning(deltaSeconds);
  updateCustomers(deltaSeconds);
  syncTablesFromCustomers();
  updateFloatingTexts(deltaSeconds);
  updateHud();
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

    if (!table || !tableLayout) {
      customersToRemove.add(customer.id);
      continue;
    }

    if (customer.phase === "walking_to_table") {
      const reachedSeat = moveAlongWaypoints(customer, deltaSeconds);
      if (reachedSeat) {
        customer.phase = "waiting";
        customer.x = tableLayout.seatX;
        customer.y = tableLayout.seatY;
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
        gameState.score = Math.max(0, gameState.score - 1);
        spawnFloatingText({
          text: "Too late",
          x: tableLayout.seatX,
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
    const customer = gameState.customers.find((entry) => entry.id === table.customerId);

    if (!customer) {
      if (table.status !== "empty") {
        table.status = "empty";
      }
      table.customerId = null;
      table.waitElapsed = 0;
      table.serviceElapsed = 0;
      table.enjoyElapsed = 0;
      continue;
    }

    table.customerId = customer.id;

    if (customer.phase === "walking_to_table") {
      table.status = "reserved";
      table.waitElapsed = 0;
      table.serviceElapsed = 0;
      table.enjoyElapsed = 0;
      continue;
    }

    if (customer.phase === "waiting") {
      table.status = "waiting";
      table.waitElapsed = customer.waitElapsed;
      continue;
    }

    if (customer.phase === "being_served") {
      table.status = "serving";
      table.serviceElapsed = customer.serveElapsed;
      continue;
    }

    if (customer.phase === "enjoying") {
      table.status = "enjoying";
      table.enjoyElapsed = customer.enjoyElapsed;
      continue;
    }

    if (customer.phase === "walking_out") {
      table.status = "empty";
      table.customerId = null;
      table.waitElapsed = 0;
      table.serviceElapsed = 0;
      table.enjoyElapsed = 0;
    }
  }
}

function spawnCustomer() {
  const freeTable = findFreeTableLayout();
  if (!freeTable) {
    return false;
  }

  const customerType = findAvailableCustomerType();
  if (!customerType) {
    return false;
  }

  const customerId = gameState.nextCustomerId;
  gameState.nextCustomerId += 1;

  const customer = {
    id: customerId,
    type: customerType.id,
    phase: "walking_to_table",
    rainUmbrella: false,
    x: DOOR_OUTSIDE_X,
    y: DOOR_OUTSIDE_Y,
    targetX: freeTable.seatX,
    targetY: freeTable.seatY,
    waypoints: buildEntryWaypoints(freeTable),
    tableId: freeTable.id,
    speed: 140,
    waitElapsed: 0,
    serveElapsed: 0,
    enjoyElapsed: 0,
    rewardGranted: false,
    tipReward: 0,
  };

  const table = getTableState(freeTable.id);
  table.status = "reserved";
  table.customerId = customerId;
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
  table.status = "empty";
  table.customerId = null;
  table.waitElapsed = 0;
  table.serviceElapsed = 0;
  table.enjoyElapsed = 0;
}

function finishService(customer, table) {
  const waitTime = customer.waitElapsed;
  const tableLayout = getTableLayout(customer.tableId);
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
  customer.rewardGranted = true;
  customer.tipReward = tipGain;
  customer.phase = "enjoying";
  customer.enjoyElapsed = 0;
  table.lastOutcome = tipGain > 0 ? "tipped" : "served";
  runtime.audio.beep(tipGain > 0 ? "tip" : "serve");

  if (tableLayout) {
    spawnFloatingText({
      text: tipGain > 0 ? `+${1 + tipGain} coins / +${1 + scoreGain} pts` : `+1 coin / +${1 + scoreGain} pts`,
      x: tableLayout.seatX,
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

  const customer = gameState.customers.find((entry) => entry.id === table.customerId);
  if (tryPlaceRainUmbrella(tableLayout, customer)) {
    return;
  }

  if (table.status !== "waiting") {
    showToast("That table is not ready to serve.");
    return;
  }

  if (!customer) {
    return;
  }

  customer.phase = "being_served";
  customer.serveElapsed = 0;
  table.status = "serving";
  table.serviceElapsed = 0;
  runtime.audio.beep("tap");
}

function tryPlaceRainUmbrella(tableLayout, customer) {
  if (
    gameState.weatherState !== "rain" ||
    !customer ||
    !["being_served", "enjoying"].includes(customer.phase)
  ) {
    return false;
  }

  if (customer.rainUmbrella) {
    showToast("That table already has rain cover.");
    return true;
  }

  customer.rainUmbrella = true;
  runtime.audio.beep("upgrade");
  showToast(`${customerLabel(customer.type)} is covered from the rain.`);
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

  runtime.mode = "playing";
  runtime.lastFrame = 0;
  runtime.accumulator = 0;
  gameState.audioUnlocked = true;
  runtime.audio.unlock();
  ui.titleOverlay.classList.add("hidden");
  updateOverlay();
  updateHud();
  void persistGameState("start");
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
  if (runtime.mode === "title") {
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
      updateWeather(step);
      updateSpawning(step);
      updateCustomers(step);
      syncTablesFromCustomers();
      updateFloatingTexts(step);
      remaining -= step;
    }
  }

  if (extraIdle > 0) {
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
  void persistGameState("resume");
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

  const centerX = layout.x + layout.width / 2;
  const centerY = layout.y + layout.height / 2;

  ctx.save();
  ctx.strokeStyle = "rgba(255, 248, 214, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX - 6, centerY);
  ctx.lineTo(centerX + 6, centerY);
  ctx.moveTo(centerX, centerY - 6);
  ctx.lineTo(centerX, centerY + 6);
  ctx.stroke();
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
      ctx.fillStyle = "#fff6de";
      ctx.font = '700 12px "Trebuchet MS", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(customerLabel(customer.type), customer.x, drawY - 4);
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
  ui.sessionValue.textContent = formatElapsed(Date.now() - gameState.sessionStartedAt);
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
  if (runtime.mode === "title") {
    ui.titleOverlay.classList.remove("hidden");
    ui.startButton.textContent =
      gameState.totalServed > 0 || gameState.coins > 0 ? "Continue Stall" : "Open Stall";
    ui.overlayCopy.textContent =
      "Tap a table to serve before the countdown hits zero. Quick service earns points and possible tips.";
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

function findFreeTableLayout() {
  const freeTables = TABLE_LAYOUT.filter((layout) => {
    const table = getTableState(layout.id);
    return table && table.status === "empty";
  });

  if (freeTables.length === 0) {
    return null;
  }

  return freeTables[Math.floor(Math.random() * freeTables.length)];
}

function findAvailableCustomerType() {
  const activeTypes = new Set(gameState.customers.map((customer) => customer.type));
  const availableTypes = CUSTOMER_TYPES.filter((customerType) => !activeTypes.has(customerType.id));

  if (availableTypes.length === 0) {
    return null;
  }

  return availableTypes[Math.floor(Math.random() * availableTypes.length)];
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

function asNumber(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
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

function buildEntryWaypoints(tableLayout) {
  return [
    { x: DOOR_INSIDE_X, y: DOOR_INSIDE_Y },
    { x: AISLE_X, y: tableLayout.approachY },
    { x: tableLayout.approachX, y: tableLayout.approachY },
    { x: tableLayout.seatX, y: tableLayout.seatY },
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

function normalizeWaypoints(waypoints, tableLayout, phase) {
  if (phase === "walking_out") {
    return buildExitWaypoints(tableLayout);
  }

  if (phase === "walking_to_table") {
    return buildEntryWaypoints(tableLayout);
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
        weatherState: gameState.weatherState,
        weatherRemaining: gameState.weatherRemaining,
        layout: structuredClone(TABLE_LAYOUT),
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
