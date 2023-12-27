import JsPbkdf2 from "js-pbkdf2";
import config from "~/config";
import { getCookie, logout } from "~/store/auth/api";

/**
 * Handle to set Uplist userdata cookie
 *
 * @param {String} token
 * @param {Boolean | Null} optionals
 * @returns {Promise<void>}
 */
export const onSetUplistCookies = async (
  token,
  optionals = null,
  isbuyer = false
) => {
  const jsPbkdf2 = new JsPbkdf2(window.crypto);

  try {
    const encrypt = await jsPbkdf2.encryptData(
      config.securityApp,
      JSON.stringify({
        key: "uplist-key-login",
        user: token,
      })
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

    if (response.status === 200) {
      if (optionals) return;
      const redirect = isbuyer ? "/buyer" : "/";
      window.location.href = redirect;
    }
  } catch (error) {
    console.log(error);
    /**
     * request new cookie
     * then revoke cookie
     * before removing localstorage
     * and redirect to login page
     */
    getCookie().then(() => {
      logout().then(() => {
        window.localStorage.removeItem("user");
        window.location.href = isbuyer ? "/buyer/register" : "/login";
      });
    });
  }
};
