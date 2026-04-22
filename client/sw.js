const CACHE_NAME = "sidewalk-iced-tea-planb-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./manifest.webmanifest",
  "./offline.html",
  "./public/icons/app-icon.svg",
  "./public/icons/app-icon-maskable.svg",
  "./public/assets/placeholder/bg-room.svg",
  "./public/assets/placeholder/stall-counter.svg",
  "./public/assets/placeholder/table-slot.svg",
  "./public/assets/placeholder/customer-man.svg",
  "./public/assets/placeholder/customer-woman.svg",
  "./public/assets/placeholder/customer-old-man.svg",
  "./public/assets/placeholder/customer-old-woman.svg",
  "./public/assets/placeholder/customer-young-boy.svg",
  "./public/assets/placeholder/customer-young-girl.svg",
  "./public/assets/placeholder/icon-coin.svg",
  "./public/assets/placeholder/icon-rain.svg",
  "./public/assets/placeholder/icon-umbrella.svg"
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
