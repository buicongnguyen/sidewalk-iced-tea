import * as story from './campaign.mjs';
import * as street from './events.mjs';
const IS_STORY = new URLSearchParams(location.search).get('mode') !== 'classic';
const SAVE_SUFFIX = IS_STORY ? ':story' : '';
const GAME_VERSION = 1;
const SAVE_DB_NAME = "sidewalk-iced-tea-planb" + SAVE_SUFFIX;
const SAVE_STORE_NAME = "saves";
const SAVE_SLOT_KEY = "slot-1";
const ACTIVE_SLOT_POINTER = "sidewalk-iced-tea:active-slot" + SAVE_SUFFIX;
const FALLBACK_SAVE_KEY = "sidewalk-iced-tea:save-fallback" + SAVE_SUFFIX;
const SAVE_BACKUP_KEY = "sidewalk-iced-tea:save-backup" + SAVE_SUFFIX;
const FIXED_STEP = 0.1;
const MAX_CATCH_UP_SECONDS = 30;
const MAX_IDLE_SECONDS = 600;
const IDLE_EFFICIENCY = 0.25;
const DEFAULT_LANGUAGE = "vi";
const MAX_WAIT_SECONDS = IS_STORY ? 40 : 18;
const BASE_SERVE_TIME = 2.5;
const FAST_SERVE_TIME = 1.5;
const BASE_SPAWN_INTERVAL = 6.0;
const SPAWN_VARIANCE = 1.5;
const WEATHER_WINDOW = [45, 75];
const RAIN_DURATION = 20;
const SHIFT_PHASE_DURATION = IS_STORY ? 60 : 45;
const SHIFT_PHASES = [
  { id: "morning", label: "Morning", labelVi: "Sáng" },
  { id: "afternoon", label: "Afternoon", labelVi: "Chiều" },
  { id: "evening", label: "Evening", labelVi: "Tối" },
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

const CUSTOMER_ORDER_LIBRARY = {
  adult: [
    "Cho mình một ly trà nha.",
    "Cho mình xin một ly trà nhé.",
    "Làm giúp mình một ly trà mát nha.",
    "Cho mình ly trà ít ngọt nhé.",
  ],
  older_man: [
    "Cho chú một ly trà nhé.",
    "Cho chú xin ly trà đá nha.",
    "Cho chú một ly trà ít ngọt nhé.",
  ],
  older_woman: [
    "Cho cô một ly trà nhé.",
    "Cho cô xin ly trà mát nha.",
    "Cho cô một ly trà ít đá nhé.",
  ],
  young_boy: [
    "Cho cháu xin một ly trà ạ.",
    "Cho cháu một ly trà mát nhé.",
    "Cho cháu ly trà ít ngọt nha.",
  ],
  young_girl: [
    "Cho cháu xin một ly trà ạ.",
    "Cho cháu một ly trà mát nha.",
    "Cho cháu ly trà ít đá nhé.",
  ],
};

document.documentElement.lang = DEFAULT_LANGUAGE;
document.title=IS_STORY?'Trà Đá Vỉa Hè - Chuyện Góc Phố':'Trà Đá Vỉa Hè - Classic';
document.body.classList.toggle('story-mode', IS_STORY);

const BASE_ASSET_PATHS = {
  bg_room: "./public/assets/final/bg-room.png",
  stall_counter: "./public/assets/final/stall-counter.png",
  table_slot: "./public/assets/final/table-slot.png",
};

const ASSET_PATHS = {
  ...BASE_ASSET_PATHS,
  ...(IS_STORY?Object.fromEntries(street.PORTRAITS.map(name=>['event_'+name,`./public/assets/3d/events/${name}.png`])):{}),
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
  ready: false,
  settingsOpen: false,
  eventOpen: false,
  sceneTimestamp: 0,
  selectedCustomerId: null,
  selectedBatchId: null,
  view3d: false,
  scene3d: null,
  mode: "title",
  assets: new Map(),
  db: null,
  paletteCache: new WeakMap(),
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
  showToast("Mở game chưa xong, tải lại giúp mình nhé.");
});

async function init() {
  bindEvents();
  await loadAssets();
  await initStorage();
  const loadedState = await loadGameState();
  if (loadedState) {
    gameState = restoreState(loadedState);
  }

  runtime.ready=true;
  document.getElementById('settings-button').disabled=false;
  ui.startButton.disabled=false;
  updateOverlay();
  updateHud();
  updateOnlineState();
  exposeDebugState();
  registerServiceWorker();
  requestAnimationFrame(frameLoop);
  if (IS_STORY && new URLSearchParams(location.search).get('view')!=='2d') {
    document.getElementById('view-mode').value='3d';
    void changeView();
  }
}

function bindEvents() {
  bindSettings();
  bindStoryControls();
  bindStreetControls();
  ui.canvas.addEventListener("pointerdown", handleCanvasPointer);
  document.getElementById("view-mode").addEventListener("change", changeView);
  document.getElementById("view-zoom").addEventListener("input", event => runtime.scene3d?.setZoom(event.target.value));
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
    showToast("Cài xong rồi, giờ có thể mở như ứng dụng.");
  });
}

function buildTableLayout() {
  if (IS_STORY) return [[360,190],[640,190],[500,350]].map(([x,y],index)=>({
    id:`table-story-${index}`,index,row:index===2?1:0,column:index,x,y,width:132,height:66,
    approachX:AISLE_X,approachY:y+78,seatX:x+66,seatY:y+88,
    seats:[{x:x+38,y:y+88},{x:x+94,y:y+88}],
  }));
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
    saveRevision: 0,
    campaign: IS_STORY ? story.createCampaign() : undefined,
    street: IS_STORY ? street.createStreet() : undefined,
    score: 0,
    tipCoins: 0,
    totalServed: 0,
    totalMissed: 0,
    serveLevel: 0,
    umbrellaOwned: false,
    weatherState: "clear",
    weatherRemaining: 0,
    nextWeatherRollIn: IS_STORY ? 60 : randomInRange(...WEATHER_WINDOW),
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
    spawnTimer: IS_STORY ? 2 : randomSpawnInterval(1),
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
    campaign: IS_STORY ? story.createCampaign(saved.campaign) : undefined,
    street: IS_STORY ? street.createStreet(saved.street) : undefined,
    saveRevision: Math.max(0,Math.floor(asNumber(saved.saveRevision,0))),
    coins: Math.max(0,asNumber(saved.coins, base.coins)),
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

  if (IS_STORY) {
    restored.dayNumber=Math.floor(Math.max(1,Math.min(1000000,restored.dayNumber)));
    const occupied=new Set(),ids=new Set();
    restored.customers=restored.customers.filter(customer=>{
      const seat=`${customer.tableId}:${customer.seatIndex}`;
      if(customer.id<1||!Number.isInteger(customer.id)||ids.has(customer.id)||!['walking_to_table','waiting','being_served','enjoying','walking_out'].includes(customer.phase))return false;
      if(customer.phase!=='walking_out'&&occupied.has(seat))return false;
      if(customer.phase!=='walking_out')occupied.add(seat);
      ids.add(customer.id);return true;
    });
    restored.nextCustomerId=Math.max(restored.nextCustomerId,...restored.customers.map(c=>c.id+1));
    restored.campaign.batches=restored.campaign.batches.filter(batch=>story.DRINKS[batch.drink].day<=restored.dayNumber);
    for(const customer of restored.customers) {
      if(story.DRINKS[customer.order.drink].day>restored.dayNumber)customer.order=story.recipe();
      if(restored.dayNumber<2)customer.order.ice='normal';
      if(restored.dayNumber<3||customer.order.drink==='tea')customer.order.sugar='normal';
      if(restored.dayNumber<3)customer.order.regularId=null;
      customer.orderText=story.orderText(customer.order);
    }
  }
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
    orderText: normalizeOrderText(customer.orderText, customerType.id),
    rewardGranted: Boolean(customer.rewardGranted),
    tipReward: asNumber(customer.tipReward, 0),
    order: IS_STORY ? {...story.recipe(customer.order),regularId:story.REGULARS[customer.order?.regularId]?customer.order.regularId:null} : undefined,
    rejectedBatches: Array.isArray(customer.rejectedBatches)?customer.rejectedBatches.filter(Number.isInteger):[],
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
      try { data = await idbGet(runtime.db, SAVE_SLOT_KEY); } catch(error) { console.warn('Reading recovery checkpoint after IndexedDB failure.',error); }
    }

    const candidates=[data];
    try { candidates.push(parseSaveSource(localStorage.getItem(FALLBACK_SAVE_KEY),null),parseSaveSource(localStorage.getItem(SAVE_BACKUP_KEY),null)); } catch {}
    const available=candidates.filter(Boolean);
    available.sort((a,b)=>(asNumber(b.saveRevision,0)-asNumber(a.saveRevision,0))||(asNumber(b.lastSavedAt,0)-asNumber(a.lastSavedAt,0)));
    data=available[0]??null;

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
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error||new Error('Save transaction aborted'));
    request.onerror = () => reject(request.error);
  });
}

