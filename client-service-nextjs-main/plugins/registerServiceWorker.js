/**
 * Register service worker
 * Can perform actions like caching assets, offline support, push notifications, background sync etc.
 * PWAs are installable and live on the user's home screen, without the need for an app store.
 * Can adjust the app's behavior based on the network connection.
 * Can adjust the app's behavior based on the device capabilities.
 * Send push notifications to the user.
 * Send post message to the client.
 * @param {function} dispatch
 * @param {object} router
 * @returns {void}
 */
let deferredPrompt;
export const registerServiceWorker = (dispatch, router) => {
  if (typeof dispatch !== "function") {
    throw new Error("dispatch must be a function");
  }

  if (typeof router !== "object") {
    throw new Error("router must be an object");
  }

  const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === "[::1]" ||
      //127.0.0.1/8 are considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
  );
  const { origin } = new URL(window.location.href);

  if (origin !== window.location.origin) return;

  const swUrl = `${window.location.origin}/sw.js`;

  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    checkValidServiceWorker(swUrl, dispatch, router);
  } else {
    if ("serviceWorker" in navigator) {
      if (isLocalhost) {
        checkValidServiceWorker(swUrl, dispatch, router);
      }
    }
  }
};

const checkValidServiceWorker = async (swUrl, dispatch, router) => {
  try {
    const response = await fetch(swUrl, {
      method: "GET",
      headers: { sw: "script" },
    });
    const contentType = response.headers.get("content-type");
    if (
      response.status === 404 ||
      (contentType !== null && contentType.indexOf("javascript") === -1)
    ) {
      const registration = await navigator.serviceWorker.register(swUrl);
      registration.unregister().then(() => {
        console.log(
          process.env.NODE_ENV === "development"
            ? "Service worker unregister"
            : null
        );
      });
    } else {
      registerValidServiceWorker(swUrl, dispatch, router);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log(`Error: ${error}`);
    }
  }
};

/**valid service worker */
const registerValidServiceWorker = async (swUrl, dispatch, router) => {
  try {
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: "/",
    });

    registration.onupdatefound = () => {
      const installWorker = registration.installing;
      if (installWorker === null) {
        return;
      }
      installWorker.onstatechange = () => {
        if (
          installWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          registration.active.postMessage({
            channelName: "skipWaiting",
          });
          dispatch({
            type: "UI/snackbars",
            payload: {
              open: true,
              message: "App updated.",
              description: "New content is available; please refresh.",
              position: "topRight",
              type: "success",
            },
          });
          //for browser
          setTimeout(() => {
            location.reload(true);
          }, 900);
          //for nextjs
          setTimeout(() => {
            router.reload();
          }, 4000);

          // if ("Notification" in window) {
          //   if (Notification.permission === "granted") {
          //     navigator.serviceWorker.ready.then((registration) => {
          //       registration.showNotification("Uplist", {
          //         body: "This site has been updated in the background.",
          //         icon: "/img/uplist_wordmark.png",
          //         image: "/img/uplist_wordmark.png",
          //         silent: false,
          //         vibrate: [200, 100, 200],
          //         tag: "new-version",
          //         renotify: true,
          //       });
          //     });
          //   } else if (Notification.permission !== "denied") {
          //     if (process.env.NODE_ENV === "development") {
          //       Notification.requestPermission().then((permission) => {
          //         if (permission === "granted") {
          //           const notification = new Notification(
          //             "Allow notifications"
          //           );
          //         }
          //       });
          //     }
          //   }
          // }
        }

        if (installWorker.state === "activated") {
          pushManager(registration);
        }

        if (installWorker.state === "activated") {
          /**
           * Todo: add IndexDB
           *
           */
        }
      };
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log(`Error: ${error}`);
    }
  }
};

const pushManager = async (registration) => {
  try {
    const response = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BEFPqpNmD4iKXqZM3EQfFIhNDblMnJJg-fzUCoZRrf6yJcnuzplrKJE2BO-4Bo5gdJ9FJqKOsDYPApKQFh-4kwA"
      ),
    });
    /**
     * TODO:
     * Push notification subscription details
     * Create and api endpoint to save the subscription details.
     * Send the subscription details to the backen using the Fetch / axios.
     */
    console.log("push manager", response);
  } catch (error) {
    console.log("push manager", error);
  }
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const beforeinstallpromptEvent = (event) => {
  event.preventDefault();
  deferredPrompt = event;
};

export const appinstalledEvent = (event) => {
  console.log("appinstalledEvent", event);
  // Log install to analytics
  console.log("INSTALL: Success");
  // pwainstallBtn.style.display = 'none';
};

export const standalone = () => {
  const evt = window.matchMedia("(display-mode: standalone)");
  let displayMode = "browser tab";
  if (evt.matches) {
    displayMode = "standalone";
  }
};
