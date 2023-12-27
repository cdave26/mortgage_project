export const addCommas = (num, result) => {
  let formattedDecimal;
  if (/^\d+\.\d+$/.test(num)) {
    formattedDecimal = parseFloat(num).toLocaleString(undefined, {
      minimumFractionDigits: result ? 2 : 1,
    });
  } else if (/^\d+$/.test(num)) {
    formattedDecimal = parseInt(num).toLocaleString();

    if (result) {
      formattedDecimal = parseFloat(num).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      });
    }
  } else {
    formattedDecimal = num;
  }
  return formattedDecimal;
};

/**
 * Remove commas from a number
 * @param {String} num
 * @returns {String}
 */
export const removeCommas = (num) => {
  return num.toString().replace(/,/g, "");
};

/**
 * Check if the number is negative
 * @param {Number} num
 * @returns {String}
 */
export const checkNegative = (num) => {
  const result = parseFloat(num).toFixed(2);
  const negative = result.startsWith("-");
  if (negative) {
    const removeNegative = result.replace(/-/g, "");
    return `($${addCommas(removeNegative, true)})`;
  } else {
    return `$${addCommas(result, true)}`;
  }
};

/**
 * Removes non existing decimal digits
 * @param {Number} num
 * @returns {String}
 */
export const removeDecimal = (number) => {
  const roundedNumber = Math.round(number * 100) / 100;
  return roundedNumber % 1 === 0
    ? roundedNumber.toFixed(0)
    : roundedNumber.toFixed(2);
};

/**
 * Removes non Integers
 * @param {number} num
 * @returns {String}
 */
export const removeNonIntegers = (number) => {
  const numberAsString = String(number);
  return numberAsString.replace(/[^0-9]/g, "");
};

export const parseToDecimal = (num, decimal) => {
  return Number.parseFloat(num).toFixed(decimal);
};

export const parseWholeAmount = (val) =>
  val ? addCommas(parseToDecimal(val, 0).toString()) : val;
