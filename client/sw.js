const CACHE_NAME = "sidewalk-iced-tea-planb-v9";
const CUSTOMER_ASSET_NAMES = [
  "customer-man",
  "customer-woman",
  "customer-old-man",
  "customer-old-woman",
  "customer-young-boy",
  "customer-young-girl",
  "customer-asian-man",
  "customer-asian-woman",
  "customer-asian-old-man",
  "customer-asian-old-woman",
  "customer-asian-young-boy",
  "customer-asian-young-girl",
  "customer-man-teal",
  "customer-woman-rose",
  "customer-old-man-sage",
  "customer-old-woman-lilac",
  "customer-young-boy-cobalt",
  "customer-young-girl-coral",
  "customer-asian-man-indigo",
  "customer-asian-woman-mint",
  "customer-asian-old-man-ochre",
  "customer-asian-old-woman-berry",
  "customer-asian-young-boy-lime",
  "customer-asian-young-girl-violet",
  "customer-man-hippie",
  "customer-woman-hippie",
  "customer-young-girl-hippie",
  "customer-asian-young-boy-hippie",
  "customer-man-helmet-black",
  "customer-woman-helmet-white",
  "customer-young-boy-helmet-red",
  "customer-asian-woman-helmet-blue",
  "customer-old-man-mask-black",
  "customer-old-woman-mask-white",
  "customer-asian-young-boy-mask-green",
  "customer-asian-young-girl-mask-pink",
];
const CUSTOMER_BASE_ASSETS = CUSTOMER_ASSET_NAMES.map(
  (name) => `./public/assets/final/${name}.png`,
);
const CUSTOMER_WALK_ASSETS = CUSTOMER_ASSET_NAMES.flatMap((name) =>
  Array.from(
    { length: 4 },
    (_, frameIndex) => `./public/assets/final/walk/${name}-walk-${frameIndex}.png`,
  ),
);
const CUSTOMER_SERVED_ASSETS = CUSTOMER_ASSET_NAMES.map(
  (name) => `./public/assets/final/served/${name}-served.png`,
);
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./manifest.webmanifest",
  "./offline.html",
  "./public/icons/app-icon.svg",
  "./public/icons/app-icon-maskable.svg",
  "./public/assets/final/bg-room.png",
  "./public/assets/final/stall-counter.png",
  "./public/assets/final/table-slot.png",
  "./public/assets/final/icon-coin.png",
  "./public/assets/final/icon-rain.png",
  "./public/assets/final/icon-umbrella.png",
  ...CUSTOMER_BASE_ASSETS,
  ...CUSTOMER_WALK_ASSETS,
  ...CUSTOMER_SERVED_ASSETS,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedPage = await caches.match("./index.html");
        return cachedPage || caches.match("./offline.html");
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then(async (response) => {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("./offline.html");
          }

          return new Response("", { status: 404, statusText: "Offline" });
        });
    }),
  );
});
