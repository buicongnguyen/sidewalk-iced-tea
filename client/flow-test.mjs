import { spawn } from "node:child_process";
import process from "node:process";
import { chromium } from "playwright";

const SERVER_READY_PATTERN =
  /Sidewalk Iced Tea Plan B available at (http:\/\/[^\s]+)/;
const SAVE_KEY = "sidewalk-iced-tea:save-fallback";
const SAVE_BACKUP_KEY = "sidewalk-iced-tea:save-backup";
const ACTIVE_SLOT_POINTER = "sidewalk-iced-tea:active-slot";
const SAVE_SLOT_KEY = "slot-1";

const TABLE_LAYOUT = buildTableLayout();
const CUSTOMER_TYPES = [
  "man",
  "woman",
  "old_man",
  "old_woman",
  "young_boy",
  "young_girl",
];

let serverProcess;

try {
  serverProcess = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: "0",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const serverUrl = await waitForServer(serverProcess);
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    await runFlow(results, "serve persists immediately", async () => {
      const page = await newPage(browser, makeWaitingSave({ waitElapsed: 1 }));
      await page.goto(serverUrl, { waitUntil: "networkidle" });
      await waitForApp(page);
      await page.click("#start-button");
      await clickTable(page, "table-1-0");
      await page.waitForFunction(
        () => window.__planBGame.getSnapshot().saveStatus === "served",
      );
      await page.reload({ waitUntil: "networkidle" });
      await waitForApp(page);
      const snapshot = await getSnapshot(page);
      expectEqual(snapshot.totalServed, 1, "served count should survive reload");
      expectEqual(snapshot.coins, 2, "quick service should save base coin plus tip");
      expectEqual(snapshot.score, 3, "quick service should save score gain");
      await page.context().close();
    });

    await runFlow(results, "miss persists immediately", async () => {
      const page = await newPage(browser, makeWaitingSave({ waitElapsed: 17.8 }));
      await page.goto(serverUrl, { waitUntil: "networkidle" });
      await waitForApp(page);
      await page.click("#start-button");
      await page.waitForFunction(
        () => window.__planBGame.getSnapshot().saveStatus === "missed",
      );
      await page.reload({ waitUntil: "networkidle" });
      await waitForApp(page);
      const snapshot = await getSnapshot(page);
      expectEqual(snapshot.totalMissed, 1, "missed count should survive reload");
      expectEqual(snapshot.totalServed, 0, "miss flow should not serve anyone");
      await page.context().close();
    });

    await runFlow(results, "pause freezes waiting timers", async () => {
      const page = await newPage(browser, makeWaitingSave({ waitElapsed: 2 }));
      await page.goto(serverUrl, { waitUntil: "networkidle" });
      await waitForApp(page);
      await page.click("#start-button");
      await page.waitForFunction(
        () => window.__planBGame.getSnapshot().tables.some((table) => table.status === "waiting"),
      );
      await page.click("#pause-button");
      const pausedStart = await waitingElapsed(page);
      await page.waitForTimeout(1200);
      const pausedEnd = await waitingElapsed(page);
      expectLessThan(
        Math.abs(pausedEnd - pausedStart),
        0.2,
        "waiting timer should not advance while paused",
      );
      await page.click("#start-button");
      await page.waitForTimeout(700);
      const resumed = await waitingElapsed(page);
      expectGreaterThan(
        resumed - pausedEnd,
        0.3,
        "waiting timer should advance after resume",
      );
      await page.context().close();
    });

    await runFlow(results, "rain state stays playable", async () => {
      const rainySave = makeWaitingSave({ waitElapsed: 1 });
      rainySave.weatherState = "rain";
      rainySave.weatherRemaining = 12;
      const page = await newPage(browser, rainySave);
      await page.goto(serverUrl, { waitUntil: "networkidle" });
      await waitForApp(page);
      await page.click("#start-button");
      await page.waitForTimeout(700);
      const snapshot = await getSnapshot(page);
      expectEqual(snapshot.weatherState, "rain", "rain should stay active");
      expectGreaterThan(snapshot.weatherRemaining, 10, "rain countdown should continue");
      await page.context().close();
    });

    await runFlow(results, "upgrades and reset persist", async () => {
      const page = await newPage(browser, makeBaseSave({ coins: 30, score: 30 }));
      await page.goto(serverUrl, { waitUntil: "networkidle" });
      await waitForApp(page);
      await page.click("#start-button");
      await page.click("#upgrade-serve");
      await page.waitForFunction(() => window.__planBGame.getSnapshot().serveLevel === 1);
      await page.click("#upgrade-umbrella");
      await page.waitForFunction(() => window.__planBGame.getSnapshot().umbrellaOwned);
      let snapshot = await getSnapshot(page);
      expectEqual(snapshot.coins, 0, "both upgrades should spend all 30 coins");

      page.once("dialog", (dialog) => dialog.accept());
      await page.click("#reset-button");
      await page.waitForFunction(
        () => window.__planBGame.getSnapshot().saveStatus === "reset",
      );
      await page.reload({ waitUntil: "networkidle" });
      await waitForApp(page);
      snapshot = await getSnapshot(page);
      expectEqual(snapshot.coins, 0, "reset should clear coins");
      expectEqual(snapshot.serveLevel, 0, "reset should clear serve upgrade");
      expectEqual(snapshot.umbrellaOwned, false, "reset should clear umbrella");
      await page.context().close();
    });

    await runFlow(results, "full tables drop overflow customers", async () => {
      const page = await newPage(browser, makeFullTableSave());
      await page.goto(serverUrl, { waitUntil: "networkidle" });
      await waitForApp(page);
      await page.click("#start-button");
      await page.waitForFunction(() => window.__planBGame.getSnapshot().stats.dropped > 0);
      const snapshot = await getSnapshot(page);
      expectEqual(snapshot.customers.length, TABLE_LAYOUT.length, "full shop should stay capped");
      expectEqual(snapshot.stats.dropped, 1, "overflow customer should be counted as dropped");
      await page.context().close();
    });
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify({ passed: results.length, flows: results }, null, 2));
} finally {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
}

