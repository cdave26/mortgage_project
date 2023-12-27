/**
 * Service Worker
 */
importScripts(`${location.origin}/env.js`);
import IndexDataBase from "./indexedDB";
const channels = {};
const version = ENV.app_version;
const cacheName = `uplist-${version}`;
const staticAssets = ["/sw.js", "/manifest.json"];

const staticImageAssets = [
  "/favicon.ico",
  "/img/profile-image.png",
  "/img/uplist_wordmark.png",
  "/img/Uplist_wordmark.jpg",
];

const current_cache = {
  [`static-asset-${cacheName}`]: staticAssets,
  [`static-image-asset-${cacheName}`]: staticImageAssets,
  [`dynamic-${cacheName}`]: [],
};

/**
 * Todo: cache static files and assets
 * eg: css, js, images, fonts, etc.
 */
self.addEventListener("install", (event) => {
  Object.keys(current_cache).forEach((cacheName) => {
    event.waitUntil(
      caches
        .open(cacheName)
        .then((cache) => {
          cache.addAll(current_cache[cacheName]);
        })
        .then(() => {
          self.skipWaiting();
        })
    );
  });
});

self.addEventListener("activate", async (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (!Object.keys(current_cache).includes(cache)) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  //run when service worker is activated.
  const pushNotification = await checkIfDBExist();
  if (pushNotification === undefined) {
    createDB();
  }
});

self.addEventListener("message", async (event) => {
  const { channelName, message } = event.data;
  switch (channelName) {
    case "skipWaiting":
      self.skipWaiting();
      break;
    case channelName:
      if (!channels[channelName]) {
        channels[channelName] = new BroadcastChannel(channelName);
      }
      channels[channelName].postMessage(message);
      break;

    default:
      break;
  }
});

self.addEventListener("fetch", (event) => {
  // const { origin } = new URL(event.request.url);
  // if (event.request.url.indexOf(`${origin}/?res=verify_email`) !== -1) return;
  // event.respondWith(
  //   caches.open(`dynamic-${cacheName}`).then((cache) => {
  //     return cache.match(event.request).then((response) => {
  //       const fetchPromise = fetch(event.request)
  //         .then((networkResponse) => {
  //           if (networkResponse) {
  //             networkResponse.lassAccessed = Date.now();
  //             const type = networkResponse.headers.get("content-type");
  //             if (type && type.indexOf("text/css; charset=UTF-8") !== -1) {
  //               cache.put(event.request, networkResponse.clone());
  //             }
  //             if (type && type.indexOf("font/otf") !== -1) {
  //               cache.put(event.request, networkResponse.clone());
  //             }
  //             /**
  //              * Todo: cache dynamic files and assets
  //              * eg: js,
  //              */
  //           }
  //           return networkResponse;
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         });
  //       return response || fetchPromise;
  //     });
  //   })
  // );
});

self.addEventListener("sync", (event) => {
  //
});

self.addEventListener("push", (event) => {
  //
});

self.addEventListener("notificationclick", (event) => {
  //
});

self.addEventListener("backgroundfetchsuccess", (event) => {
  //
});

self.addEventListener("backgroundfetchclick", (event) => {
  //
});

self.addEventListener("backgroundfetchfail", (event) => {
  //
});

const checkIfDBExist = async () => {
  const db = new IndexDataBase("ServiceWorkerAsyncStorage", version, "data");
  return await db.getLocalData("pushNotification");
};

const createDB = async () => {
  const db = new IndexDataBase("ServiceWorkerAsyncStorage", version, "data");
  await db.addLocalData({
    id: "pushNotification",
    ismute: false,
    userId: null,
    browserId: null,
    browserToken: null,
  });

  addServiceWorkerVersion();
};

const addServiceWorkerVersion = async () => {
  const db = new IndexDataBase("ServiceWorkerAsyncStorage", version, "data");
  await db.addLocalData({
    id: "serviceWorkerVersion",
    version: version,
  });
};

const deleteUnusedCachedResources = () => {
  caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cache) => {
        if (!Object.keys(current_cache).includes(cache)) {
          return caches.delete(cache);
        }
      })
    );
  });
};

setInterval(deleteUnusedCachedResources, 1000 * 60 * 60 * 24); // 24 hours
