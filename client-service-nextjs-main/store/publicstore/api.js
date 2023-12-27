import { uplistApi } from "~/utils/api-handler";

/**
 * Get Public Listing by id
 * @param {Number} id
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getPublicListingAPI = (id, mlsNumber, signal) =>
  uplistApi.get(`/api/listing/${id}/mls-number/${mlsNumber}`, { signal });

/**
 * Get payments from OB
 * @param {Number} id
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getListingGetPaymentsAPI = (id, body, signal) =>
  uplistApi.post(`/api/listing/${id}/get-payments`, body, { signal });

/**
 * Send public quick quote inquiry
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const sendQuickQuoteInquiryAPI = (body, signal) =>
  uplistApi.post(`/api/public-quick-quote-inquiry`, body, { signal });

/**
 * Send agent listing inquiry
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const sendAgentListingInquiryAPI = (body, signal) =>
  uplistApi.post(`/api/agent-listing-inquiry`, body, { signal });

/**
 * reCaptcha verification
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const verifyReCaptcha = (body, signal) =>
  uplistApi.post("/api/verify-recaptcha", body, { signal });
