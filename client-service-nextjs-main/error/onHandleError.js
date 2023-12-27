import { onRemoveCookies } from "~/plugins/onRemoveCookies";
import Router from "next/router";
/**
 * Handle All Error
 * @param {AxiosError} error
 * @param {Function} dispatch
 * @returns {void} void
 */

export const checkPath = (path) => {
  return path
    ? setTimeout(() => Router.push(path), 1500)
    : setTimeout(() => (window.location.href = "/"), 1500);
};

export const onHandleError = (error, dispatch, message = null, path = null) => {
  console.log("errpr", error);
  if (error.response) {
    switch (error.response.status) {
      case 403:
        createElementsToDom(error.response.status);
        // onDispatchError(
        //   dispatch,
        //   "Error",
        //   message ? message : error.response.data.message
        // );
        // checkPath(path);
        break;
      case 404:
        createElementsToDom(error.response.status);
        // onDispatchError(
        //   dispatch,
        //   "Error",
        //   message ? message : error.response.data.message
        // );
        // checkPath(path);
        break;
      case 429:
        onDispatchError(
          dispatch,
          "Error",
          "You have sent too many requests. Please try again after a minute."
        );
        break;
      case 422:
        onDispatchError(
          dispatch,
          "Error",
          message ? message : error.response.data.message
        );
        break;
      case 503:
        onDispatchError(dispatch, "Error", "Down for maintenance");
        break;
      case 500:
        onDispatchError(dispatch, "Error", "Internal server error");
        break;
      case 400: // Already authenticated
        onRemoveCookies();
        onDispatchError(dispatch, "Error", "Already Authenticated");
        break;
      case 401: // HTTP_UNAUTHORIZED
      case 419: // HTTP_PAGE_EXPIRED
        onDispatchError(
          dispatch,
          "Error",
          message || error.response.data.message
        );
        onRemoveCookies();
        break;
      default:
        onDispatchError(
          dispatch,
          "Error",
          "An error occured. Please try again"
        );
        break;
    }
  } else if (error.request) {
    console.log("REQ_ERR: ", error);
    onDispatchError(
      dispatch,
      "Network",
      error.message ?? "An error occured. Please try again."
    );
  } else {
    console.log("ERR: ", error);
    onDispatchError(dispatch, "Error", "An error occured. Please try again.");
  }
};

/**
 *  Helper function for dispatching error
 * @param {Function} dispatch
 * @param {String} message
 * @param {String} description
 * @returns {void} void
 */

export const onDispatchError = (dispatch, message, description) => {
  dispatch({
    type: "UI/snackbars",
    payload: {
      open: true,
      message,
      description,
      position: "topRight",
      type: "error",
    },
  });
};

/**
 * Helper function for creating elements to DOM
 * DOM Manipulation
 * @param {Number} statusCode
 * @returns {void} void
 */

export const createElementsToDom = (statusCode) => {
  const container = document.querySelector("#_ant-spin-container_");
  if (container) {
    const removeElement = container.querySelector("#_layout-wrapper_");
    if (removeElement) {
      removeElement.remove();
      document.title = "404 - Page Not Found";
      const firstElement = container.querySelector(".ant-spin-container");
      const element = `<div class="container"><h1 class="animated-text">404</h1><div class="mb-6"><p class="animated-text">The page you're looking for couldn't be found.</p></div><div><a label="Return" href="/" class="ant-btn css-dev-only-do-not-override-txh9fw ant-btn-link bg-buyer border-buyer text-neutral-1 font-sharp-sans-semibold h-full whitespace-normal break-all border-2 rounded-lg px-5 py-2 bg-xanth border-xanth text-base"><span>Return</span></a></div></div>`;
      firstElement.insertAdjacentHTML("beforeend", element);
    }
  }
};