async function persistGameState(reason = "autosave") {
  // Lifecycle events must not checkpoint defaults before the saved game is loaded.
  if(!runtime.ready)return;
  gameState.saveRevision+=1;
  gameState.lastSavedAt=Date.now();
  // A navigation may cancel IndexedDB work. Checkpoint the command synchronously.
  try { localStorage.setItem(SAVE_BACKUP_KEY,JSON.stringify(gameState)); } catch {}
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
  try {
    const serializableState = structuredClone(gameState);

    if (runtime.storageMode === "indexeddb" && runtime.db) {
      await idbPut(runtime.db, SAVE_SLOT_KEY, serializableState);
    }

    const checkpoint=parseSaveSource(localStorage.getItem(SAVE_BACKUP_KEY),null);
    if(!checkpoint||asNumber(checkpoint.saveRevision,0)<=serializableState.saveRevision) {
      localStorage.setItem(FALLBACK_SAVE_KEY, JSON.stringify(serializableState));
      localStorage.setItem(SAVE_BACKUP_KEY, JSON.stringify(serializableState));
    }
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

  if (runtime.mode === "playing" && !runtime.settingsOpen && !runtime.eventOpen && !document.hidden) {
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
  if (IS_STORY) {
    if(street.tickStreet(gameState,deltaSeconds))void persistGameState('street-tick');
    const completed=story.advancePreparation(gameState.campaign,deltaSeconds);
    if(completed.length) {
      runtime.audio.beep('ready');
      storyFeedback(`${story.DRINKS[completed[0].drink].name} đã sẵn sàng.`);
      void persistGameState('ready');
    }
  }
  updateSpawning(deltaSeconds);
  updateCustomers(deltaSeconds);
  syncTablesFromCustomers();
  updateFloatingTexts(deltaSeconds);
  updateHud();
  if (IS_STORY && gameState.campaign.closing && gameState.customers.length===0) completeLevel();
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
    if (IS_STORY) { gameState.campaign.closing=true; return false; }
    completeLevel();
    return true;
  }

  return false;
}

function completeLevel() {
  if (gameState.levelComplete) return;
  const bonus = gameState.levelServed >= dailyTarget() ? 5 : 0;
  gameState.coins += bonus;
  gameState.levelCoinsEarned += bonus;
  const summary = {
    bonus,
    dayNumber: gameState.dayNumber,
    served: gameState.levelServed,
    missed: gameState.levelMissed,
    coinsEarned: gameState.levelCoinsEarned,
  };

  if (IS_STORY) {
    summary.stars=story.dayStars(gameState.campaign,gameState.levelServed,gameState.levelMissed,gameState.dayNumber);
    if(gameState.dayNumber<=5)gameState.campaign.stars[gameState.dayNumber-1]=summary.stars;
    gameState.campaign.batches=[];
  }
  gameState.levelComplete = true;
  gameState.levelElapsed = LEVEL_DURATION;
  gameState.timeOfDay = SHIFT_PHASES[SHIFT_PHASES.length - 1].id;
  gameState.lastLevelSummary = summary;

  clearLevelBoard();
  runtime.mode = "title";
  runtime.lastFrame = 0;
  runtime.accumulator = 0;
  runtime.autoSaveTimer = 0;
  showToast(`Ngày ${summary.dayNumber} đã kết thúc. Thưởng mục tiêu: ${bonus} xu.`);
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
  showToast(`Bắt đầu buổi sáng ngày ${gameState.dayNumber}.`);
  updateOverlay();
  updateHud();
  void persistGameState(gameState.dayNumber === 1 ? "start" : "next-day");
}

function resetLevelProgress() {
  if (IS_STORY) story.resetDay(gameState.campaign);
  runtime.selectedCustomerId=null;runtime.selectedBatchId=null;
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
  gameState.spawnTimer = IS_STORY ? 2 : randomSpawnInterval(1);
  if (IS_STORY) gameState.nextWeatherRollIn=gameState.dayNumber>=4?60:9999;
  if (IS_STORY) street.tickStreet(gameState,0);
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
  if (IS_STORY && gameState.dayNumber<4) return;
  if (gameState.weatherState === "rain") {
    gameState.weatherRemaining = Math.max(0, gameState.weatherRemaining - deltaSeconds);
    if (gameState.weatherRemaining <= 0) {
      gameState.weatherState = "clear";
      gameState.nextWeatherRollIn = IS_STORY ? 70 : randomInRange(...WEATHER_WINDOW);
      showToast("Hết mưa rồi, khách lại đông hơn.");
    }
    return;
  }

  gameState.nextWeatherRollIn -= deltaSeconds;
  if (gameState.nextWeatherRollIn <= 0) {
    gameState.weatherState = "rain";
    gameState.weatherRemaining = RAIN_DURATION;
    gameState.nextWeatherRollIn = IS_STORY ? 70 : randomInRange(...WEATHER_WINDOW);
    runtime.audio.beep("rain");
    showToast(gameState.umbrellaOwned ? "Mưa nhẹ thôi, ô che vẫn ổn." : "Mưa làm khách thưa đi một chút.");
  }
}

function updateSpawning(deltaSeconds) {
  if (IS_STORY && gameState.campaign.closing) return;
  gameState.spawnTimer -= deltaSeconds;

  if (gameState.spawnTimer > 0) {
    return;
  }

  if (!spawnCustomer()) {
    gameState.stats.dropped += 1;
    gameState.spawnTimer = IS_STORY ? 3 : randomSpawnInterval(getSpawnRateMultiplier());
    return;
  }

  gameState.spawnTimer = IS_STORY ? (8+story.random(gameState.campaign)*3)/getSpawnRateMultiplier() : randomSpawnInterval(getSpawnRateMultiplier());
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
        if(IS_STORY)gameState.campaign.streak=0;
        gameState.score = Math.max(0, gameState.score - 1);
        spawnFloatingText({
          text: IS_STORY ? "Hẹn lần sau" : "Too late",
          x: seat.x,
          y: tableLayout.y - 10,
          color: "#ffd5d5",
        });
        showToast(`${customerLabel(customer.type)} chờ lâu quá nên đi mất rồi.`);
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
      if (customer.enjoyElapsed >= (IS_STORY?5:2.4)) {
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

  const order = IS_STORY ? story.makeOrder(gameState.campaign,gameState.dayNumber) : null;
  const regularType = story.REGULARS[order?.regularId]?.type;
  const customerType = regularType && !gameState.customers.some(c=>c.type===regularType)
    ? CUSTOMER_TYPES.find(type=>type.id===regularType) : findAvailableCustomerType();
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
    orderText: IS_STORY ? story.orderText(order) : buildCustomerOrderText(customerType.id),
    order,
    rewardGranted: false,
    tipReward: 0,
  };

  if(IS_STORY)customer.orderText=story.orderText(order);
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
  if (customer.rewardGranted) return;
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

  let basePrice=1;
  if (IS_STORY) {
    tipGain=(waitTime<=12?1:0)+(gameState.campaign.streak%3===0?1:0);
    if(gameState.street.trust>=4&&gameState.campaign.streak%3===0)tipGain++;
    scoreGain=gameState.campaign.streak;
    basePrice=story.DRINKS[customer.order.drink].price;
  }
  gameState.coins += basePrice + tipGain;
  gameState.tipCoins += tipGain;
  gameState.score += 1 + scoreGain;
  gameState.totalServed += 1;
  gameState.levelServed += 1;
  gameState.levelCoinsEarned += basePrice + tipGain;
  customer.rewardGranted = true;
  customer.tipReward = tipGain;
  customer.phase = "enjoying";
  customer.enjoyElapsed = 0;
  table.lastOutcome = tipGain > 0 ? "tipped" : "served";
  runtime.audio.beep(tipGain > 0 ? "tip" : "serve");

  if (seat && tableLayout) {
    spawnFloatingText({
      text: tipGain > 0 ? `+${basePrice + tipGain} xu / +${1 + scoreGain} điểm` : `+${basePrice} xu / +${1 + scoreGain} điểm`,
      x: seat.x,
      y: tableLayout.y - 14,
      color: tipGain > 0 ? "#fff2a8" : "#dcffe1",
    });
  }

  const toastMessage =
    tipGain > 0
      ? `${customerLabel(customer.type)} vui vẻ nên boa thêm cho quán.`
      : `${customerLabel(customer.type)} đã nhận trà rồi.`;
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

  serveTable(tableLayout.id);
}

function serveTable(tableId) {
  if(runtime.settingsOpen||runtime.eventOpen)return;
  if (runtime.mode !== "playing") return;
  const tableLayout = getTableLayout(tableId);
  if (!tableLayout) return;
  const table = getTableState(tableLayout.id);
  if (!table) {
    return;
  }

  const waitingCustomer = getPriorityTableCustomer(tableLayout.id, "waiting");
  if(IS_STORY && waitingCustomer) {
    runtime.selectedCustomerId=waitingCustomer.id;
    updateHud();
    return;
  }
  if (!waitingCustomer) {
    if (tryPlaceRainUmbrella(tableLayout, getOccupyingTableCustomers(tableLayout.id))) {
      return;
    }

    showToast("Bàn này chưa sẵn để phục vụ.");
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
    showToast("Bàn này đã có ô che mưa rồi.");
    return true;
  }

  uncoveredCustomers.forEach((customer) => {
    customer.rainUmbrella = true;
  });
  runtime.audio.beep("upgrade");
  showToast(
    uncoveredCustomers.length > 1
      ? `Khách ở bàn T${tableLayout.index + 1} đã được che mưa.`
      : `${customerLabel(uncoveredCustomers[0].type)} đã được che mưa.`,
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
  if (!runtime.ready || runtime.settingsOpen) return;
  if (runtime.mode === "playing") {
    return;
  }

  if (runtime.mode === "paused") {
    runtime.mode = "playing";
    runtime.lastFrame = 0;
    ui.titleOverlay.classList.add("hidden");
    showToast("Bán tiếp thôi.");
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
  if(IS_STORY && (runtime.mode!=='playing' && runtime.mode!=='title'))return;
  if (runtime.mode === "title" && !gameState.levelComplete && !runtime.settingsOpen) {
    handleStartButton();
  }

  if (kind === "faster_serve") {
    if (gameState.serveLevel > 0) {
      showToast("Đã mua Pha nhanh rồi.");
      return;
    }

    if (gameState.coins < 10) {
      showToast("Cần 10 xu để mua Pha nhanh.");
      return;
    }

    gameState.coins -= 10;
    gameState.serveLevel = 1;
    runtime.audio.beep("upgrade");
    showToast("Đã mở Pha nhanh.");
    void persistGameState("upgrade");
    updateHud();
    return;
  }

  if (kind === "umbrella") {
    if (gameState.umbrellaOwned) {
      showToast("Quán đã có ô che rồi.");
      return;
    }

    if (gameState.coins < 20) {
      showToast("Cần 20 xu để mua ô che.");
      return;
    }

    gameState.coins -= 20;
    gameState.umbrellaOwned = true;
    runtime.audio.beep("upgrade");
    showToast("Ô che đã sẵn sàng. Mưa sẽ đỡ ảnh hưởng hơn.");
    void persistGameState("upgrade");
    updateHud();
  }
}

function togglePause() {
  if (runtime.settingsOpen || runtime.eventOpen) return;
  if (runtime.mode === "title") {
    return;
  }

  if (runtime.mode === "paused") {
    runtime.mode = "playing";
    runtime.lastFrame = 0;
    ui.titleOverlay.classList.add("hidden");
    showToast("Bán tiếp thôi.");
  } else {
    runtime.mode = "paused";
    updateOverlay();
    showToast("Tạm nghỉ một chút.");
  }

  updateOverlay();
  updateHud();
}

async function resetSave() {
  const confirmed = window.confirm("Xóa dữ liệu lưu cục bộ của quán này nhé?");
  if (!confirmed) {
    return;
  }

  const revision=gameState.saveRevision;
  gameState = createDefaultState();
  gameState.saveRevision=revision;
  runtime.mode = "title";
  runtime.lastFrame = 0;
  runtime.accumulator = 0;
  updateOverlay();
  updateHud();
  await persistGameState("reset");
  showToast("Đã xóa dữ liệu. Quán quay về từ đầu rồi.");
}

async function handleVisibilityChange() {
  if (document.hidden) {
    runtime.hiddenStartedAt = Date.now();
    runtime.lastFrame = 0;
    runtime.accumulator = 0;
    await persistGameState("hidden");
    return;
  }

  if (!runtime.hiddenStartedAt || runtime.mode !== "playing" || runtime.settingsOpen || runtime.eventOpen) {
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
  if (IS_STORY) return;
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
      showToast(`Cộng dồn lúc vắng: +${estimatedCoins} xu.`);
    }
  }

  updateHud();
  if (runtime.mode === "playing") {
    void persistGameState("resume");
  }
}

function renderScene(timestamp) {
  if (!runtime.sceneTimestamp || (runtime.mode === 'playing' && !runtime.settingsOpen && !runtime.eventOpen)) runtime.sceneTimestamp=timestamp;
  if (runtime.view3d && runtime.scene3d) {
    runtime.scene3d.render(gameState, timestamp, runtime.mode === "playing" && !runtime.settingsOpen && !runtime.eventOpen);
    renderToast();
    return;
  }
  ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  drawRoom();
  drawTables();
  drawCustomers(runtime.sceneTimestamp);
  if(IS_STORY&&gameState.street.active&&!gameState.levelComplete) {
    const asset=street.presentation(gameState.street).portrait;
    const sprite=runtime.assets.get('event_'+asset);
    if(sprite)ctx.drawImage(sprite,250,326,180,150);
  }
  drawFloatingTexts();

  if (gameState.weatherState === "rain") {
    drawRainOverlay(runtime.sceneTimestamp);
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
      if (customer.phase !== "enjoying") {
        drawCuplessHandOverlay(image, drawX, drawY);
      }
    } else {
      ctx.fillStyle = "#f5cab0";
      ctx.fillRect(drawX + 16, drawY + 12, 24, 18);
      ctx.fillStyle = "#5277a5";
      ctx.fillRect(drawX + 12, drawY + 30, 32, 24);
    }

    if (customer === getPriorityTableCustomer(customer.tableId, ["waiting", "being_served"])) {
      const bubbleOffsetX = customer.seatIndex === 0 ? -20 : 22;
      const bubbleOffsetY = customer.seatIndex === 0 ? -30 : -44;
      drawOrderBubble(
        customer.x + bubbleOffsetX,
        drawY + bubbleOffsetY,
        customer.orderText,
        customer.phase === "being_served" ? "Đang pha" : "Gọi món",
      );
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

function drawCuplessHandOverlay(image, drawX, drawY) {
  const palette = getSpritePalette(image);
  const outline = shadeHexColor(palette.outerwear, -0.22);
  const cuff = shadeHexColor(palette.outerwear, -0.08);

  ctx.save();
  ctx.translate(drawX, drawY);

  ctx.fillStyle = palette.innerwear;
  ctx.beginPath();
  ctx.moveTo(13, 21);
  ctx.lineTo(22, 18);
  ctx.lineTo(26, 24);
  ctx.lineTo(25, 38);
  ctx.lineTo(18, 48);
  ctx.lineTo(11, 43);
  ctx.lineTo(12, 30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = palette.outerwear;
  ctx.beginPath();
  ctx.moveTo(9, 22);
  ctx.lineTo(18, 18);
  ctx.lineTo(24, 22);
  ctx.lineTo(26, 31);
  ctx.lineTo(24, 42);
  ctx.lineTo(17, 46);
  ctx.lineTo(8, 41);
  ctx.lineTo(7, 30);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.25;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(10, 23);
  ctx.lineTo(17, 20);
  ctx.lineTo(23, 23);
  ctx.lineTo(24, 31);
  ctx.lineTo(22, 40);
  ctx.lineTo(16, 44);
  ctx.lineTo(9, 40);
  ctx.lineTo(8, 30);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = cuff;
  ctx.fillRect(8, 34, 8, 7);

  ctx.fillStyle = palette.skin;
  ctx.beginPath();
  ctx.ellipse(13.5, 37.5, 5.7, 6.3, -0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = shadeHexColor(palette.skin, -0.18);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, 34);
  ctx.lineTo(17.5, 40);
  ctx.lineTo(13.5, 44);
  ctx.lineTo(9.5, 41);
  ctx.stroke();

  ctx.restore();
}

function getSpritePalette(image) {
  const cachedPalette = runtime.paletteCache.get(image);
  if (cachedPalette) {
    return cachedPalette;
  }

  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = image.naturalWidth || image.width;
  sampleCanvas.height = image.naturalHeight || image.height;
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleContext.drawImage(image, 0, 0);

  const palette = {
    outerwear: sampleRegionColor(sampleContext, 152, 120, 20, 26, "#8c775e"),
    innerwear: sampleRegionColor(sampleContext, 114, 116, 22, 28, "#f1e1c7"),
    skin: sampleRegionColor(sampleContext, 58, 122, 18, 22, "#f0c6a9"),
  };

  runtime.paletteCache.set(image, palette);
  return palette;
}

function sampleRegionColor(context, x, y, width, height, fallbackHex) {
  const safeX = Math.max(0, Math.floor(x));
  const safeY = Math.max(0, Math.floor(y));
  const safeWidth = Math.max(1, Math.floor(width));
  const safeHeight = Math.max(1, Math.floor(height));
  const imageData = context.getImageData(safeX, safeY, safeWidth, safeHeight).data;

  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let index = 0; index < imageData.length; index += 4) {
    const alpha = imageData[index + 3];
    if (alpha < 24) {
      continue;
    }

    red += imageData[index];
    green += imageData[index + 1];
    blue += imageData[index + 2];
    count += 1;
  }

  if (count === 0) {
    return fallbackHex;
  }

  return rgbToHex(
    Math.round(red / count),
    Math.round(green / count),
    Math.round(blue / count),
  );
}

function shadeHexColor(hexColor, amount) {
  const [red, green, blue] = hexToRgb(hexColor);
  const applyShade = (value) =>
    Math.max(0, Math.min(255, Math.round(
      amount >= 0
        ? value + ((255 - value) * amount)
        : value * (1 + amount),
    )));

  return rgbToHex(applyShade(red), applyShade(green), applyShade(blue));
}

function hexToRgb(hexColor) {
  const normalized = hexColor.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
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
  ctx.fillText("Tạm dừng", BOARD_WIDTH / 2, BOARD_HEIGHT / 2);
  ctx.font = '600 18px "Trebuchet MS", sans-serif';
  ctx.fillText("Nhấn Bán tiếp để mở quán lại.", BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 32);
  ctx.restore();
}

function renderToast() {
  if (runtime.toastUntil <= performance.now()) {
    ui.toast.classList.add("hidden");
  }
}

function updateHud() {
  const waiting = gameState.customers.filter(customer => customer.phase === "waiting")
    .sort((a, b) => b.waitElapsed - a.waitElapsed)[0];
  document.getElementById("order-caption").textContent = waiting
    ? `Bàn ${getTableLayout(waiting.tableId).index + 1}: ${waiting.orderText}` : "";
  const busyTables = gameState.tables.filter((table) => table.status !== "empty").length;
  const shiftPhase = getShiftPhaseInfo(gameState.levelElapsed);

  ui.coinsValue.textContent = compactNumber(gameState.coins);
  ui.coinsValue.parentElement.setAttribute('aria-label',`${gameState.coins} xu`);
  ui.scoreValue.textContent = String(gameState.score);
  ui.servedValue.textContent = IS_STORY ? `${compactNumber(gameState.levelServed)}/${dailyTarget()}` : compactNumber(gameState.totalServed);
  document.getElementById('served-status').setAttribute('aria-label',IS_STORY ? `Đã phục vụ ${gameState.levelServed} trên ${dailyTarget()} khách` : `Đã phục vụ ${gameState.totalServed} khách`);
  ui.tipsValue.textContent = String(gameState.tipCoins);
  ui.weatherValue.textContent =
    gameState.weatherState === "rain"
      ? `${Math.ceil(gameState.weatherRemaining)}s`
      : "Nắng";
  const weatherIcon=document.getElementById('weather-icon');
  weatherIcon.src=`./vendor/lucide/icons/${gameState.weatherState==='rain'?'cloud-rain':'sun'}.svg`;
  ui.weatherValue.parentElement.title=gameState.weatherState==='rain'?`Mưa còn ${Math.ceil(gameState.weatherRemaining)} giây`:'Trời nắng';
  ui.weatherValue.parentElement.setAttribute('aria-label',ui.weatherValue.parentElement.title);
  ui.tablesValue.textContent = `${busyTables} / ${TABLE_LAYOUT.length}`;
  ui.flowValue.textContent = `${gameState.levelServed}/${dailyTarget()} khách (+5 xu)`;
  ui.saveValue.textContent = formatSaveStatus(runtime.saveStatus);
  ui.shiftLabel.textContent = `Ngày ${gameState.dayNumber}`;
  ui.shiftValue.textContent = gameState.levelComplete
    ? "Hoàn tất"
    : `${shiftPhase.labelVi} ${formatCountdown(shiftPhase.remainingInPhase)}`;
  if(!IS_STORY) {
    document.getElementById('chapter-title').textContent=`Ngày ${compactNumber(gameState.dayNumber)}`;
    document.getElementById('hud-time').textContent=ui.shiftValue.textContent;
  }
  const paused=runtime.mode==='paused';
  ui.pauseButton.querySelector('img').src=`./vendor/lucide/icons/${paused?'play':'pause'}.svg`;
  ui.pauseButton.title=paused?'Bán tiếp':'Tạm dừng';
  ui.pauseButton.setAttribute('aria-label',ui.pauseButton.title);
  ui.pauseButton.disabled=runtime.mode==='title'||gameState.levelComplete;

  ui.upgradeServe.disabled = gameState.serveLevel > 0 || gameState.coins < 10;
  ui.upgradeServe.innerHTML =
    gameState.serveLevel > 0
      ? 'Pha nhanh<small>đã mua</small>'
      : 'Pha nhanh<small>10 xu</small>';

  ui.upgradeUmbrella.disabled = gameState.umbrellaOwned || gameState.coins < 20;
  ui.upgradeUmbrella.innerHTML =
    gameState.umbrellaOwned
      ? 'Ô che<small>đã mua</small>'
      : 'Ô che<small>20 xu</small>';

  if(IS_STORY)updateStoryHud();
  updateOverlay();
}

function updateOverlay() {
  if(IS_STORY) {
    const chapter=story.chapter(gameState.dayNumber);
    const show=runtime.mode==='title'||runtime.mode==='paused'||gameState.levelComplete;
    ui.titleOverlay.classList.toggle('hidden',!show);
    document.getElementById('game-subtitle').textContent=`Ngày ${gameState.dayNumber} · ${chapter.title}`;
    if(gameState.levelComplete) {
      const stars=gameState.lastLevelSummary?.stars??gameState.campaign.stars[Math.min(4,gameState.dayNumber-1)]??0;
      const regular=gameState.campaign.visited.length>0;
      const ending=gameState.dayNumber>=3&&!regular?'Hôm nay khách quen chưa nhận được ly nước đúng ý. Ngày mai mình lại thử nhé.':chapter.ending;
      ui.overlayCopy.textContent=`${stars}/3 sao · ${gameState.levelServed} khách · ${gameState.levelMissed} lỡ · +${gameState.lastLevelSummary?.bonus||0} xu thưởng. ${ending}`;
      ui.startButton.textContent=gameState.dayNumber>=5?'Ngày mới ở góc phố':`Mở ngày ${gameState.dayNumber+1}`;
    } else if(runtime.mode==='paused') {
      ui.overlayCopy.textContent='Quán tạm nghỉ. Khách và các ly đang pha sẽ đợi bạn.';
      ui.startButton.textContent='Bán tiếp';
    } else {
      ui.overlayCopy.textContent=chapter.intro;
      ui.startButton.textContent=gameState.levelElapsed>0?'Tiếp tục ca':'Mở quán';
    }
    return;
  }
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
    ui.startButton.textContent = `Mở Ngày ${nextDay}`;
    ui.overlayCopy.textContent =
      `Ngày ${summary.dayNumber}: phục vụ ${summary.served}, lỡ ${summary.missed}, thu ${summary.coinsEarned} xu. Thưởng mục tiêu: ${summary.bonus ?? 0} xu.`;
    return;
  }

  if (runtime.mode === "title") {
    ui.titleOverlay.classList.remove("hidden");
    ui.startButton.textContent =
      gameState.levelElapsed > 0 || gameState.totalServed > 0 || gameState.coins > 0
        ? `Tiếp tục Ngày ${gameState.dayNumber}`
        : `Mở Ngày ${gameState.dayNumber}`;
    ui.overlayCopy.textContent =
      gameState.levelElapsed > 0
        ? `Ngày ${gameState.dayNumber} đang ở buổi ${shiftPhase.labelVi.toLowerCase()}. Còn ${formatCountdown(shiftPhase.remainingInLevel)} trước khi khép ngày.`
        : "Mỗi ngày sẽ đi từ sáng sang chiều rồi tới tối. Chạm vào bàn để phục vụ trước khi đồng hồ chờ và đồng hồ ca bán hết giờ.";
    return;
  }

  if (runtime.mode === "paused") {
    ui.titleOverlay.classList.remove("hidden");
    ui.startButton.textContent = "Tiếp tục ca";
    ui.overlayCopy.textContent =
      "Quán đang tạm dừng. Khi sẵn sàng thì mở lại để khách tiếp tục vào bàn.";
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

  return openSeats[Math.floor((IS_STORY?story.random(gameState.campaign):Math.random()) * openSeats.length)];
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
  const reservedTypes=IS_STORY?Object.values(story.REGULARS).map(regular=>regular.type):[];
  const availableTypes = CUSTOMER_TYPES.filter((customerType) => !activeTypes.has(customerType.id)&&!reservedTypes.includes(customerType.id));

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

  let roll = (IS_STORY?story.random(gameState.campaign):Math.random()) * totalWeight;
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
    return "Qua buổi chiều rồi, ánh sáng sáng hơn một chút.";
  }

  if (phase.id === "evening") {
    return "Sang buổi tối, ánh đèn bắt đầu ấm hơn.";
  }

  return "Bắt đầu buổi sáng rồi.";
}

function currentServeTime() {
  if(IS_STORY)return .2;
  return gameState.serveLevel > 0 ? FAST_SERVE_TIME : BASE_SERVE_TIME;
}

function getSpawnRateMultiplier() {
  if (IS_STORY) {
    const rush=gameState.timeOfDay==='afternoon'?1.5:1;
    return rush*gameState.street.modifier.value*(gameState.weatherState==='rain'?(gameState.umbrellaOwned?1:.65):1);
  }
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
    stars: Math.max(0,Math.min(3,asNumber(summary.stars,0))),
    bonus: Math.max(0, asNumber(summary.bonus, 0)),
    dayNumber: Math.max(1, asNumber(summary.dayNumber, 1)),
    served: asNumber(summary.served, 0),
    missed: asNumber(summary.missed, 0),
    coinsEarned: asNumber(summary.coinsEarned, 0),
  };
}

function customerLabel(type) {
  const customerType = CUSTOMER_TYPES.find((entry) => entry.id === type);
  if (!customerType) {
    return "Khách";
  }

  if (customerType.id.includes("old_man")) {
    return "Chú khách";
  }
  if (customerType.id.includes("old_woman")) {
    return "Cô khách";
  }
  if (customerType.id.includes("young_boy")) {
    return "Bé trai";
  }
  if (customerType.id.includes("young_girl")) {
    return "Bé gái";
  }
  if (customerType.id.includes("woman")) {
    return "Khách nữ";
  }

  return "Khách nam";
}

function customerOrderProfile(type) {
  if (type.includes("old_man")) {
    return "older_man";
  }
  if (type.includes("old_woman")) {
    return "older_woman";
  }
  if (type.includes("young_boy")) {
    return "young_boy";
  }
  if (type.includes("young_girl")) {
    return "young_girl";
  }

  return "adult";
}

function buildCustomerOrderText(type) {
  const profile = customerOrderProfile(type);
  const templates = CUSTOMER_ORDER_LIBRARY[profile] ?? CUSTOMER_ORDER_LIBRARY.adult;
  return templates[Math.floor(Math.random() * templates.length)];
}

function normalizeOrderText(orderText, type) {
  return typeof orderText === "string" && orderText.trim().length > 0
    ? orderText.trim()
    : buildCustomerOrderText(type);
}

function splitOrderText(orderText, maxChars = 18) {
  if (typeof orderText !== "string" || orderText.trim().length === 0) {
    return [];
  }

  const words = orderText.trim().split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxChars || currentLine.length === 0) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length <= 2) {
    return lines;
  }

  return [lines[0], lines.slice(1).join(" ")];
}

