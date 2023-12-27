import { uplistApi } from "~/utils/api-handler";

const prefix = "/api/listings";

/**
 * Get all listings for export CSV
 * @param {String} search
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getAllListingsApi = (search, signal) => {
  return uplistApi.get(`${prefix}/all?search=${search}`, { signal });
};

/**
 * Get listings
 * @param {Number} id
 * @param {Number} page
 * @param {Number} limit
 * @param {AbortSignal} signal
 * @param {String} search
 * @param {String} sortBy
 * @param {String} order
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getListingsApi = (page, limit, signal, search, sortBy, order) => {
  return uplistApi.get(
    `${prefix}/${page}/${limit}?search=${search}&sortBy=${sortBy}&order=${order}`,
    { signal }
  );
};

/**
 * Create Listing
 * @param {Object} listing
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const createListingAPI = (listing, signal) =>
  uplistApi.post(`${prefix}`, listing, { signal });

/**
 * Get Listing by id
 * @param {Number} id
 * @param {AbortSignal} signal
 */
export const getListingByIdAPI = (id, signal) =>
  uplistApi.get(`${prefix}/${id}`, { signal });

/**
 * Update Listing
 * @param {Number} id
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const updateListingAPI = (id, body, signal) =>
  uplistApi.put(`${prefix}/${id}`, body, { signal });

/**
 * Delete Listing
 * @param {Number} id
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const deleteListingAPI = (id, signal) =>
  uplistApi.delete(`${prefix}/${id}`, { signal });

/**
 * Get activity logs per listing
 * @param {Number} listingId
 * @param {Number} page
 * @param {Number} limit
 * @param {AbortSignal} signal
 * @param {String} sortBy
 * @param {String} order
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getListingActivityLogsAPI = (
  listingId,
  page,
  limit,
  signal,
  sortBy,
  order
) => {
  return uplistApi.get(
    `${prefix}/activity-logs/${listingId}/${page}/${limit}?sortBy=${sortBy}&order=${order}`,
    { signal }
  );
};

/**
 * Send Live in Home Rates inquiry email
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const sendLiveInHomeRatesInquiryAPI = (body, signal) =>
  uplistApi.post(`/api/live-in-home-rates-inquiry`, body, { signal });
