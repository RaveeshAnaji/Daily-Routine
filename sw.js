self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("housework-app").then((cache) => {
      return cache.addAll([
        "index.html",
        "style.css",
        "script.js",
        "manifest.json",
        "android-launchericon-192-192.png",
        "android-launchericon-512-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});