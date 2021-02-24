
/*
*   the files needed for the pwa to work in a stable condition
*   are listed below. These will be cached 
*/
var FILES_TO_CACHE = [
	"/static/pwa/start.html",
	"/static/pwa/offline.html",
	"/service-worker.js",
	"/static/js/pwa-main.js",
	"/static/pwa/start.js",
	"/static/pwa/offline.js",
	"/static/js/dlContentManager.js",
	"/static/pwa/start.css",
	"/static/pwa/offline.css",
	"/static/pwa/favicon.png",
	"/static/css/colours.css",
	"/static/css/main.css",
];

self.addEventListener("install", function (e) {
    const _e = e;
    _e.waitUntil(caches.open("armadillo").then(function (cache) {
        return cache.addAll(FILES_TO_CACHE);
    }));
});

self.addEventListener('fetch', function (e) {
    const _e = e;

      _e.respondWith(
          fetch(_e.request)
              .catch(() => {
                const file = _e.request.url.match(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/)[3];
                console.warn(`could not fetch. Will attempt to find ${file} in cache`)
                return caches.match(file);
              })
      );
});
