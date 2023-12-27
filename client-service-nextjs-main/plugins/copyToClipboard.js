/**
 * All the functions in this file is used for copy to clipboard
 */

/**
 * Copy text to clipboard
 * @param {String} text
 * @param {Function | Null} func
 * @returns {void}
 */
export const clipboardWriteText = (text, func = null) => {
  if (!navigator.clipboard) {
    throw new Error("Clipboard not supported");
  }

  if (text === "") {
    throw new Error("Cannot copy empty text");
  }

  if (text === undefined || text === null) {
    throw new Error("Cannot copy undefined or null text");
  }

  if (typeof text !== "string") {
    throw new Error("Text must be a string");
  }

  if (func) {
    if (typeof func !== "function") {
      throw new Error("func must be a function");
    }
  }

  navigator.clipboard.writeText(text).then(
    () => {
      func({
        type: "UI/snackbars",
        payload: {
          open: true,
          message: "Copied",
          description: "Copied to clipboard",
          position: "topRight",
          type: "success",
        },
      });
    },
    () => {
      func({
        type: "UI/snackbars",
        payload: {
          open: true,
          message: "Error",
          description: "An error to copy to clipboard",
          position: "topRight",
          type: "error",
        },
      });
    }
  );
};
