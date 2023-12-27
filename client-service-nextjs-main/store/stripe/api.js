import { uplistApi } from "~/utils/api-handler";

/**
 * Stripe Checkout Data
 *
 * @param {string} data
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const postCheckout = (data, signal) => {
  return uplistApi.post("/api/stripe/checkout", data, { signal });
};

/**
 * Handle contact processing for Stripe Payment Type 1 flow
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const processContact = (body, signal) => {
  return uplistApi.post("/api/process-contact", body, { signal });
};

/**
 * Handle success stripe checkout
 * Handle contact processing for Stripe Payment Type 2 flow
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const successCheckout = (body, signal) => {
  return uplistApi.post("/api/stripe/success-checkout", body, { signal });
};

/**
 * Handle contact processing for Stripe Payment Type 3 flow
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const processHubspotWithoutContact = (body, signal) => {
  return uplistApi.post("/api/process-hubspot-without-contact", body, {
    signal,
  });
};
