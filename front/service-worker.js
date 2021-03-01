
/*
*   the files needed for the pwa to work in a stable condition
*   are listed below. These will be cached 
*/
var FILES_TO_CACHE = [
	"/",
	"/static/pwa/start.html",
	"/static/pwa/offline.html",
	"/service-worker.js",
	"/static/js/pwa-main.js",
	"/static/js/Video-Storage.js",
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
	console.log("install!")
    const _e = e;
    _e.waitUntil(caches.open("armadillo").then(function (cache) {
        return cache.addAll(FILES_TO_CACHE);
    }));
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
	  caches.match(event.request)
		.then(function(response) {
		  // Cache hit - return response
		  if (response) {
			return response;
		  }
		  return fetch(event.request);
		}
	  )
	);
  });
  