function formatSaveStatus(status) {
  switch (status) {
    case "booting":
      return "đang mở";
    case "ready":
      return "sẵn sàng";
    case "loaded":
      return "đã tải";
    case "recovered":
      return "đã khôi phục";
    case "saved":
      return "đã lưu";
    case "fallback":
      return "lưu dự phòng";
    case "save error":
      return "lỗi lưu";
    case "start":
      return "bắt đầu";
    case "continue":
      return "tiếp tục";
    case "upgrade":
      return "nâng cấp";
    case "hidden":
      return "ẩn nền";
    case "resume":
      return "trở lại";
    case "pagehide":
      return "rời trang";
    case "reset":
      return "đã xóa";
    case "served":
      return "đã bán";
    case "missed":
      return "lỡ khách";
    case "umbrella":
      return "che mưa";
    case "next-day":
      return "ngày mới";
    case "day-complete":
      return "hết ngày";
    default:
      return status;
  }
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
        campaign: IS_STORY ? structuredClone(gameState.campaign) : null,
        street: IS_STORY ? structuredClone(gameState.street) : null,
        gameMode: IS_STORY ? 'story' : 'classic',
        selectedCustomerId: runtime.selectedCustomerId,
        view: runtime.view3d ? "3d" : "2d",
        renderer: runtime.scene3d?.diagnostics() ?? null,
        mode: runtime.mode,
        settingsOpen: runtime.settingsOpen,
        eventOpen: runtime.eventOpen,
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
        documentLanguage: document.documentElement.lang,
        layout: structuredClone(TABLE_LAYOUT),
        customerCatalog: CUSTOMER_TYPES.map((customerType) => ({
          id: customerType.id,
          spawnWeight: customerSpawnWeight(customerType),
        })),
      };
    },
    tablePoint(id) { return runtime.scene3d?.tablePoint(id); },
    exportGLB() { return runtime.scene3d?.exportGLB(); },
  };
}