async function waitForServer(child) {
  return await new Promise((resolve, reject) => {
    let settled = false;
    let stdoutBuffer = "";

    const cleanup = () => {
      child.stdout.off("data", onStdout);
      child.stderr.off("data", onStderr);
      child.off("exit", onExit);
    };

    const resolveOnce = (serverUrl) => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(serverUrl);
      }
    };

    const rejectOnce = (error) => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(error);
      }
    };

    const onStdout = (chunk) => {
      stdoutBuffer += chunk.toString();
      const match = stdoutBuffer.match(SERVER_READY_PATTERN);
      if (match) {
        resolveOnce(match[1]);
      }
    };

    const onStderr = (chunk) => {
      process.stderr.write(chunk);
    };

    const onExit = (code) => {
      rejectOnce(
        new Error(`Static server exited before flow test could start (code ${code}).`),
      );
    };

    child.stdout.on("data", onStdout);
    child.stderr.on("data", onStderr);
    child.on("exit", onExit);

    setTimeout(() => {
      rejectOnce(new Error("Timed out waiting for the static server."));
    }, 12000);
  });
}

async function newPage(browser, saveState) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    serviceWorkers: "block",
  });

  if (saveState) {
    await context.addInitScript(
      ({ saveKey, backupKey, pointerKey, slotKey, state }) => {
        localStorage.setItem(pointerKey, slotKey);
        localStorage.setItem(saveKey, JSON.stringify(state));
        localStorage.setItem(backupKey, JSON.stringify(state));
      },
      {
        saveKey: SAVE_KEY,
        backupKey: SAVE_BACKUP_KEY,
        pointerKey: ACTIVE_SLOT_POINTER,
        slotKey: SAVE_SLOT_KEY,
        state: saveState,
      },
    );
  }

  const page = await context.newPage();
  page.on("pageerror", (error) => {
    throw error;
  });
  return page;
}

async function runFlow(results, name, flow) {
  await flow();
  results.push(name);
}

async function waitForApp(page) {
  await page.waitForFunction(() => Boolean(window.__planBGame));
}

async function getSnapshot(page) {
  return await page.evaluate(() => window.__planBGame.getSnapshot());
}

