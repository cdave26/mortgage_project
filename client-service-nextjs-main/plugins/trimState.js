/**
 * Trim the state
 * @param {String} state
 * @returns {String} - trimmed state
 */

export const trimTheState = (state) =>
  state.replace(/^[A-Za-z]{2}\s-\s/, '').trim();