async function changeView() {
  const select = document.getElementById("view-mode");
  const canvas = document.getElementById("game-canvas-3d");
  const fallback = () => {
    runtime.view3d = false;
    select.value = "2d";
    canvas.hidden = true;
    ui.canvas.hidden = false;
    document.getElementById("zoom-control").hidden = true;
    showToast("Không mở được 3D. Quán tiếp tục ở chế độ 2D.");
  };
  select.disabled = true;
  try {
    if (select.value === "3d" && !runtime.scene3d) {
      const { createScene3D } = await import("./scene3d.js?v=21");
      runtime.scene3d = await createScene3D(canvas, TABLE_LAYOUT, serveTable, () => {
        fallback();
        // A lost context must not be selected again until the page is reloaded.
        select.querySelector('[value="3d"]').disabled = true;
      }, MAX_WAIT_SECONDS);
      if(IS_STORY) {
        runtime.scene3d.setZoom(1.2);
        document.getElementById('view-zoom').value='1.2';
      }
    }
    runtime.view3d = select.value === "3d";
    canvas.hidden = !runtime.view3d;
    ui.canvas.hidden = runtime.view3d;
    document.getElementById("zoom-control").hidden = !runtime.view3d;
  } catch {
    fallback();
  } finally {
    select.disabled = false;
  }
}

