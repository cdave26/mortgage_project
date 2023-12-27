import React, { useEffect } from "react";
import { useRouter } from "next/router";
import store from "~/store/store";
import { Provider } from "react-redux";
import * as jose from "jose";
import Snackbar from "~/components/snackbar/Snackbar";
import config from "~/config";
import { onRemoveCookies } from "~/plugins/onRemoveCookies";
import Head from "next/head";
import {
  registerServiceWorker,
  beforeinstallpromptEvent,
  appinstalledEvent,
  standalone,
} from "~/plugins/registerServiceWorker";

import "~/src/assets/css/tailwind.css";
import "~/src/assets/css/theme.scss";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
// import { onSetUplistCookies } from "~/plugins/onSetUplistCookies";
import { websockets } from "~/connections";
import {
  formChangeRemove,
  formDialogAlert,
  getChangeForm,
  getDraftsFromByKey,
  removeDraftsFrom,
} from "~/store/ui/action";
import { Button, Modal } from "antd";
import ReactDOM from "react-dom/client";
import Script from "next/script";
const options = {
  broadcaster: "pusher",
  key: config.pusherKey,
  wsHost: config.pusherWshost,
  cluster: config.pusherCluster,
  wsPort: 80,
  wssPort: 443,
  forceTLS: "https",
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  encrypted: true,
};

const windowEvents = ["online", "offline"];

/**
 * Change the exact url to be run
 */
const allowedToRetrieveTheDraft = ["commented-for-now"];

