import { uplistApi } from '~/utils/api-handler';

const prefix = '/api/buyers/pre-approval-requests';

/**
 * Create Buyer
 * @param {Object} details
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const requestBuyerPreApprovalPaymentAPI = (details, signal) =>
  uplistApi.post(prefix, details, { signal });

/**
 * Get Payment Details
 * @param {Object} details
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const fetchBuyerPreApprovalPaymentAPI = (details, signal) =>
  uplistApi.get(`${prefix}/get-payments`, { params: details, signal });

/**
 * Get Payment Details
 * @param {Object} details
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const sendEmailAPI = (details, signal) =>
  uplistApi.post(`${prefix}/send-email`, details, { signal });