function dailyTarget() {
  if(IS_STORY)return story.chapter(gameState.dayNumber).target;
  return Math.min(14, 7 + gameState.dayNumber);
}

function storyFeedback(text) {
  document.getElementById('story-feedback').textContent=text;
  clearTimeout(runtime.feedbackTimer);
  runtime.feedbackTimer=setTimeout(()=>{document.getElementById('story-feedback').textContent='';},3500);
}

function compactNumber(value) {
  if(value<1000)return String(value);
  return `${Number((value/(value<1e6?1000:1e6)).toFixed(1))}${value<1e6?'k':'m'}`;
}

function bindSettings() {
  const dialog=document.getElementById('settings-dialog');
  document.getElementById('settings-button').addEventListener('click',()=>{
    if(dialog.open||runtime.eventOpen)return;
    runtime.settingsOpen=true;
    runtime.lastFrame=0;runtime.accumulator=0;
    dialog.showModal();
    updateHud();
    void persistGameState('settings');
  });
  document.getElementById('close-settings').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    runtime.settingsOpen=false;
    runtime.lastFrame=0;runtime.accumulator=0;
    updateHud();
    document.getElementById('settings-button').focus();
  });
  dialog.addEventListener('click',event=>{
    const rect=dialog.getBoundingClientRect();
    if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))dialog.close();
  });
}

