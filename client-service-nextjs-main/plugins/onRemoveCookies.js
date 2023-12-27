import JsPbkdf2 from "js-pbkdf2";
import config from "~/config";
import { getCookie, logout } from "~/store/auth/api";

/**
 * Handle to remove cookies
 *
 * @returns {Promise<void>}
 */
export const onRemoveCookies = async (redirectTo = "/login") => {
  /**
   * request new cookie
   * then revoke cookie
   * before removing localstorage
   * and redirect to login page
   */
  const handleLogout = () => {
    const pathName = localStorage.getItem("login");

    getCookie().then(() => {
      logout().then(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("subMenu");
        localStorage.removeItem("login");
        localStorage.removeItem("viewProfile");

        if ("serviceWorker" in navigator) {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              channelName: "logout-login",
              message: {
                isLoggedOut: true,
                path: pathName,
              },
            });
          }
        }
        window.location.href = redirectTo;
      });
    });
  };

  try {
    const jsPbkdf2 = new JsPbkdf2(window.crypto);
    const encrypt = await jsPbkdf2.encryptData(
      config.securityApp,
      JSON.stringify({ key: "uplist-key-logout" })
    );

    const response = await fetch(`${window.location.origin}/api/set`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uplist: encrypt,
      }),
    });

    if (response.status == 200) {
      handleLogout();
    }
  } catch (error) {
    console.log(error);
    handleLogout();
  }
};