async function clickTable(page, tableId) {
  const tablePoint = await page.evaluate((id) => {
    const snapshot = window.__planBGame.getSnapshot();
    const layout = snapshot.layout.find((table) => table.id === id);
    return {
      x: layout.x + layout.width / 2,
      y: layout.y + layout.height / 2,
    };
  }, tableId);

  const canvasBox = await page.locator("#game-canvas").boundingBox();
  if (!canvasBox) {
    throw new Error("Canvas was not laid out.");
  }

  await page.mouse.click(
    canvasBox.x + (tablePoint.x / 960) * canvasBox.width,
    canvasBox.y + (tablePoint.y / 540) * canvasBox.height,
  );
}

async function waitingElapsed(page) {
  return await page.evaluate(() => {
    const table = window.__planBGame
      .getSnapshot()
      .tables.find((entry) => entry.status === "waiting");
    return table?.waitElapsed ?? 0;
  });
}

function makeBaseSave(overrides = {}) {
  const now = Date.now();
  return {
    version: 1,
    coins: 0,
    score: 0,
    tipCoins: 0,
    totalServed: 0,
    totalMissed: 0,
    serveLevel: 0,
    umbrellaOwned: false,
    weatherState: "clear",
    weatherRemaining: 0,
    nextWeatherRollIn: 999,
    sessionStartedAt: now,
    lastSavedAt: now,
    lastSimulatedAt: now,
    audioUnlocked: false,
    nextCustomerId: 1,
    spawnTimer: 999,
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
    ...overrides,
  };
}

function makeWaitingSave({ waitElapsed = 0, coins = 0, score = 0 } = {}) {
  const state = makeBaseSave({ coins, score, nextCustomerId: 2 });
  const layout = TABLE_LAYOUT.find((table) => table.id === "table-1-0");
  const customer = makeCustomer({ id: 1, type: "young_boy", layout, waitElapsed });
  const table = state.tables.find((entry) => entry.id === layout.id);
  table.status = "waiting";
  table.customerId = customer.id;
  table.waitElapsed = waitElapsed;
  state.customers.push(customer);
  return state;
}

function makeFullTableSave() {
  const state = makeBaseSave({ nextCustomerId: TABLE_LAYOUT.length + 1, spawnTimer: 0 });

  TABLE_LAYOUT.forEach((layout, index) => {
    const customer = makeCustomer({
      id: index + 1,
      type: CUSTOMER_TYPES[index % CUSTOMER_TYPES.length],
      layout,
      waitElapsed: 1,
    });
    const table = state.tables.find((entry) => entry.id === layout.id);
    table.status = "waiting";
    table.customerId = customer.id;
    table.waitElapsed = 1;
    state.customers.push(customer);
  });

  return state;
}

function makeCustomer({ id, type, layout, waitElapsed }) {
  return {
    id,
    type,
    phase: "waiting",
    x: layout.seatX,
    y: layout.seatY,
    targetX: layout.seatX,
    targetY: layout.seatY,
    waypoints: [],
    tableId: layout.id,
    speed: 140,
    waitElapsed,
    serveElapsed: 0,
    enjoyElapsed: 0,
    rewardGranted: false,
    tipReward: 0,
  };
}

function buildTableLayout() {
  const layout = [];
  const startX = 280;
  const startY = 120;
  const gapX = 150;
  const gapY = 185;
  const width = 128;
  const height = 96;
  const aisleX = 236;

  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const x = startX + column * gapX;
      const y = startY + row * gapY;
      layout.push({
        id: `table-${row}-${column}`,
        index: layout.length,
        row,
        column,
        x,
        y,
        width,
        height,
        approachX: Math.max(aisleX, x - 28),
        approachY: y + height + 12,
        seatX: x + width / 2,
        seatY: y + height + 16,
      });
    }
  }

  return layout;
}

function expectEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, received ${actual}`);
  }
}

function expectGreaterThan(actual, expected, message) {
  if (!(actual > expected)) {
    throw new Error(`${message}: expected > ${expected}, received ${actual}`);
  }
}

function expectLessThan(actual, expected, message) {
  if (!(actual < expected)) {
    throw new Error(`${message}: expected < ${expected}, received ${actual}`);
  }
}
