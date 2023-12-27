const pattern = new RegExp(
  "^(https?:\\/\\/)?" +
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
    "((\\d{1,3}\\.){3}\\d{1,3}))" +
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
    "(\\?[;&a-z\\d%_.~+=-]*)?" +
    "(\\#[-a-z\\d_]*)?$",
  "i"
);

/**
 * Automate URL
 * @param {String} value
 * @param {String} name
 * @param {Object} form
 * @param {Boolean} isRequired
 * @returns {void}
 */
export const automateURL = (value, form, name, isRequired) => {
  if (typeof form !== "object") {
    throw new Error("Form must be an object");
  }

  if (typeof name !== "string") {
    throw new Error("Name must be a string");
  }

  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }

  if (typeof isRequired !== "boolean") {
    throw new Error("isRequired must be a boolean");
  }

  if (value) {
    setFields(
      form,
      name,
      validateURL(value),
      !pattern.test(value) ? [`Invalid URL`] : []
    );
  } else {
    if (isRequired) {
      setFields(form, name, value, [`This field is required.`]);
    } else {
      setFields(form, name, value, []);
    }
  }
};

const setFields = (form, name, value, errors) => {
  setTimeout(() => {
    form.setFields([
      {
        name,
        value: value.toLowerCase(),
        errors,
      },
    ]);
  }, 0);
};

/**
 * Validate URL
 * @param {String} url
 * @returns  {String} url
 */
const validateURL = (url) => {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  } else {
    const protocol = ["https:/", "https:", "https", "http", "htt", "ht", "h"]; // back space
    const startUrl = "https://";
    if (protocol.includes(url)) {
      return url;
    } else {
      return startUrl + url;
    }
  }
};