const App = ({ Component, pageProps, token, tmpRedirect, parsedData }) => {
  const router = useRouter();
  const secret = new TextEncoder().encode(process.env.SECURITY_APP);

  const verifyToken = async (token) => {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.userData;
  };

  const fetchData = async () => {
    const user = window.localStorage.getItem("user");
    if (user) {
      parsedData = await verifyToken(user);
      store.dispatch({
        type: "token",
        payload: {
          user: parsedData,
          isAuthenticated: user,
        },
      });

      store.dispatch({
        type: "UI/sidebarMenu",
        payload:
          Number(parsedData.user_type_id) === 2
            ? isCompanyAdmin(
                config.renderSideBarMenu[parsedData.user_type.name],
                parsedData
              )
            : config.renderSideBarMenu[parsedData.user_type.name],
      });
    } else {
      onRemoveCookies();
    }
  };

  /**
   * register service worker
   */
  useEffect(() => {
    standalone();

    registerServiceWorker(store.dispatch, router);

    window.addEventListener("beforeinstallprompt", beforeinstallpromptEvent);
    window.addEventListener("appinstalled", appinstalledEvent);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        beforeinstallpromptEvent
      );
      window.removeEventListener("appinstalled", appinstalledEvent);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  /**
   * Listen to logout login event
   */
  useEffect(() => {
    const channel = new BroadcastChannel("logout-login");
    channel.addEventListener("message", (event) => onLogoutLoginEvent(event));

    return () =>
      channel.removeEventListener("message", (event) =>
        onLogoutLoginEvent(event)
      );
  }, []);

  /**
   * Logout login event
   * @param {MessageEvent} event
   * @returns {void}
   */

  const onLogoutLoginEvent = (event) => {
    if (event.currentTarget.name === "logout-login") {
      //defined all public url root fragments if needed - separate per url position
      const forPath1 = ["calculators"];
      const forPath2 = ["listing", "quick-quote", "agent-listing"];
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());

      const { path: pathName, isLoggedOut } = event.data;

      if (params.res === "verify_email") return;

      if (isLoggedOut) {
        const url = new URL(window.location.href);
        const path = url.pathname.split("/");
        if (forPath1.includes(path[1]) || forPath2.includes(path[2])) {
          window.location.reload();
        } else {
          window.location.href = pathName || "/login";
        }
      }

      event.currentTarget.close();
    }
  };

  useEffect(() => {
    // handles redirect from mail that needs dont have parsedData yet
    if (!parsedData && tmpRedirect) {
      setTimeout(() => {
        window.location.href = tmpRedirect;
      }, 3000);
      return;
    }
    /**
     * Get userData from localstorage for use case like link from email
     */
    if (
      Object.keys(router.query).length &&
      router.query.res === "verify_email" &&
      !token
    ) {
      fetchData();
      return;
    }

    store.dispatch({
      type: "token",
      payload: {
        user: parsedData,
        isAuthenticated: token,
      },
    });

    if (parsedData) {
      store.dispatch({
        type: "UI/sidebarMenu",
        payload:
          Number(parsedData.user_type_id) === 2
            ? isCompanyAdmin(
                config.renderSideBarMenu[parsedData.user_type.name],
                parsedData
              )
            : config.renderSideBarMenu[parsedData.user_type.name],
      });
    }

    // router.push(pathname);
  }, []);

  useEffect(() => {
    // const entries = performance.getEntriesByType("navigation");
    const { ui } = store.getState();
    // if (entries[0].type === "reload" || entries[0].type === "navigate") {
    if (ui.isRendered) {
      store.dispatch({ type: "UI/isRendered", payload: false });
    }
    if (process.env.NODE_ENV === "development") {
      if (parsedData) {
        store.dispatch({
          type: "UI/sidebarMenu",
          payload:
            Number(parsedData.user_type_id) === 2
              ? isCompanyAdmin(
                  config.renderSideBarMenu[parsedData.user_type.name],
                  parsedData
                )
              : config.renderSideBarMenu[parsedData.user_type.name],
        });
      }
    }
    // }
  }, []);

  //handle  back/forward button
  useEffect(() => {
    window.addEventListener("popstate", popState);
    return () => window.removeEventListener("popstate", popState);
  }, []);

  useEffect(() => {
    const { pathname } = new URL(window.location.href);
    const formChange = getChangeForm();
    const { ui } = store.getState();
    let isChange = false;
    if (formChange) {
      const obj = JSON.parse(formChange);
      isChange = obj.isChange;
    }

    const handleStart = (url) => {
      if (pathname === url || isChange || ui.formChange.isChange) return;
      store.dispatch({ type: "UI/isRendered", payload: true });
    };
    const handleComplete = (url) => {
      if (pathname === url || isChange || ui.formChange.isChange) return;

      store.dispatch({ type: "UI/isRendered", payload: false });
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
    };
  }, [router.events]);

  /**
   * Websocket connection
   */
  useEffect(() => {
    // window.Pusher = Pusher;

    if (
      Boolean(
        window.location.hostname === "localhost" ||
          window.location.hostname === "[::1]" ||
          window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
          )
      )
    ) {
      options.forceTLS = false;
      options.wsPort = 6001;
      options.wssPort = 6001;
    }

    /**
     * Uncomment if needs to real time update
     */

    // const echo = new Echo(options);
    // echo
    //   .channel("realtime-update-channel")
    //   .listen("RealTimeUpdateEvent", recievedMessageFromServerSocket);
  }, []);

  /**
   * Recieved data from server socket
   * @param {Object} event
   * @returns {void}
   */
  const recievedMessageFromServerSocket = (event) => {
    if (parsedData) {
      const dataStore = store.getState();
      websockets(parsedData, event, store.dispatch, dataStore, token, router);
    }
  };

  /**
   * Window events
   */

  useEffect(() => {
    windowEvents.forEach((event) => {
      window.addEventListener(event, windowEventsHandler);
    });

    return () => {
      windowEvents.forEach((event) => {
        window.removeEventListener(event, windowEventsHandler);
      });
    };
  }, []);

  /**
   * Listen to window events handler for online and offline
   * @param {Event} event
   * @returns {void}
   */

  const windowEventsHandler = (event) => {
    const dispatcher = (message, description, type) => {
      store.dispatch({
        type: "UI/snackbars",
        payload: {
          open: true,
          message,
          description,
          position: "topRight",
          type,
        },
      });
    };
    if (parsedData) {
      const { type } = event;
      switch (type) {
        case "offline":
          dispatcher(
            "You are offline",
            "Your connection is lost, please check your internet connection",
            "error"
          );
          break;
        case "online":
          dispatcher("Restore", "Your connection is restored", "success");
          /**
           * TODO: process the data that is not sent to the server
           */

          break;

        default:
          break;
      }
    }
  };

  /**
   * Check if company is login
   * @param {Array} arr
   * @param {Object} user
   * @returns {Array} - return new set of array
   */

  const isCompanyAdmin = (arr, user) => {
    return arr.map((item) => {
      if (item.label === "Company Settings") {
        item.link = "/company/" + user.company.id;
      }

      return item;
    });
  };

  const popState = (event) => {
    event.preventDefault();
    const formChange = getChangeForm();
    const { ui } = store.getState();
    if (formChange || ui.formChange.isChange) {
      const obj = JSON.parse(formChange);
      if ((obj && obj.isChange) || ui.formChange.isChange) {
        /**
         * change the allowedToRetrieveTheDraft array to be run
         */
        if (
          obj &&
          obj.isChange &&
          allowedToRetrieveTheDraft.includes(obj.url.split("/")[1])
        ) {
          const modal = document.createElement("div");
          modal.id = "popsate-modal";
          const root = ReactDOM.createRoot(modal);
          root.render(
            <Modal
              closable={false}
              open={true}
              className="confirmation"
              footer={null}
              centered
            >
              <div style={{ marginBottom: "25px", paddingBottom: "5px" }}>
                <div
                  className="flex justify-start items-center relative"
                  style={{ gap: "15px" }}
                >
                  <div className="w-5 h-5 absolute top-1">
                    <img
                      className="relative w-full h-full"
                      src={`${window.location.origin}/icon/questionMarkICon.png`}
                      alt="icon"
                    />
                  </div>
                  <div className="pl-8 relative">
                    <div className="text-error font-sharp-sans-bold text-xl">
                      You are about to discard some changes
                    </div>
                    <div className="text-neutral-2 text-sm font-sharp-sans-medium mt-1">
                      You have made changes. Are you sure that you want to
                      discard changes from the previous form? You will lose all
                      the changes you made.
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="flex justify-end items center"
                style={{ gap: "10px" }}
              >
                <Button
                  className="border border-solid border-xanth rounded-md text-sm font-sharp-sans-semibold pb-1 pt-1.5"
                  style={{ color: "rgba(0, 0, 0, 0.85)" }}
                  onClick={() => {
                    returnToPreviousForm(obj.url.split("/")[1], modal, obj.url);
                  }}
                >
                  Back
                </Button>
                <Button
                  className="bg-error text-neutral-7 font-sharp-sans-semibold text-sm pb-1 pt-1.5 px-1.5"
                  style={{ maxWidth: "100px" }}
                  onClick={() => {
                    dontSave(obj.url.split("/")[1], modal);
                  }}
                >
                  {"Don't Save"}
                </Button>
              </div>
            </Modal>
          );

          if (!document.getElementById("popsate-modal")) {
            document.body.appendChild(modal);
          }
        } else {
          store.dispatch(formDialogAlert(false, false, ""));
          formChangeRemove();
        }
      } else {
        store.dispatch(formDialogAlert(false, false, ""));
        formChangeRemove();
      }
    }

    if (ui.isRendered) {
      store.dispatch({ type: "UI/isRendered", payload: false });
    }
  };

  const dontSave = (key, modal) => {
    if (allowedToRetrieveTheDraft.includes(key)) {
      if (
        document.getElementById("popsate-modal") &&
        document.querySelector(".ant-modal-root")
      ) {
        removeDraftsFrom(key);
        modal.remove();
        document.querySelector(".ant-modal-root").parentElement.remove();
        store.dispatch(formDialogAlert(false, false, ""));
        formChangeRemove();
      }
    }
  };

  const returnToPreviousForm = (key, modal, url) => {
    if (allowedToRetrieveTheDraft.includes(key)) {
      if (
        document.getElementById("popsate-modal") &&
        document.querySelector(".ant-modal-root")
      ) {
        getDraftsFromByKey(key, true);
        modal.remove();
        document.querySelector(".ant-modal-root").parentElement.remove();
        store.dispatch(formDialogAlert(true, false, ""));
        router.push(url);
        store.dispatch({ type: "UI/isRendered", payload: false });
      }
    }
  };

  const handleBeforeUnload = (event) => {
    const formChange = getChangeForm();
    const { ui } = store.getState();
    if (formChange || ui.formChange.isChange) {
      const obj = JSON.parse(formChange);
      if ((obj && obj.isChange) || ui.formChange.isChange) {
        event.preventDefault();
        const confirmationMessage = "Changes you made may not be saved.";
        event.returnValue = confirmationMessage; //standard browsers

        if (obj && obj.isChange) {
          if (allowedToRetrieveTheDraft.includes(obj.url.split("/")[1])) {
            getDraftsFromByKey(obj.url.split("/")[1], false);
          }
        }

        formChangeRemove();
        return confirmationMessage; //for some old browser
      }
    } else {
      formChangeRemove();
    }
  };

  const isBrowser = typeof window !== "undefined";

  return (
    <>
      {process.env.GOOGLE_ANALYTICS && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS}`}
          />
          <Script strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.GOOGLE_ANALYTICS}', {
            page_path: window.location.pathname,
          });
        `}
          </Script>
        </>
      )}
      <Head>
        {isBrowser && (
          <>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <meta http-equiv="x-dns-prefetch-control" content="on" />
            <meta name="url" content={`${window.location.origin}`} />
            <link rel="canonical" content={`${window.location.origin}`} />
            <link rel="dns-prefetch" content={`${window.location.origin}`} />
            <link rel="dns-prefetch" content={`https://stripe.com/`} />
            <link
              rel="preconnect"
              content={`https://stripe.com/`}
              crossorigin
            />
            <meta name="author" content="Uplist" />
            <meta name="keywords" content="Uplist" />
            <meta name="description" content="Uplist" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="Uplist" />
            <meta property="og:description" content="Uplist" />
            <meta
              property="og:image"
              content={`${window.location.origin}/img/uplist-favicon-x192.png`}
            />
            <meta
              property="og:image:secure_url"
              content={`${window.location.origin}/img/uplist-favicon-x192.png`}
            />
            <link
              rel="manifest"
              href={`${window.location.origin}/manifest.json`}
            />
            <link
              rel="shortcut icon"
              type="image/x-icon"
              href={`${window.location.origin}/img/uplist-favicon-x64.png`}
            />
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href={`${window.location.origin}/img/uplist-favicon-x180.png`}
            />
            <link
              rel="icon"
              sizes="192x192"
              href={`${window.location.origin}/img/uplist-favicon-x192.png`}
            />
            <meta name="apple-mobile-web-app-title" content="Uplist" />
            <meta
              name="apple-mobile-web-app-status-bar-style"
              content="default"
            />
            <meta
              name="msapplication-TileImage"
              href={`${window.location.origin}/img/uplist-favicon-x270.png`}
            />
            <meta name="msapplication-navbutton-color" content="#000000" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="application-name" content="Uplist" />
            <meta name="theme-color" content="#0662C7" />
          </>
        )}
      </Head>
      <Provider store={store}>
        <Component {...pageProps} />
        <Snackbar />
      </Provider>
    </>
  );
};

App.getInitialProps = async ({ ctx }) => {
  let token = null;
  let parsedData = null;
  let tmpRedirect = null;
  const secret = new TextEncoder().encode(process.env.SECURITY_APP);

  if (ctx.req) {
    const { cookies } = ctx.req;
    token = cookies["userData"] ? cookies["userData"] : null;
    tmpRedirect = cookies["tmpRedirect"] ? cookies["tmpRedirect"] : null;

    if (token) {
      const { payload } = await jose.jwtVerify(token, secret);
      parsedData = payload.userData;
    }
  }

  return {
    token,
    tmpRedirect,
    parsedData: parsedData
      ? {
          ...parsedData,
          user_type_id:
            typeof parsedData.user_type_id === "string"
              ? Number(parsedData.user_type_id)
              : parsedData.user_type_id,
        }
      : parsedData,
  };
};

export default App;
