import { uplistApi } from "~/utils/api-handler";

const prefix = "/api/buyers";
const registrationPrefix = "/api/borrowers/register";
const optimalBluePrefix = "/api/optimal-blue";
/**
 * Create Buyer
 * @param {Object} listing
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const createBuyerAPI = (buyer, signal) =>
  uplistApi.post(`${prefix}`, buyer, { signal });

/**
 * Get Buyers list
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getBuyersListAPI = (signal) =>
  uplistApi.get(prefix, {
    signal,
  });

/**
 * Get Buyers list (for csv)
 * @param {Object} pageDetails
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getAllBuyersListAPI = (buyerPageInfo, signal) =>
  uplistApi.get(`${prefix}/all`, { params: buyerPageInfo, signal });

/**
 * Update Buyer
 * @param {Object} listing
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const updateBuyerAPI = (buyer, signal) =>
  uplistApi.put(`${prefix}/${buyer.buyer_id}`, buyer, { signal });

/**
 * Delete Buyer
 * @param {Number} buyerId
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const deleteBuyerAPI = (buyerId, body, signal) => {
  return uplistApi.delete(`${prefix}/${buyerId}`, body, {
    signal,
  });
};

/**
 * Get Buyers list
 * @param {Number} buyerId
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getBuyerAPI = (buyerId, signal) => {
  return uplistApi.get(`${prefix}/${buyerId}`, {
    signal,
  });
};

/**
 * Get Buyers list
 * @param {Object} pageDetails
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getBuyerPageAPI = (buyerPageInfo, signal) => {
  return uplistApi.get(`${prefix}`, {
    params: buyerPageInfo,
    signal,
  });
};

/**
 * Register Buyer
 * @param {Object} buyerDetails
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const registerBuyerAPI = (buyerDetails, signal) => {
  return uplistApi.post(`${registrationPrefix}`, buyerDetails, { signal });
};

/**
 * Register Buyer
 * @param {Object} buyerDetails
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const syncBuyerOBAPI = (loanID, signal) => {
  return uplistApi.get(`${optimalBluePrefix}/pipeline/loans/${loanID}`, {
    signal,
  });
};
