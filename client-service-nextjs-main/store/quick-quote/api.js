import { uplistApi } from "~/utils/api-handler";

/**
 * Get rate provider from OB
 * @param {Number} id
 * @param {AbortSignal} signal
 */
export const getQuickQuoteApi = (body, signal) =>
  uplistApi.post(`/api/get-rate-provider`, body, { signal });

/**
 * Get rate provider from OB for public quote
 * @param {Number} id
 * @param {AbortSignal} signal
 */
export const getPublicQuickQuoteApi = (body, signal) =>
  uplistApi.post(`/api/get-public-rate-provider`, body, { signal });