function bindStoryControls() {
  document.getElementById('story-panel').hidden=!IS_STORY;
  document.getElementById('chapter-band').hidden=false;
  document.querySelector('.streak-status').hidden=!IS_STORY;
  document.getElementById('upgrade-slot').hidden=!IS_STORY;
  if(!IS_STORY){document.getElementById('game-subtitle').textContent='Classic';return;}
  const drawer=document.getElementById('preparation-dialog');
  document.getElementById('open-preparation').addEventListener('click',()=>{
    if(runtime.mode!=='playing'||runtime.settingsOpen||runtime.eventOpen)return;
    const customer=gameState.customers.find(c=>c.id===runtime.selectedCustomerId);
    document.getElementById('preparation-order').textContent=customer?.orderText||'Pha sẵn cho khách';
    drawer.showModal();
  });
  document.getElementById('close-preparation').addEventListener('click',()=>drawer.close());
  drawer.addEventListener('close',focusDock);
  document.getElementById('prepare-drink').addEventListener('click',()=>{
    if(runtime.mode!=='playing'||runtime.settingsOpen||runtime.eventOpen)return;
    const value={drink:document.querySelector('[name="drink"]:checked').value,ice:document.getElementById('recipe-ice').value,sugar:document.getElementById('recipe-sugar').value};
    const batch=story.prepare(gameState.campaign,value,gameState.dayNumber,gameState.serveLevel>0);
    if(!batch)return;
    runtime.selectedBatchId=batch.id;
    drawer.close();
    runtime.audio.beep('tap');storyFeedback(`Đang pha ${story.DRINKS[batch.drink].name.toLowerCase()}.`);
    void persistGameState('preparing');updateHud();
  });
  for(let index=0;index<2;index++)document.getElementById(`batch-${index}`).addEventListener('click',()=>{
    const batch=gameState.campaign.batches[index];
    runtime.selectedBatchId=batch?.id??null;
    if(batch)storyFeedback(story.orderText(batch));
    updateHud();
  });
  document.getElementById('discard-drink').addEventListener('click',()=>{
    if(runtime.mode!=='playing'||runtime.settingsOpen||runtime.eventOpen)return;
    gameState.campaign.batches=gameState.campaign.batches.filter(batch=>batch.id!==runtime.selectedBatchId);
    runtime.selectedBatchId=null;storyFeedback('Đã dọn ly.');void persistGameState('discarded');updateHud();
  });
  document.getElementById('deliver-drink').addEventListener('click',()=>{
    if(runtime.mode!=='playing'||runtime.settingsOpen||runtime.eventOpen)return;
    const customer=gameState.customers.find(c=>c.id===runtime.selectedCustomerId);
    const result=story.deliver(gameState.campaign,customer,runtime.selectedBatchId);
    if(result==='wrong')storyFeedback('Chưa đúng món. Chọn lại khách hoặc pha lại.');
    if(result==='served') {
      finishService(customer,getTableState(customer.tableId));
      storyFeedback(`Chuỗi ${gameState.campaign.streak}${customer.order.regularId?' · '+story.REGULARS[customer.order.regularId].name+' +1':''}`);
      runtime.selectedBatchId=null;runtime.selectedCustomerId=null;
    }
    void persistGameState(result==='served'?'served':'order-check');updateHud();
  });
  document.getElementById('upgrade-slot').addEventListener('click',()=>{
    if(runtime.mode!=='playing'||gameState.dayNumber<2||gameState.coins<15||gameState.campaign.extraSlot)return;
    gameState.coins-=15;gameState.campaign.extraSlot=true;
    storyFeedback('Chỗ pha thứ hai đã sẵn sàng.');void persistGameState('upgrade');updateHud();
  });
}

