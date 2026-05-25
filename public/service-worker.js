const IMAGE_CACHE_NAME = "sneaky-image-cache-v1";
const IMAGE_REQUEST_DESTINATIONS = new Set(["image"]);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith("sneaky-image-cache-"))
            .filter((cacheName) => cacheName !== IMAGE_CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !IMAGE_REQUEST_DESTINATIONS.has(request.destination)) {
    return;
  }

  event.respondWith(getCachedImage(request));
});

const getCachedImage = async (request) => {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request, { ignoreSearch: true });

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);

  if (networkResponse.ok || networkResponse.type === "opaque") {
    await cache.put(request, networkResponse.clone());
  }

  return networkResponse;
};
