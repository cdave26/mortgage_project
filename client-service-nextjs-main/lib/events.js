const regex = /^\+?\d*$/;

/**
 * Months and years
 * @param {Event} event
 * @param {String} name
 * @returns {void}
 */
export const monthsYears = (event, name, isMoth) => {
  if (event.type !== "keydown") return;
  if (event.target.name === name) {
    if (
      event.key === "Backspace" ||
      event.key === "Delete" ||
      ((event.ctrlKey || event.metaKey) && event.key === "c") ||
      ((event.ctrlKey || event.metaKey) && event.key === "a") ||
      (event.shiftKey && event.key === "ArrowLeft") ||
      (event.shiftKey && event.key === "ArrowRight") ||
      event.key === "ArrowRight" ||
      event.key === "ArrowLeft" ||
      event.key === "Tab"
    )
      return;
    if (
      event.key === "-" ||
      event.key === "+" ||
      event.key === "." ||
      event.key === ","
    ) {
      event.preventDefault();
    }

    if (isMoth) {
      if (event.target.value.length >= 3) {
        event.preventDefault();
      }
      return;
    }

    if (event.target.value.length >= 2) {
      event.preventDefault();
    }
  }
};

/**
 * Percent
 * @param {Event} event
 * @param {String} name
 * @returns {void}
 */

export const onPercent = (event, name, allowedNegative) => {
  if (event.type !== "keydown") return;

  if (event.target.name === name) {
    if (
      event.key === "Backspace" ||
      event.key === "Delete" ||
      ((event.ctrlKey || event.metaKey) && event.key === "c") ||
      ((event.ctrlKey || event.metaKey) && event.key === "a") ||
      (event.shiftKey && event.key === "ArrowLeft") ||
      (event.shiftKey && event.key === "ArrowRight") ||
      event.key === "ArrowRight" ||
      event.key === "ArrowLeft" ||
      event.key === "Tab"
    )
      return;

    if (allowedNegative && event.key === "-") {
      return;
    }

    if (event.key === "-" || event.key === "+" || event.key === ",") {
      event.preventDefault();
    }
    const hasDecimal = event.target.value.includes(".");

    if (
      /[0-9]/.test(event.key) ||
      (event.key === "." && !hasDecimal) ||
      (hasDecimal && event.target.value.split(".")[1].length < 3)
    ) {
      if (
        event.target.value.split(".")[1] &&
        event.target.value.split(".")[1].length === 3
      ) {
        event.preventDefault();
      }
      return;
    }
    event.preventDefault();
  }
};

/**
 * Process the submit object to remove commas and convert to float
 * @param {Object} calc
 * @returns {Object}
 */
export const commaAndDecimal = (calc) => {
  return JSON.parse(
    JSON.stringify(calc, (_, value) => {
      if (typeof value === "string" && value.includes(",")) {
        return value.replace(/,/g, "");
      }
      return value;
    }),
    (_, value) => {
      if (typeof value === "string" && value.includes(".")) {
        return parseFloat(value);
      }
      return value;
    }
  );
};

/**
 * Mobile number validation, user not allowed to enter letters
 *  @param {Event} event
 * @returns {void}
 *
 */

export const onMobileNumber = (event) => {
  if (
    event.key === "Backspace" ||
    event.key === "Delete" ||
    ((event.ctrlKey || event.metaKey) && event.key === "c") ||
    ((event.ctrlKey || event.metaKey) && event.key === "a") ||
    (event.shiftKey && event.key === "ArrowLeft") ||
    (event.shiftKey && event.key === "ArrowRight") ||
    event.key === "ArrowRight" ||
    event.key === "ArrowLeft" ||
    event.key === "Tab" ||
    event.key === "Home" ||
    event.key === "End" ||
    (event.ctrlKey && event.key === "v")
  )
    return;

  if (event.key === "(" || event.key === ")" || event.key === "-") return;

  if (
    !(
      /(?<!\+1)\s/g.test(event.key) ||
      /^[0-9]$/.test(event.key) ||
      regex.test(event.key)
    )
  ) {
    event.preventDefault();
  }
};