function updateStoryHud() {
  updateStreetHud();
  const campaign=gameState.campaign;
  const waiting=gameState.customers.filter(c=>c.phase==='waiting').sort((a,b)=>b.waitElapsed-a.waitElapsed);
  if(!waiting.some(c=>c.id===runtime.selectedCustomerId))runtime.selectedCustomerId=waiting[0]?.id??null;
  const list=document.getElementById('order-list');
  const active=new Set(waiting.map(c=>String(c.id)));
  for(const node of [...list.children])if(!active.has(node.dataset.customerId))node.remove();
  for(const customer of waiting) {
    let button=list.querySelector(`[data-customer-id="${customer.id}"]`);
    if(!button) {
      button=document.createElement('button');button.type='button';button.dataset.customerId=customer.id;
      const portrait=document.createElement('img');portrait.src=ASSET_PATHS[CUSTOMER_TYPES.find(t=>t.id===customer.type).assetId];portrait.alt='';
      const text=document.createElement('span');button.append(portrait,text);list.append(button);
      button.addEventListener('click',()=>{runtime.selectedCustomerId=customer.id;updateHud();});
    }
    const order=customer.order;
    const seatLabel=`B${getTableLayout(customer.tableId).index+1}${customer.seatIndex===0?'A':'B'}`;
    const title=`${story.REGULARS[order.regularId]?.name||seatLabel} · ${story.DRINKS[order.drink].name}`;
    button.querySelector('span').textContent=`${title}\n${order.ice==='less'?'Ít đá · ':''}${order.sugar==='less'?'Ít ngọt · ':''}${Math.max(0,Math.ceil(MAX_WAIT_SECONDS-customer.waitElapsed))}s`;
    button.setAttribute('aria-label',`${seatLabel}. ${customer.orderText}`);
    button.title=`${seatLabel}. ${customer.orderText}`;
    button.setAttribute('aria-pressed',String(customer.id===runtime.selectedCustomerId));
  }
  const chapterTitle=document.getElementById('chapter-title');
  chapterTitle.textContent=`Ngày ${compactNumber(gameState.dayNumber)}`;
  chapterTitle.title=`Ngày ${gameState.dayNumber} · ${story.chapter(gameState.dayNumber).title}`;
  document.getElementById('chapter-progress').textContent=compactNumber(campaign.streak);
  document.getElementById('chapter-progress').parentElement.setAttribute('aria-label',`Chuỗi phục vụ ${campaign.streak}`);
  document.getElementById('hud-time').textContent=ui.shiftValue.textContent;
  const details=document.getElementById('settings-progress');
  details.hidden=false;
  details.textContent=`${chapterTitle.title} · Cô Lan ${campaign.relationships.lan} · Minh ${campaign.relationships.minh}`;
  if(!campaign.batches.some(b=>b.id===runtime.selectedBatchId))runtime.selectedBatchId=campaign.batches[0]?.id??null;
  const batch=campaign.batches.find(b=>b.id===runtime.selectedBatchId);
  for(let index=0;index<2;index++) {
    const node=document.getElementById(`batch-${index}`),item=campaign.batches[index];
    const preferences=item?[item.ice==='less'?'Ít đá':'',item.sugar==='less'?'ít ngọt':''].filter(Boolean).join('/'):'';
    node.textContent=item?[item.drink==='coffee'?'Cà phê':story.DRINKS[item.drink].name,preferences,story.ready(item)?'Xong':Math.ceil(item.duration-item.elapsed)+'s'].filter(Boolean).join('\n'):index>=story.capacity(campaign)?'Khóa':'Trống';
    node.title=item?`${story.orderText(item)} ${story.ready(item)?'Sẵn sàng':'Đang pha'}`:index>=story.capacity(campaign)?'Mở thêm chỗ pha trong cài đặt':'Khay trống';
    node.setAttribute('aria-label',node.title);
    node.disabled=!item;node.setAttribute('aria-pressed',String(item?.id===runtime.selectedBatchId));
    node.style.setProperty('--brew-progress',item?`${Math.min(100,item.elapsed/item.duration*100)}%`:'0%');
  }
  const playing=runtime.mode==='playing'&&!runtime.settingsOpen&&!runtime.eventOpen;
  document.getElementById('open-preparation').disabled=!playing||campaign.batches.length>=story.capacity(campaign);
  if(gameState.levelComplete)document.getElementById('preparation-dialog').close();
  ui.upgradeServe.disabled ||= runtime.mode==='paused';
  ui.upgradeUmbrella.disabled ||= runtime.mode==='paused';
  document.getElementById('prepare-drink').disabled=!playing||campaign.batches.length>=story.capacity(campaign);
  document.getElementById('deliver-drink').disabled=!playing||!runtime.selectedCustomerId||!batch||!story.ready(batch);
  document.getElementById('discard-drink').disabled=!playing||!batch;
  document.getElementById('recipe-ice').disabled=gameState.dayNumber<2;
  const plainTea=document.querySelector('[name="drink"]:checked').value==='tea';
  document.getElementById('recipe-sugar').disabled=gameState.dayNumber<3||plainTea;
  if(gameState.dayNumber<2)document.getElementById('recipe-ice').value='normal';
  if(gameState.dayNumber<3||plainTea)document.getElementById('recipe-sugar').value='normal';
  for(const input of document.querySelectorAll('[name="drink"]')) {
    input.disabled=story.DRINKS[input.value].day>gameState.dayNumber;
    if(input.disabled&&input.checked)document.querySelector('[name="drink"][value="tea"]').checked=true;
  }
  const upgrade=document.getElementById('upgrade-slot');
  upgrade.disabled=runtime.mode!=='playing'||campaign.extraSlot||gameState.coins<15||gameState.dayNumber<2;
  upgrade.innerHTML=campaign.extraSlot?'Thêm chỗ pha<small>đã mở</small>':'Thêm chỗ pha<small>15 xu · ngày 2</small>';
  if(campaign.closing)ui.shiftValue.textContent=document.getElementById('hud-time').textContent='Dọn ca';
  if(gameState.dayNumber>=4&&gameState.weatherState==='clear') {
    ui.weatherValue.textContent=`${Math.ceil(gameState.nextWeatherRollIn)}s`;
    ui.weatherValue.parentElement.title=`Mưa sau ${Math.ceil(gameState.nextWeatherRollIn)} giây`;
    ui.weatherValue.parentElement.setAttribute('aria-label',ui.weatherValue.parentElement.title);
  }
}

function focusDock() {
  (document.querySelector('.tray-row button:not(:disabled)')||document.getElementById('settings-button')).focus();
}

function bindStreetControls() {
  if(!IS_STORY)return;
  const dialog=document.getElementById('event-dialog');
  document.getElementById('street-event').addEventListener('click',()=>{
    if(!gameState.street.active||runtime.mode!=='playing'||runtime.settingsOpen||runtime.eventOpen)return;
    runtime.eventOpen=true;runtime.lastFrame=0;runtime.accumulator=0;
    renderEventDialog();dialog.showModal();updateHud();
    void persistGameState('event-open');
  });
  document.getElementById('close-event').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    runtime.eventOpen=false;runtime.lastFrame=0;runtime.accumulator=0;
    updateHud();
    if(gameState.street.active)document.getElementById('street-event').focus();
    else focusDock();
  });
  document.getElementById('event-continue').addEventListener('click',()=>{
    if(!runtime.eventOpen||gameState.street.active?.phase!=='result')return;
    street.dismissEvent(gameState,gameState.street.active.token);
    void persistGameState('event-dismiss');dialog.close();
  });
}

function renderEventDialog() {
  const a=gameState.street.active,p=street.presentation(gameState.street);
  if(!p)return;
  document.getElementById('event-title').textContent=p.title;
  document.getElementById('event-text').textContent=p.text;
  const portrait=document.getElementById('event-portrait');
  portrait.src=`./public/assets/3d/events/${p.portrait}.png`;
  const effects=[];
  if(p.effect?.coins)effects.push(`${p.effect.coins>0?'+':''}${p.effect.coins} xu`);
  if(p.effect?.trust)effects.push(`${p.effect.trust>0?'+':''}${p.effect.trust} thiện cảm`);
  if(p.effect?.traffic&&p.effect.traffic!==1)effects.push(`${p.effect.traffic>1?'+15%':'-20%'} khách · 45s`);
  if(p.effect?.later)effects.push('Có chuyện vào ngày mai');
  document.getElementById('event-effect').textContent=effects.join(' · ');
  const list=document.getElementById('event-choices');list.replaceChildren();
  for(const choice of p.choices) {
    const button=document.createElement('button');button.type='button';button.textContent=choice.label;
    button.dataset.choice=choice.id;button.disabled=gameState.coins<choice.cost;
    if(button.disabled)button.title=`Cần ${choice.cost} xu`;
    const token=a.token,node=a.node;
    button.addEventListener('click',()=>{
      if(!runtime.eventOpen||!street.chooseEvent(gameState,token,node,choice.id))return;
      void persistGameState('event-choice');renderEventDialog();updateHud();
      (document.querySelector('#event-choices button:not(:disabled)')||document.getElementById('event-continue')).focus();
    });
    list.append(button);
  }
  document.getElementById('event-continue').hidden=a.phase!=='result';
}

function updateStreetHud() {
  const s=gameState.street,p=street.presentation(s),button=document.getElementById('street-event');
  button.hidden=!p||gameState.levelComplete;
  button.textContent=p?`${p.title} · Xem`:'';
  button.disabled=runtime.mode!=='playing';
  document.getElementById('street-progress').hidden=false;
  document.getElementById('street-progress').textContent=`Khu phố: ${s.trust>0?'+':''}${s.trust} thiện cảm${s.trust>=4?' · thêm boa mỗi 3 ly':''}${s.modifier.left>0?` · ${s.modifier.value>1?'+15%':'-20%'} khách (${Math.ceil(s.modifier.left)}s)`:''}`;
  document.getElementById('street-journal').hidden=false;
  const history=document.getElementById('street-history'),key=JSON.stringify(s.history);
  if(history.dataset.entries!==key) {
    history.dataset.entries=key;history.replaceChildren();
    for(const item of [...s.history].reverse()) {
      const entry=document.createElement('li');
      const event=street.EVENTS[item.id];
      const choice=Object.values(event.nodes).flatMap(n=>n.choices).find(c=>c.id===item.choice);
      entry.textContent=`Ngày ${item.day}: ${event.title} · ${choice?.label||'Đã đi qua'}`;history.append(entry);
    }
  }
}

function drawOrderBubble(x, y, orderText, statusText) {
  x = Math.max(74, Math.min(BOARD_WIDTH - 74, x));
  y = Math.max(40, y);
  ctx.save();
  ctx.font = '600 11px "Trebuchet MS", sans-serif';
  const orderLines = [];
  let line = "";
  for (const word of String(orderText || "Cho mình một ly trà nhé.").split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > 124) {
      orderLines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) orderLines.push(line);
  const height = 24 + orderLines.length * 14;
  ctx.fillStyle = "rgba(255, 248, 230, 0.96)";
  ctx.beginPath();
  ctx.roundRect(x - 72, y - 20, 144, height, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 20 + height);
  ctx.lineTo(x, y - 14 + height);
  ctx.lineTo(x + 6, y - 20 + height);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#8d6040";
  ctx.font = '600 8px "Trebuchet MS", sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(statusText, x - 62, y - 6);
  ctx.fillStyle = "#5f351c";
  ctx.font = '600 11px "Trebuchet MS", sans-serif';
  orderLines.forEach((text, index) => ctx.fillText(text, x - 62, y + 8 + index * 14, 124));
  ctx.restore();
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
